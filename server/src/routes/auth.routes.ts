import {Router} from "express";
import { getMe, login, logout, signUp } from "../controllers/express/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/sign-in",login)
router.post("/sign-out",logout);
router.get("/get-me",authMiddleware,getMe);
router.post("/sign-up",signUp);

export default router;