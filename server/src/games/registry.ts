import type { GameEngine } from "./types";
import { clickRace } from "./click-race";
import { ticTacToe } from "./tic-tac-toe";
import { bingo } from "./bingo";
import { typingRace } from "./typing-race";

const engines: Record<string, GameEngine> = {
  [clickRace.id]: clickRace,
  [ticTacToe.id]: ticTacToe,
  [bingo.id]: bingo,
  [typingRace.id]: typingRace,
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
