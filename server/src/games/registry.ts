import type { GameEngine } from "./types";
import { clickRace } from "./click-race";
import { ticTacToe } from "./tic-tac-toe";

const engines: Record<string, GameEngine> = {
  [clickRace.id]: clickRace,
  [ticTacToe.id]: ticTacToe,
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[\s_-]+/g, "");

const normalizedEngines: Record<string, GameEngine> = {};
Object.values(engines).forEach((engine) => {
  normalizedEngines[normalize(engine.id)] = engine;
});

export const getEngine = (gameId?: string) => {
  if (!gameId) return undefined;
  return normalizedEngines[normalize(gameId)]; // no silent fallback
};
