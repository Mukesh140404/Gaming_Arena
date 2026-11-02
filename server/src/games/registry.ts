import type { GameEngine } from "./types";
import { clickRace } from "./click-race";
import { ticTacToe } from "./tic-tac-toe";
import { bingo } from "./bingo";
import { typingRace } from "./typing-race";
import { RockPaperScissors } from "./rock-paper-scissors";

const engines: Record<string, GameEngine> = {
  [clickRace.id]: clickRace,
  [ticTacToe.id]: ticTacToe,
  [bingo.id]: bingo,
  [typingRace.id]: typingRace,
  [RockPaperScissors.id]: RockPaperScissors,
  "rockpaperscissor": RockPaperScissors,
  "rockpaperscissors": RockPaperScissors,
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[\s_-]+/g, "");

const normalizedEngines: Record<string, GameEngine> = {};
Object.entries(engines).forEach(([key, engine]) => {
  normalizedEngines[normalize(key)] = engine;
  normalizedEngines[normalize(engine.id)] = engine;
});

export const getEngine = (gameId?: string) => {
  if (!gameId) return undefined;
  return normalizedEngines[normalize(gameId)];
};
