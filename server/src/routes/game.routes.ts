import { Router } from "express";
import {
  addGame,
  allGames,
  deleteGame,
  getGameById,
  updateGame,
} from "../controllers/express/game.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.get("/", authMiddleware, allGames);
router.get("/:id", authMiddleware, getGameById);
router.post("/", authMiddleware, authorizeRoles("admin"), addGame);
router.put("/:id", authMiddleware, authorizeRoles("admin"), updateGame);
router.patch("/:id", authMiddleware, authorizeRoles("admin"), updateGame);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteGame);

export default router;
