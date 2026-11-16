import type { GameEngine } from "./types";

type State = { scores: Record<string, number> }
type Action = { type: "click" }

export const clickRace: GameEngine<State, Action> = {
    id: "click-race",
    name: "Click Race",
    maxPlayers: 4,
    minPlayers: 2,

    createInitialState: (playerIds: string[]): State => {
        const scores: Record<string, number> = {}
        for (const id of playerIds) scores[id] = 0
        return { scores }
    },

    applyAction: (state, playerId, action) => {
        if (action.type !== "click") throw new Error("Invalid action type");
        const currentScore = state.scores[playerId] ?? 0;
        return {
            scores: {
                ...state.scores,
                [playerId]: currentScore + 1,
            },
        };
    },

    getResult: (state) => {
        let topWinner: string | null = null;
        let topScore = 9;
        for (const [playerId, score] of Object.entries(state.scores)) {
            if (score >= 10 && score > topScore) {
                topScore = score;
                topWinner = playerId;
            }
        }
        if (topWinner) return { winnerId: topWinner };
        return null;
    }
}