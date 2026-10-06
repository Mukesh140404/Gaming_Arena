import { Router } from "express";
import { addGame, allGames, deleteGame, getGameById, updateGame } from "../controllers/express/game.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", allGames);
router.get("/:id", getGameById);
router.post("/", authMiddleware, authorizeRoles("admin"), addGame);
router.put("/:id", authMiddleware, authorizeRoles("admin"), updateGame);
router.patch("/:id", authMiddleware, authorizeRoles("admin"), updateGame);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteGame);

export default router;
