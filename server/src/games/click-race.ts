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
        if (action.type !== "click") throw new Error("Invalid action type")
        const newState = { scores: { ...state.scores, [playerId]: state.scores[playerId] + 1 } }
        return newState
    },

    getResult: (state) => {
        for (const playerId in state.scores) {
            if (state.scores[playerId] >= 10) return { winnerId: playerId }
        }
        return null
    }
}