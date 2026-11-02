import type { GameEngine } from "./types.js";

export type Choice = "rock" | "paper" | "scissors";

export interface RPSPlayerState {
  choice: Choice | null;
  score: number;
  hasChosen?: boolean;
}

export interface RoundResult {
  roundNumber: number;
  choices: Record<string, Choice>;
  winnerId: string | null;
  isDraw: boolean;
}

export interface RPSState {
  players: Record<string, RPSPlayerState>;
  playerIds: string[];
  currentRound: number;
  targetScore: number;
  phase: "choosing" | "round-resolved";
  lastRound: RoundResult | null;
  history: RoundResult[];
}

export type RPSAction =
  | { type: "CHOOSE"; choice: "rock" | "paper" | "scissors" | "scissor" }
  | { type: "NEXT_ROUND" }
  | { type: "RESTART" };

const normalizeChoice = (c: string): Choice => {
  if (c === "scissor" || c === "scissors") return "scissors";
  if (c === "rock") return "rock";
  if (c === "paper") return "paper";
  throw new Error(`Invalid choice: ${c}`);
};

export const RockPaperScissors: GameEngine<RPSState, RPSAction> = {
  id: "rockpaperscissors",
  name: "Rock Paper Scissors",
  minPlayers: 2,
  maxPlayers: 2,

  createInitialState: (playerIds: string[]): RPSState => ({
    players: Object.fromEntries(
      playerIds.map((id) => [
        id,
        {
          choice: null,
          score: 0,
          hasChosen: false,
        },
      ])
    ),
    playerIds,
    currentRound: 1,
    targetScore: 3,
    phase: "choosing",
    lastRound: null,
    history: [],
  }),

  applyAction: (state, playerId, action) => {
    if (!state.playerIds.includes(playerId)) {
      throw new Error("This is not a valid player for this match");
    }

    // Check if match already has an overall winner
    const currentWinner = RockPaperScissors.getResult(state);
    if (currentWinner && action.type !== "RESTART") {
      throw new Error("Game has already concluded");
    }

    if (action.type === "RESTART") {
      return RockPaperScissors.createInitialState(state.playerIds);
    }

    if (action.type === "NEXT_ROUND") {
      if (state.phase === "round-resolved") {
        for (const id of state.playerIds) {
          state.players[id].choice = null;
        }
        state.currentRound += 1;
        state.phase = "choosing";
      }
      return { ...state };
    }

    if (action.type === "CHOOSE") {
      const choice = normalizeChoice(action.choice);

      // If we are currently in round-resolved, automatically transition to next round with this choice
      if (state.phase === "round-resolved") {
        for (const id of state.playerIds) {
          state.players[id].choice = null;
        }
        state.currentRound += 1;
        state.phase = "choosing";
      }

      state.players[playerId].choice = choice;

      // Check if both players have made their choices
      const allChosen = state.playerIds.every(
        (id) => state.players[id].choice !== null
      );

      if (allChosen) {
        const [p1, p2] = state.playerIds;
        const c1 = state.players[p1].choice!;
        const c2 = state.players[p2].choice!;

        let winnerId: string | null = null;
        let isDraw = false;

        if (c1 === c2) {
          isDraw = true;
        } else if (
          (c1 === "rock" && c2 === "scissors") ||
          (c1 === "paper" && c2 === "rock") ||
          (c1 === "scissors" && c2 === "paper")
        ) {
          winnerId = p1;
          state.players[p1].score += 1;
        } else {
          winnerId = p2;
          state.players[p2].score += 1;
        }

        const roundResult: RoundResult = {
          roundNumber: state.currentRound,
          choices: {
            [p1]: c1,
            [p2]: c2,
          },
          winnerId,
          isDraw,
        };

        state.lastRound = roundResult;
        state.history = [...state.history, roundResult];
        state.phase = "round-resolved";
      }

      return { ...state };
    }

    throw new Error("Unknown action type");
  },

  getResult: (state) => {
    if (state.playerIds.length < 2) return null;

    for (const id of state.playerIds) {
      if (state.players[id].score >= state.targetScore) {
        return {
          winnerId: id,
          draw: false,
        };
      }
    }

    return null;
  },

  getPlayerView: (state, playerId) => {
    const maskedPlayers: Record<
      string,
      { choice: Choice | null; score: number; hasChosen: boolean }
    > = {};

    for (const id of state.playerIds) {
      const isSelf = id === playerId;
      const player = state.players[id];
      maskedPlayers[id] = {
        score: player.score,
        hasChosen: player.choice !== null,
        // Only reveal the opponent's choice once the round has resolved
        choice:
          isSelf || state.phase === "round-resolved" ? player.choice : null,
      };
    }

    return {
      ...state,
      players: maskedPlayers,
    };
  },
};