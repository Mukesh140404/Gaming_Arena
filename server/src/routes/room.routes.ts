import { Router } from "express"
import { createRoom, destroyRoom, getAllRoomsOfGame, getRoom, joinRoom, leaveRoom } from "../controllers/express/room.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router()

router.post("/", authMiddleware, createRoom);
router.post("/join", authMiddleware, joinRoom);
router.get("/destroy/:roomId", authMiddleware, destroyRoom);
router.get("/leave/:roomId", authMiddleware, leaveRoom);
router.get("/game/:gameId", authMiddleware, getAllRoomsOfGame);
router.get("/:roomId", authMiddleware, getRoom);

export default router