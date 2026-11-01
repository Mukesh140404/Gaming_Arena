import {
  ConnectTheClient,
  // DisconnectTheClient,
  handleUserDisconnect,
  joinRoom,
  leaveRoom,
  chatOnRoom,
  startGame,
} from "./controllers/websockets/room";
import { broadCastMessage } from "./controllers/websockets/brodcast";
import { gameAction, initGame } from "./controllers/websockets/game";
import { verifyToken } from "./utils/jwt";
import type { WebSocketServer } from "ws";

export const registerWebSocketHandlers = (wsServer: WebSocketServer) => {

  wsServer.on("connection", (webSocket, request) => {
    // const cookies = request.headers.cookie;

    // if (!cookies) {
    //   webSocket.close();
    //   return;
    // }

    // const token = cookies
    //   .split(";")
    //   .find((cookie) => cookie.trim().startsWith("token="))
    //   ?.split("=")[1];
    const url = new URL(request.url ?? "", "http://localhost");
const cookieToken = request.headers.cookie
  ?.split(";")
  .find((cookie) => cookie.trim().startsWith("token="))
  ?.split("=")[1];

// Prefer the token from the URL, fall back to the cookie
const token = url.searchParams.get("token") || cookieToken;


    if (!token) {
      webSocket.close();
      return;
    }
    let userId: string;
    try {
      const payload = verifyToken(token);
      userId = payload.id;
    } catch {
      webSocket.close();
      return;
    }
    const ClientConnectionId = ConnectTheClient(webSocket, userId);

    webSocket.on("message", (data) => {
      // const rawData = JSON.parse(data.toString());
      let rawData: any;
  try {
    rawData = JSON.parse(data.toString());
  } catch {
    return; // Ignore invalid JSON
  }
      const messageType = rawData.type;

      switch (messageType) {
        case "JOIN_ROOM":
          joinRoom(ClientConnectionId, rawData.roomId);
          break;
        case "GAME_ACTION":
          gameAction(ClientConnectionId, rawData.roomId, rawData.action);
          break;
        case "START_GAME":
          startGame(rawData.roomId);
          initGame(rawData.roomId);
          break;
        case "LEAVE_ROOM":
          leaveRoom(ClientConnectionId, rawData.roomId);
          break;
        case "ROOM_CHAT":
          if (rawData.roomId) chatOnRoom(rawData.roomId, ClientConnectionId, rawData.message);
          else broadCastMessage(wsServer, rawData.message, ClientConnectionId);
          break;
        default:
          console.log("Invalid case to handle");
      }
    });
    webSocket.on("close", () => {
      console.log(`Client ${ClientConnectionId} is disconnected`);
      handleUserDisconnect(ClientConnectionId, webSocket);
      wsServer.clients.forEach((client) => {
        client.send(`Client ${ClientConnectionId} is disconnected`);
      });
    });
  });

};
