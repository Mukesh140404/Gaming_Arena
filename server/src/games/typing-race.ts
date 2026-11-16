import type { GameEngine } from "./types";

export type TypingPlayerState = {
  progress: number;
  wpm: number;
  accuracy: number;
  completed: boolean;
  finishTime?: number;
};

export type TypingRaceState = {
  quote: string;
  players: Record<string, TypingPlayerState>;
  finishOrder: string[];
};

export type TypingRaceAction = {
  type: "progress";
  progress: number;
  wpm: number;
  accuracy: number;
  completed: boolean;
};

const DEFAULT_QUOTES = [
  "Victory is not determined by the speed of your fingers, but by the calm focus of your mind under intense pressure.",
  "In the cyber speedway, every millisecond counts. Keep your eyes sharp, your keystrokes precise, and never lift your hands from the home row.",
  "Fast and fearless, the engine roars as neon trails streak across the midnight tarmac towards the glowing finish line.",
  "Even bad code can function. But if code is not clean, it can bring a development organization to its knees.",
];

export const typingRace: GameEngine<TypingRaceState, TypingRaceAction> = {
  id: "typing-race",
  name: "Typing Race",
  minPlayers: 1,
  maxPlayers: 8,

  createInitialState: (playerIds: string[]): TypingRaceState => {
    const players: Record<string, TypingPlayerState> = {};
    for (const id of playerIds) {
      players[id] = {
        progress: 0,
        wpm: 0,
        accuracy: 100,
        completed: false,
      };
    }
    const randomQuote =
      DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)];

    return {
      quote: randomQuote,
      players,
      finishOrder: [],
    };
  },

  applyAction: (state, playerId, action) => {
    if (action.type !== "progress") throw new Error("Invalid action type");

    const currentP = state.players[playerId] || {
      progress: 0,
      wpm: 0,
      accuracy: 100,
      completed: false,
    };

    const isNowCompleted = action.completed || action.progress >= 100;
    const finishOrder = [...state.finishOrder];

    if (isNowCompleted && !finishOrder.includes(playerId)) {
      finishOrder.push(playerId);
    }

    const updatedPlayers = {
      ...state.players,
      [playerId]: {
        ...currentP,
        progress: Math.min(100, Math.max(0, action.progress)),
        wpm: action.wpm,
        accuracy: action.accuracy,
        completed: isNowCompleted,
      },
    };

    return {
      ...state,
      players: updatedPlayers,
      finishOrder,
    };
  },

  getResult: (state) => {
    if (state.finishOrder.length > 0) {
      return { winnerId: state.finishOrder[0] };
    }
    return null;
  },
};
