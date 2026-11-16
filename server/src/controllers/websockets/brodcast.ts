import WebSocket, { type WebSocketServer } from "ws";

export const broadCastMessage = (wsServer: WebSocketServer, message: string, senderId: string) => {
    wsServer.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    type: "message",
                    message: message,
                    roomChat: false,
                    from: senderId,
                }),
            );
        }
    });
};