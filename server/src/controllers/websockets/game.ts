import { eq } from "drizzle-orm";
import { db } from "../../db/index";
import { rooms } from "../../db/schema/rooms";
import { games } from "../../db/schema/games";
import { getEngine } from "../../games/registry";
import { getActivePlayers, sendTo, sendToMany } from "./room";
import { GameEngine } from "../../games/types";

interface ActiveGameSession {
  state: any;
  engine: GameEngine;
  playerIds: string[];
}

export const activeGames = new Map<string, ActiveGameSession>();

const sendStateToPlayers = (
  engine: GameEngine,
  playerIds: string[],
  roomId: string,
  state: any,
) => {
  playerIds.forEach((playerId) => {
    const view = engine.getPlayerView
      ? engine.getPlayerView(state, playerId)
      : state;
    sendTo(playerId, { type: "game-state", roomId, state: view });
  });
};

export const sendGameSessionToPlayer = (roomId: string, userId: string) => {
  const session = activeGames.get(roomId);
  if (!session || !session.playerIds.includes(userId)) return;
  const view = session.engine.getPlayerView
    ? session.engine.getPlayerView(session.state, userId)
    : session.state;
  sendTo(userId, { type: "game-state", roomId, state: view });
};

export const initGame = async (roomId: string) => {
  const existing = activeGames.get(roomId);
  if (existing) {
    sendStateToPlayers(existing.engine, existing.playerIds, roomId, existing.state);
    return existing.state;
  }

  const players = await getActivePlayers(roomId);
  const playerIds = players.map((p) => p.userId);

  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId));
  if (!room) return;

  const [game] = await db.select().from(games).where(eq(games.id, room.gameId));
  const engine = getEngine(game?.slug || room.gameId);
  if (!engine) return;

  // Validate minimum players to prevent turn = undefined freezes
  if (playerIds.length < engine.minPlayers) {
    if (playerIds.length > 0) {
      sendTo(playerIds[0], {
        type: "game-error",
        roomId,
        message: `Cannot start match: Need at least ${engine.minPlayers} players, but only ${playerIds.length} joined.`,
      });
    }
    // Revert room status back to waiting so it doesn't stay permanently stuck in started
    db.update(rooms)
      .set({ status: "waiting" })
      .where(eq(rooms.id, roomId))
      .catch((err) => console.error("Error reverting room status to waiting:", err));
    return;
  }

  const initialState = engine.createInitialState(playerIds);
  const session: ActiveGameSession = {
    state: initialState,
    engine,
    playerIds,
  };

  activeGames.set(roomId, session);

  // Send individualized state (myBoard for bingo, etc.) to all players
  sendStateToPlayers(engine, playerIds, roomId, initialState);

  // Update room status in database to 'started' if it was waiting
  db.update(rooms)
    .set({ status: "started", startedAt: new Date() })
    .where(eq(rooms.id, roomId))
    .catch((err) => console.error("Error setting room status to started:", err));

  return initialState;
};

export const gameAction = async (
  userId: string,
  roomId: string,
  action: unknown,
) => {
  let session = activeGames.get(roomId);
  if (!session) {
    // If client requested RESTART after game ended, re-initialize the game session
    if (action && typeof action === "object" && (action as any).type === "RESTART") {
      await initGame(roomId);
      return;
    }
    sendTo(userId, {
      type: "game-error",
      roomId,
      message: "No active game is running in this room",
    });
    return;
  }

  const { engine, playerIds } = session;

  if (!playerIds.includes(userId)) {
    sendTo(userId, {
      type: "game-error",
      roomId,
      message: "You are not a participant in this match",
    });
    return;
  }

  let newState;
  try {
    newState = engine.applyAction(session.state, userId, action as any);
  } catch (err) {
    sendTo(userId, {
      type: "game-error",
      roomId,
      message: (err as Error).message,
    });
    return;
  }

  session.state = newState;

  // Send updated state to players
  sendStateToPlayers(engine, playerIds, roomId, newState);

  const result = engine.getResult(newState);
  if (result) {
    activeGames.delete(roomId);
    sendToMany(playerIds, {
      type: "game-ended",
      roomId,
      result,
      finalState: newState,
    });

    // Mark room as waiting in DB so it doesn't linger as 'started', allowing rematch or return to lobby
    db.update(rooms)
      .set({ status: "waiting" })
      .where(eq(rooms.id, roomId))
      .catch((err) => console.error("Error setting room status to waiting:", err));
  }
};

export const handlePlayerDisconnectFromGame = (roomId: string, disconnectedUserId: string) => {
  const session = activeGames.get(roomId);
  if (!session || !session.playerIds.includes(disconnectedUserId)) return;

  activeGames.delete(roomId);
  const remainingPlayers = session.playerIds.filter((id) => id !== disconnectedUserId);

  sendToMany(remainingPlayers, {
    type: "game-ended",
    roomId,
    result: {
      winnerId: remainingPlayers[0] ?? null,
      forfeit: true,
      message: "Opponent disconnected. Match won by forfeit.",
    },
    finalState: session.state,
  });

  db.update(rooms)
    .set({ status: "waiting" })
    .where(eq(rooms.id, roomId))
    .catch((err) => console.error("Error updating waiting status on forfeit:", err));
};
