import type { WebSocketServer } from "ws";

export const broadCastMessage = (wsServer: WebSocketServer, message: string, senderId: string) => {
    wsServer.clients.forEach((client) => {
        client.send(
            JSON.stringify({
                type: "message",
                message: message,
                roomChat: false,
                from: senderId,
            }),
        );
    });
}