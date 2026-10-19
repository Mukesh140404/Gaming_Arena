import React from "react";
import winLines from "./config";

interface BingoFinalBoardsProps {
  players: string[];
  boards: Record<string, number[]>;
  calledNumbers: number[];
  currentUserId?: string;
  winnerId: string | null;
}

// Small read-only board used for comparing both players after the game
const MiniBoard = ({
  title,
  board,
  calledNumbers,
  highlight,
}: {
  title: string;
  board: number[];
  calledNumbers: Set<number>;
  highlight: boolean;
}) => {
  // Cells that belong to a completed line
  const winningCells = new Set<number>();
  let lines = 0;
  winLines.forEach((line) => {
    if (line.every((i) => calledNumbers.has(board[i]))) {
      lines++;
      line.forEach((i) => winningCells.add(i));
    }
  });

  return (
    <div
      className={`flex-1 min-w-0 rounded-2xl border p-2.5 ${
        highlight
          ? "border-emerald-400 bg-emerald-50/50 ring-2 ring-emerald-300"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-xs font-black text-gray-900 truncate">{title}</span>
        <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
          {lines} lines
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1">
        {board.map((num, index) => {
          const isCalled = calledNumbers.has(num);
          const isWinning = winningCells.has(index);
          return (
            <div
              key={index}
              className={`aspect-square rounded-md flex items-center justify-center text-[11px] sm:text-sm font-bold border ${
                isWinning
                  ? "bg-rose-500 text-white border-rose-600"
                  : isCalled
                    ? "bg-rose-200 text-rose-900 border-rose-300"
                    : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BingoFinalBoards: React.FC<BingoFinalBoardsProps> = ({
  players,
  boards,
  calledNumbers,
  currentUserId,
  winnerId,
}) => {
  const called = new Set(calledNumbers);

  // Show my board first, opponent second
  const ordered = [...players].sort((a) =>
    a === currentUserId ? -1 : 1,
  );

  return (
    <div className="w-full max-w-xl space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
        Final Boards
      </p>
      <div className="flex gap-2">
        {ordered.map((playerId) => (
          <MiniBoard
            key={playerId}
            title={playerId === currentUserId ? "You" : "Opponent"}
            board={boards[playerId]}
            calledNumbers={called}
            highlight={playerId === winnerId}
          />
        ))}
      </div>
      <p className="text-[11px] text-gray-500 text-center">
        Dark red cells are completed lines. Light red cells were called but not part of a line.
      </p>
    </div>
  );
};

export default BingoFinalBoards;