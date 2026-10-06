import { Router } from "express";
import authRouter from "./auth.routes.js";
import gameRouter from "./game.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/games", gameRouter);

export default router;