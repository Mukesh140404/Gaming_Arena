import WebSocket from "ws"
import { db } from "../../db/index";
import { roomPlayers } from "../../db/schema/roomPlayers";
import { and, eq, ne } from "drizzle-orm";
import { users } from "../../db/schema/users";

const connections = new Map<string, WebSocket>();

export const ConnectTheClient = (
  socket: WebSocket,
  userId: string
): string => {
  connections.set(userId, socket);
  return userId;
};

// Called once when a socket closes. No timers, no polling.
// Called once when a socket closes. No timers, no polling.
export const handleUserDisconnect = async (userId: string, socket: WebSocket) => {
  // If a newer socket replaced this one (refresh / second tab), the user has not left
  if (connections.get(userId) !== socket) return;

  connections.delete(userId);

  // Mark the user as left in every room where they are still active
  const activeRows = await db
    .select()
    .from(roomPlayers)
    .where(and(eq(roomPlayers.userId, userId), eq(roomPlayers.status, "active")));

  for (const row of activeRows) {
    await db
      .update(roomPlayers)
      .set({ status: "left" }) // use the value your schema uses for "left"
      .where(eq(roomPlayers.id, row.id));

    // Tell the remaining players (chat message + refetch trigger)
    await leaveRoom(userId, row.roomId);
    const others = await getActivePlayers(row.roomId);
    others.forEach((p) =>
      sendTo(p.userId, { type: "room-updated", roomId: row.roomId }),
    );
  }
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

  const players = await getActivePlayers(roomId);

  const user = await getUser(userId);

  players
    .filter((p) => p.userId !== userId)
    .forEach((p) => {
      sendTo(p.userId, {
        type: "notify",
        roomChat: true,
        roomId,
        message: `${user.name} joined the room`,
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

export const leaveRoom = async (userId: string, roomId: string) => {
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


