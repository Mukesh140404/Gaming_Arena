import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import app from "./app.js";

const PORT = process.env.PORT ?? 4000;

const server = createServer(app);
export const wsServer = new WebSocketServer({ server });

server.listen(PORT, () => {
  console.log(`Server is Listen on http://localhost:${PORT}`);
});
