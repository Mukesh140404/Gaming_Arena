import { Router } from "express";
import authRouter from "./auth.routes.js";
import gameRouter from "./game.routes.js";
import room from "./room.routes.js"

const router = Router();

router.use("/auth", authRouter);
router.use("/games", gameRouter);
router.use("/rooms",room)

export default router;