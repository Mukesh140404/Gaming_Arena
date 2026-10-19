import type { GameEngine } from "./types";
import { clickRace } from "./click-race";
import { ticTacToe } from "./tic-tac-toe";
import { bingo } from "./bingo";

const engines: Record<string, GameEngine> = {
  [clickRace.id]: clickRace,
  [ticTacToe.id]: ticTacToe,
  [bingo.id]: bingo
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
