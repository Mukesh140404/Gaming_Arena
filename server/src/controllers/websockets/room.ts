import WebSocket from "ws"
import { db } from "../../db/index.js";
import { roomPlayers } from "../../db/schema/roomPlayers.js";
import { and, eq, ne } from "drizzle-orm";
import { users } from "../../db/schema/users.js";

const connections = new Map();

export const ConnectTheClient = (
  socket: WebSocket,
  userId: string
): string => {
  connections.set(userId, socket);
  return userId;
};

// export const DisconnectTheClient = (clientId:string) => {
//   connections.delete(clientId);
// };

// export const createRoom = (host:string) => {
//   const roomId = `Room${roomCount}`;
//   roomCount = roomCount + 1;
//   rooms.set(roomId, {
//     host: host,
//     users: new Array(host),
//   });
//   return roomId;
// };

// export const getRoom = (roomId:string) => {
//   const room = rooms.get(roomId);
//   if (!room) return;
//   return { ...room, userCount: room.users.length };
// };

export const joinRoom = async (userId: string, roomId: string) => {
  const usersArray = await db
    .select()
    .from(roomPlayers)
    .where(eq(roomPlayers.roomId, roomId))

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))

  usersArray.forEach((u) => {
    const socket = connections.get(u.userId);
    socket.send(
      JSON.stringify({
        type: "notify",
        message: `${user.name} join the room`,
        roomChat: true,
      }),
    );
  });
  return roomId;
};

export const leaveRoom = async (userId: string, roomId: string) => {
  const usersArray = await db
    .select()
    .from(roomPlayers)
    .where(
      and(
        eq(roomPlayers.roomId, roomId),
        ne(roomPlayers.userId, userId),
        eq(roomPlayers.status, "active")
      )
    )

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
  usersArray.forEach((u) => {
    const socket = connections.get(u.userId);
    socket.send(
      JSON.stringify({
        type: "notify",
        message: `${user.name} leave the room`,
        roomChat: true,
      }),
    );
  });
};

export const chatOnRoom = async (roomId: string, userId: string, message: string) => {
  // const room = rooms.get(roomId);
  // if (!room) return;
  // const roomUsers = room.users;
  // if (!roomUsers.includes(user)) return;
  const usersArray = await db
    .select()
    .from(roomPlayers)
    .where(eq(roomPlayers.roomId, roomId))

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))

  usersArray.forEach((u) => {
    const socket = connections.get(u);
    socket.send(
      JSON.stringify({
        type: "message",
        message,
        roomChat: true,
        from: user,
      }),
    );
  });
};
