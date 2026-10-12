// src/games/registry.ts
import type { GameEngine } from "./types.js";
// import { bingo } from "";

const engines: Record<string, GameEngine> = {
//   [bingo.id]: bingo,
};

export const getEngine = (gameId: string) => engines[gameId];   