import type { BoardCell, Player } from "./types";

export const boardCellsArray: BoardCell[] = [
  { index: 0, value: null },
  { index: 1, value: null },
  { index: 2, value: null },
  { index: 3, value: null },
  { index: 4, value: null },
  { index: 5, value: null },
  { index: 6, value: null },
  { index: 7, value: null },
  { index: 8, value: null },
];

export const players: Record<Player, string | null> = {
  X: null,
  O: null,
};

export const winningCombinations: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

