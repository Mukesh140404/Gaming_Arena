import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import app from "./app.js";
import { registerWebSocketHandlers } from "./webSocket.js";

const PORT = process.env.PORT ?? 4000;

const server = createServer(app);
export const wsServer = new WebSocketServer({ server });

registerWebSocketHandlers(wsServer);

server.listen(PORT, () => {
  console.log(`Server is Listen on http://localhost:${PORT}`);
});
