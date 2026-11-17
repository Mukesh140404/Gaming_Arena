import WebSocket from "ws";
import { db } from "../../db/index";
import { roomPlayers } from "../../db/schema/roomPlayers";
import { rooms } from "../../db/schema/rooms";
import { and, eq, ne } from "drizzle-orm";
import { users } from "../../db/schema/users";
import { handlePlayerDisconnectFromGame, sendGameSessionToPlayer } from "./game";

const connections = new Map<string, WebSocket>();
const disconnectTimers = new Map<string, NodeJS.Timeout>();
const DISCONNECT_GRACE_PERIOD_MS = 8000; // 8 seconds grace period for page refresh / transient drops

export const ConnectTheClient = (
  socket: WebSocket,
  userId: string
): string => {
  // Cancel pending disconnect timer if client reconnected within grace period
  const pendingTimer = disconnectTimers.get(userId);
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    disconnectTimers.delete(userId);
  }

  connections.set(userId, socket);
  return userId;
};

export const handleUserDisconnect = (userId: string, socket: WebSocket) => {
  // If a newer socket replaced this one (refresh / second tab), ignore
  if (connections.get(userId) !== socket) return;

  connections.delete(userId);

  if (disconnectTimers.has(userId)) {
    clearTimeout(disconnectTimers.get(userId)!);
  }

  // Delay disconnect actions to allow seamless page refresh / reconnection
  const timer = setTimeout(async () => {
    disconnectTimers.delete(userId);

    // If user has reconnected in the meantime, abort disconnect actions
    if (connections.has(userId)) return;

    // Mark the user as left in every room where they are still active
    const activeRows = await db
      .select()
      .from(roomPlayers)
      .where(and(eq(roomPlayers.userId, userId), eq(roomPlayers.status, "active")));

    for (const row of activeRows) {
      await db
        .update(roomPlayers)
        .set({ status: "left", leftAt: new Date() })
        .where(eq(roomPlayers.id, row.id));

      await leaveRoom(userId, row.roomId);
      handlePlayerDisconnectFromGame(row.roomId, userId);
      const others = await getActivePlayers(row.roomId);
      others.forEach((p) =>
        sendTo(p.userId, { type: "room-updated", roomId: row.roomId }),
      );
    }
  }, DISCONNECT_GRACE_PERIOD_MS);

  disconnectTimers.set(userId, timer);
};

export const DisconnectTheClient = (userId: string, socket: WebSocket) => {
  if (connections.get(userId) === socket) {
    connections.delete(userId);
  }
};

export const sendTo = (userId: string, payload: object) => {
  const socket = connections.get(userId);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

export const sendToMany = (userIds: string[], payload: object) => {
  userIds.forEach((id) => sendTo(id, payload));
};

export const getUser = async (userId: string) => {
  const [user] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.id, userId));
  return user;
};

export const getActivePlayers = (roomId: string) =>
  db
    .select()
    .from(roomPlayers)
    .where(and(eq(roomPlayers.roomId, roomId), eq(roomPlayers.status, "active")));

export const joinRoom = async (userId: string, roomId: string) => {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room || room.status === "finished") return;

  // If user previously left a waiting room, reactivate them so they aren't stuck inactive
  const [existingPlayer] = await db
    .select()
    .from(roomPlayers)
    .where(and(eq(roomPlayers.roomId, roomId), eq(roomPlayers.userId, userId)));

  if (existingPlayer && existingPlayer.status === "left" && room.status === "waiting") {
    await db
      .update(roomPlayers)
      .set({ status: "active", leftAt: null })
      .where(eq(roomPlayers.id, existingPlayer.id));
  }

  // Acknowledge room join to the caller
  sendTo(userId, {
    type: "room-joined",
    roomId,
  });

  // Re-sync game state if this room has an ongoing active match session
  sendGameSessionToPlayer(roomId, userId);

  const players = await getActivePlayers(roomId);
  const user = await getUser(userId);
  if (!user) return;

  players
    .filter((p) => p.userId !== userId)
    .forEach((p) => {
      sendTo(p.userId, {
        type: "notify",
        roomChat: true,
        roomId,
        message: `${user.name} joined the room`,
      });
      sendTo(p.userId, {
        type: "room-updated",
        roomId,
      });
    });
};

export const startGame = async (roomId: string) => {
  const players = await getActivePlayers(roomId);
  players.forEach((p) => {
    sendTo(p.userId, {
      type: "room-game-started",
      roomChat: true,
      roomId,
    });
  });
};

export const resetRoomToLobby = async (userId: string, roomId: string) => {
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) return;

  // Only the host can reset the match session back to lobby
  if (room.hostId !== userId) return;

  await db
    .update(rooms)
    .set({ status: "waiting" })
    .where(eq(rooms.id, roomId))
    .catch((err) => console.error("Error setting room status to waiting:", err));

  const players = await getActivePlayers(roomId);
  players.forEach((p) => {
    sendTo(p.userId, {
      type: "room-reset-to-lobby",
      roomId,
    });
    sendTo(p.userId, {
      type: "room-updated",
      roomId,
    });
  });
};

export const leaveRoom = async (userId: string, roomId: string) => {
  // Update status in DB if not already done
  await db
    .update(roomPlayers)
    .set({ status: "left", leftAt: new Date() })
    .where(and(eq(roomPlayers.roomId, roomId), eq(roomPlayers.userId, userId)))
    .catch(() => {});

  const players = await db
    .select()
    .from(roomPlayers)
    .where(
      and(
        eq(roomPlayers.roomId, roomId),
        ne(roomPlayers.userId, userId),
        eq(roomPlayers.status, "active"),
      ),
    );

  const user = await getUser(userId);
  if (!user) return;
  players.forEach((p) => {
    sendTo(p.userId, {
      type: "notify",
      roomChat: true,
      roomId,
      message: `${user.name} left the room`,
    });
    sendTo(p.userId, {
      type: "room-updated",
      roomId,
    });
  });
};

export const chatOnRoom = async (roomId: string, userId: string, message: string) => {
  const text = String(message ?? "").trim();
  if (!text) return;
  const players = await getActivePlayers(roomId);

  // Only members of the room can chat in it
  if (!players.some((p) => p.userId === userId)) return;
  const user = await getUser(userId);
  if (!user) return;

  players.forEach((p) => {
    sendTo(p.userId, {
      type: "roomChat",
      roomChat: true,
      roomId,
      userId: user.id,
      name: user.name,
      message: text,
      time: Date.now(),
    });
  });
};
