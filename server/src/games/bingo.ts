import type { GameEngine } from "./types";

type State = {
  players: string[];
  phase: "setup" | "playing";
  boards: Record<string, number[] | null>; // null until the player submits
  calledNumbers: number[];
  turn: string;
};

type Action =
  | { type: "SUBMIT_BOARD"; board: number[] }
  | { type: "CALL_NUMBER"; number: number };

const winningLines = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

// A valid board has each number from 1 to 25 exactly once
const isValidBoard = (board: unknown): board is number[] => {
  if (!Array.isArray(board) || board.length !== 25) return false;
  const seen = new Set<number>();
  for (const n of board) {
    if (!Number.isInteger(n) || n < 1 || n > 25 || seen.has(n)) return false;
    seen.add(n);
  }
  return true;
};

const countCompletedLines = (board: number[], calledNumbers: number[]) => {
  const called = new Set(calledNumbers);
  return winningLines.filter((line) =>
    line.every((cell) => called.has(board[cell])),
  ).length;
};

export const bingo: GameEngine<State, Action> = {
  id: "bingo",
  name: "Bingo",
  minPlayers: 2,
  maxPlayers: 2,

  createInitialState: (playerIds) => {
    const boards: Record<string, number[] | null> = {};
    playerIds.forEach((id) => {
      boards[id] = null;
    });
    return {
      players: playerIds,
      phase: "setup",
      boards,
      calledNumbers: [],
      turn: playerIds[0],
    };
  },

  applyAction: (state, playerId, action) => {
    if (!state.players.includes(playerId)) throw new Error("Not a player");

    if (action.type === "SUBMIT_BOARD") {
      if (state.phase !== "setup") throw new Error("Setup phase is over");
      if (state.boards[playerId]) throw new Error("Board already submitted");
      if (!isValidBoard(action.board)) throw new Error("Invalid board");

      const boards = { ...state.boards, [playerId]: action.board };
      const allReady = state.players.every((p) => boards[p] !== null);
      return { ...state, boards, phase: allReady ? "playing" : "setup" };
    }

    if (action.type === "CALL_NUMBER") {
      if (state.phase !== "playing") throw new Error("Game has not started");
      if (state.turn !== playerId) throw new Error("Not your turn");
      if (
        !Number.isInteger(action.number) ||
        action.number < 1 ||
        action.number > 25
      ) {
        throw new Error("Invalid number");
      }
      if (state.calledNumbers.includes(action.number)) {
        throw new Error("Number already called");
      }

      const nextTurn = state.players.find((p) => p !== playerId)!;
      return {
        ...state,
        calledNumbers: [...state.calledNumbers, action.number],
        turn: nextTurn,
      };
    }

    throw new Error("Unknown action");
  },

  getResult: (state) => {
    if (state.phase !== "playing") return null;

    const finished = state.players.filter(
      (p) => countCompletedLines(state.boards[p]!, state.calledNumbers) >= 5,
    );
    if (finished.length === 0) return null;
    if (finished.length === 2) return { winnerId: null, draw: true };
    return { winnerId: finished[0] };
  },

  // Each player only sees their own board
  getPlayerView: (state, playerId) => ({
    players: state.players,
    phase: state.phase,
    myBoard: state.boards[playerId],
    opponentReady: state.players.some(
      (p) => p !== playerId && state.boards[p] !== null,
    ),
    calledNumbers: state.calledNumbers,
    turn: state.turn,
  }),
};