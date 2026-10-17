import type { GameEngine } from "./types.js";

type State = {
  board: (string | null)[];
  players: string[];
  turn: string;
};

type Action = { type: "MOVE"; index: number };

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const ticTacToe: GameEngine<State, Action> = {
  id: "tictactoe",
  name: "Tic Tac Toe",
  minPlayers: 2,
  maxPlayers: 2,

  createInitialState: (playerIds) => ({
    board: Array(9).fill(null),
    players: playerIds,
    turn: playerIds[0],
  }),

  applyAction: (state, playerId, action) => {
    if (action.type !== "MOVE") throw new Error("Unknown action");
    if (state.turn !== playerId) throw new Error("Not your turn");
    if (
      !Number.isInteger(action.index) ||
      action.index < 0 ||
      action.index > 8
    ) {
      throw new Error("Invalid cell");
    }
    if (state.board[action.index] !== null)
      throw new Error("Cell is already taken");

    const board = [...state.board];
    board[action.index] = playerId;

    const nextTurn = state.players.find((p) => p !== playerId)!;

    return { ...state, board, turn: nextTurn };
  },

  getResult: (state) => {
    for (const [a, b, c] of winningLines) {
      const cell = state.board[a];
      if (cell && cell === state.board[b] && cell === state.board[c]) {
        return { winnerId: cell };
      }
    }
    if (state.board.every((cell) => cell !== null)) {
      return { winnerId: null, draw: true };
    }
    return null;
  },
};
