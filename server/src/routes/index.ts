import { Router } from "express";
import authRouter from "./auth.routes";
import gameRouter from "./game.routes";
import room from "./room.routes"

const router = Router();

router.use("/auth", authRouter);
router.use("/games", gameRouter);
router.use("/rooms",room)

export default router;