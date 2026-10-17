export type GameState = "not_started" | "in_progress" | "finished";
export type Player = "X" | "O";
export type CellValue = Player | null;
export type Board = CellValue[];

export type GameResult = "X_wins" | "O_wins" | "draw" | null;

export interface GameStatus {
  state: GameState;
  currentPlayer: Player;
  board: Board;
  result: GameResult;
}

export interface GameActions {
  startGame: () => void;
  makeMove: (cellIndex: number) => void;
  resetGame: () => void;
}

export type BoardCell = {
  index: number;
  value: CellValue;
};
