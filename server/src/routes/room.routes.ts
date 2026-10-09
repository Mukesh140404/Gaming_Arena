import { Router } from "express"
import { createRoom, destroyRoom, getRoom, joinRoom, leaveRoom } from "../controllers/express/room.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router()

router.post("/",authMiddleware, createRoom);
router.get("/:roomId",authMiddleware, getRoom);
router.post("/join",authMiddleware, joinRoom);
router.post("/leave",authMiddleware, leaveRoom);
router.post("/destroy",authMiddleware, destroyRoom);

export default router