import { wsServer } from "./index.js";
import {
  ConnectTheClient,
  // DisconnectTheClient,
  // createRoom,
  // getRoom,
  joinRoom,
  leaveRoom,
  chatOnRoom,
} from "../src/controllers/websockets/room.js";
import { verifyToken } from "./utils/jwt.js";

wsServer.on("connection", (webSocket, request) => {
  const cookies = request.headers.cookie;

  if (!cookies) {
    webSocket.close();
    return;
  }

  const token = cookies
    .split(";")
    .find((cookie) => cookie.trim().startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    webSocket.close();
    return;
  }
  const payload = verifyToken(token);
  const userId = payload.id;
  const ClientConnectionId = ConnectTheClient(webSocket, userId);
  webSocket.send(
    JSON.stringify({
      type: "connection-id",
      connectionId: ClientConnectionId,
    }),
  );
  console.log(`Client ${ClientConnectionId} is connected`);

  webSocket.on("message", (data) => {
    const rawData = JSON.parse(data.toString());

    const messageType = rawData.type;

    switch (messageType) {
      case "create-room":
        // const roomId = createRoom(ClientConnectionId);
        // webSocket.send(
        //   JSON.stringify({
        //     type: "room-created",
        //     roomId,
        //   }),
        // );
        break;
      case "join-room":
        joinRoom(ClientConnectionId, rawData.roomId);
        webSocket.send(
          JSON.stringify({
            type: "room-joined",
            roomId: rawData.roomId,
          }),
        );
        break;
      case "get-room":
        // const room = getRoom(rawData.roomId);
        // webSocket.send(
        //   JSON.stringify({
        //     type: "get-room",
        //     room,
        //   }),
        // );
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
                roomChat: false,
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
    // DisconnectTheClient(ClientConnectionId);
    wsServer.clients.forEach((client) => {
      client.send(`Client ${ClientConnectionId} is disconnected`);
    });
  });
});