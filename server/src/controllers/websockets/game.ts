import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { rooms } from "../../db/schema/rooms.js"; 
import { getEngine } from "../../games/registry.js";
import { getActivePlayers, sendTo, sendToMany } from "./room.js";

export const activeGames = new Map<string, any>();

export const gameAction = async (
  userId: string,
  roomId: string,
  action: unknown,
) => {
  // 1. Is a game running in this room?
  const state = activeGames.get(roomId);
  if (!state) {
    sendTo(userId, { type: "game-error", roomId, message: "No game is running" });
    return;
  }

  // 2. Only active players of this room can act
  const players = await getActivePlayers(roomId);
  const playerIds = players.map((p) => p.userId);
  if (!playerIds.includes(userId)) return;

  // 3. Find which game this room is playing
  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) return;

  const engine = getEngine(room.gameId);
  if (!engine) return;

  // 4. Let the game engine apply the action
  let newState;
  try {
    newState = engine.applyAction(state, userId, action);
  } catch (err) {
    // Only the player who made the bad move gets the error
    sendTo(userId, {
      type: "game-error",
      roomId,
      message: (err as Error).message,
    });
    return;
  }

  activeGames.set(roomId, newState);

  // 5. Send the new state to everyone in the room
  sendToMany(playerIds, { type: "game-state", roomId, state: newState });

  // 6. Check if the game is over
  const result = engine.getResult(newState);
  if (result) {
    activeGames.delete(roomId);
    sendToMany(playerIds, { type: "game-ended", roomId, result });
  }
};