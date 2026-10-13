import type { GameEngine } from "./types.js";
import { clickRace } from "./click-race.js";

const engines: Record<string, GameEngine> = {
    [clickRace.id]: clickRace,
    "click-race": clickRace,
    "click race": clickRace,
};

export const getEngine = (gameId?: string) => {
    if (!gameId) return clickRace;
    return engines[gameId.toLowerCase()] || clickRace;
};   