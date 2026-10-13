import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { rooms } from "../../db/schema/rooms.js";
import { games } from "../../db/schema/games.js";
import { getEngine } from "../../games/registry.js";
import { getActivePlayers, sendTo, sendToMany } from "./room.js";

export const activeGames = new Map<string, any>();

export const initGame = async (roomId: string) => {
  const players = await getActivePlayers(roomId);
  const playerIds = players.map((p) => p.userId);
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) return;

  const [game] = await db.select().from(games).where(eq(games.id, room.gameId));
  const engine = getEngine(game?.slug || room.gameId);
  if (!engine) return;

  const initialState = engine.createInitialState(playerIds);
  activeGames.set(roomId, initialState);
  sendToMany(playerIds, { type: "game-state", roomId, state: initialState });
  return initialState;
};

export const gameAction = async (
  userId: string,
  roomId: string,
  action: unknown,
) => {
  let state = activeGames.get(roomId);
  if (!state) {
    state = await initGame(roomId);
    if (!state) {
      sendTo(userId, { type: "game-error", roomId, message: "No game is running" });
      return;
    }
  }

  const players = await getActivePlayers(roomId);
  const playerIds = players.map((p) => p.userId);
  if (!playerIds.includes(userId)) return;

  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) return;

  const [game] = await db.select().from(games).where(eq(games.id, room.gameId));
  const engine = getEngine(game?.slug || room.gameId);
  if (!engine) return;

  let newState;
  try {
    newState = engine.applyAction(state, userId, action as any);
  } catch (err) {
    sendTo(userId, {
      type: "game-error",
      roomId,
      message: (err as Error).message,
    });
    return;
  }

  activeGames.set(roomId, newState);

  sendToMany(playerIds, { type: "game-state", roomId, state: newState });

  const result = engine.getResult(newState);
  if (result) {
    activeGames.delete(roomId);
    sendToMany(playerIds, { type: "game-ended", roomId, result });
  }
};