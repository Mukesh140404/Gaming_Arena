import { wsServer } from "./index.js";
import {
  ConnectTheClient,
  DisconnectTheClient,
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  chatOnRoom,
} from "../src/lib.js";

let count = 1;

wsServer.on("connection", (webSocket) => {
  const ClientConnectionId = ConnectTheClient(webSocket, count);
  webSocket.send(
    JSON.stringify({
      type: "connection-id",
      connectionId: ClientConnectionId,
    }),
  );
  console.log(`Client ${ClientConnectionId} is connected`);
  count = count + 1;
  webSocket.on("message", (data) => {
    const rawData = JSON.parse(data.toString());

    const messageType = rawData.type;

    switch (messageType) {
      case "create-room":
        const roomId = createRoom(ClientConnectionId);
        webSocket.send(
          JSON.stringify({
            type: "room-created",
            roomId,
          }),
        );
        break;
      case "join-room":
        joinRoom(ClientConnectionId, rawData.roomId);
        webSocket.send(
          JSON.stringify({
            type: "room-joined",
            roomId:rawData.roomId,
          }),
        );
        break;
      case "get-room":
        const room = getRoom(rawData.roomId);
        webSocket.send(
          JSON.stringify({
            type: "get-room",
            room,
          }),
        );
        break;
      case "leave-room":
        leaveRoom(ClientConnectionId, rawData.roomId);
        break;
      case "message":
        if (rawData.roomId) {
          chatOnRoom(rawData.roomId, ClientConnectionId, rawData.message);
        } else {
          wsServer.clients.forEach((client) => {
            client.send(
              JSON.stringify({
                type: "message",
                message: rawData.message,
                roomChat:false,
                from: ClientConnectionId,
              }),
            );
          });
        }
        break;
      default:
        console.log("Invalid case to handle");
    }
  });
  webSocket.on("close", () => {
    console.log(`Client ${ClientConnectionId} is disconnected`);
    DisconnectTheClient(ClientConnectionId);
    wsServer.clients.forEach((client) => {
      client.send(`Client ${ClientConnectionId} is disconnected`);
    });
  });
});