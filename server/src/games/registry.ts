import type { GameEngine } from "./types.js";
import { clickRace } from "./click-race.js";

const engines: Record<string, GameEngine> = {
    [clickRace.id]: clickRace,
};

export const getEngine = (gameId: string) => engines[gameId];   