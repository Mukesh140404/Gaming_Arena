// import type { GameEngine } from "./types";

// type State = {
//     players: {
//         [playerId: string]: {
//             choice: Choice | null,
//             score: number
//         }
//     }
// }
// type Choice = "rock" | "paper" | "scissor"

// type Action = { type: "CHOOSE", choice: Choice }

// export const RockPaperScissors: GameEngine<State, Action> = {
//     id: "rockpaperscissors",
//     name: "Rock Paper Scissors",
//     minPlayers: 2,
//     maxPlayers: 2,

//     createInitialState: (playerIds) => ({
//         players: Object.fromEntries(
//             playerIds.map((playerId) => [
//                 playerId,
//                 {
//                     choice: null,
//                     score: 0
//                 }
//             ])
//         )

//     }),

//     applyAction: (state, playerId, action) => {
//         if (action.type !== "CHOOSE") throw new Error("Unknown action");
//         if (action.choice !== "rock" && action.choice !== "paper" && action.choice !== "scissor") {
//             throw new Error("Unknown Choice")
//         }
//         if (!state.players[playerId]) throw new Error("this is not valid player")
//         state.players[playerId].choice = action.choice

//         return { ...state}

//     },

//     getResult: (state) => {

//     }
// }

import type { GameEngine } from "./types";

type State = {
    players: {
        [playerId: string]: {
            choice: Choice | null,
            score: number
        }
    }
}

type Choice = "rock" | "paper" | "scissor"

type Action = { type: "CHOOSE", choice: Choice }

export const RockPaperScissors: GameEngine<State, Action> = {
    id: "rockpaperscissors",
    name: "Rock Paper Scissors",
    minPlayers: 2,
    maxPlayers: 2,

    createInitialState: (playerIds) => ({
        players: Object.fromEntries(
            playerIds.map((playerId) => [
                playerId,
                {
                    choice: null,
                    score: 0
                }
            ])
        )
    }),

    applyAction: (state, playerId, action) => {
        if (action.type !== "CHOOSE") {
            throw new Error("Unknown action");
        }

        if (
            action.choice !== "rock" &&
            action.choice !== "paper" &&
            action.choice !== "scissor"
        ) {
            throw new Error("Unknown Choice");
        }

        if (!state.players[playerId]) {
            throw new Error("This is not a valid player");
        }

        state.players[playerId].choice = action.choice;

        const playerIds = Object.keys(state.players);

        if (playerIds.every(id => state.players[id].choice !== null)) {
            const result = RockPaperScissors.getResult(state);

            if (result?.winnerId) {
                state.players[result.winnerId].score += 1;
            }

            for (const id of playerIds) {
                state.players[id].choice = null;
            }
        }

        return { ...state };
    },

    getResult: (state) => {
        const playerIds = Object.keys(state.players);

        if (playerIds.length !== 2) {
            return null;
        }

        const player1 = state.players[playerIds[0]];
        const player2 = state.players[playerIds[1]];

        if (player1.choice === null || player2.choice === null) {
            return null;
        }

        if (player1.choice === player2.choice) {
            return {
                winnerId: null,
                draw: true
            };
        }

        const player1Wins =
            (player1.choice === "rock" && player2.choice === "scissor") ||
            (player1.choice === "paper" && player2.choice === "rock") ||
            (player1.choice === "scissor" && player2.choice === "paper");

        return {
            winnerId: player1Wins ? playerIds[0] : playerIds[1],
            draw: false
        };
    }
};