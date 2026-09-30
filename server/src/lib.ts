import WebSocket from "ws"

const connections = new Map();
const rooms = new Map();
let roomCount:number = 1;

export const ConnectTheClient = (socket:WebSocket, num:number) => {
  connections.set(`C${num}`, socket);
  return `C${num}`;
};

export const DisconnectTheClient = (clientId:string) => {
  connections.delete(clientId);
};

export const createRoom = (host:string) => {
  const roomId = `Room${roomCount}`;
  roomCount = roomCount + 1;
  rooms.set(roomId, {
    host: host,
    users: new Array(host),
  });
  return roomId;
};

export const getRoom = (roomId:string) => {
  const room = rooms.get(roomId);
  if (!room) return;
  return { ...room, userCount: room.users.length };
};

export const joinRoom = (user:string, roomId:string) => {
  const room = rooms.get(roomId);
  if (!room) return;
  const usersArray = room.users;
  if (usersArray.includes(user)) return;
  usersArray.push(user);
  usersArray.forEach((u:string) => {
    const socket = connections.get(u);
    socket.send(
      JSON.stringify({
        type: "notify",
        message: `${user} join the room`,
        roomChat: true,
      }),
    );
  });
  return roomId;
};

export const leaveRoom = (user:string, roomId:string) => {
  const room = rooms.get(roomId);
  if (!room) return;
  const usersArray = room.users;
  if (!usersArray.includes(user)) return;
  const userIndex = usersArray.indexOf(user);
  if (userIndex === -1) return;
  usersArray.splice(userIndex, 1);
  usersArray.forEach((u:string) => {
    const socket = connections.get(u);
    socket.send(
      JSON.stringify({
        type: "notify",
        message: `${user} leave the room`,
        roomChat: true,
      }),
    );
  });
};

export const chatOnRoom = (roomId:string, user:string, message:string) => {
  const room = rooms.get(roomId);
  if (!room) return;
  const roomUsers = room.users;
  if (!roomUsers.includes(user)) return;
  roomUsers.forEach((u:string) => {
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
