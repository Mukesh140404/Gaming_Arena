import React from "react";

interface BingoBoardProps {
  phase: "setup" | "playing" | "won";
  board: (number | null)[];
  markedNumbers: Set<number>;
  winningCells: Set<number>;
  onCellClick: (index: number) => void;
  onCellDoubleClick: (index: number) => void;
}

export const BingoBoard: React.FC<BingoBoardProps> = ({
  phase,
  board,
  markedNumbers,
  winningCells,
  onCellClick,
  onCellDoubleClick,
}) => {
  return (
    <div className="w-full max-w-xl aspect-square">
      <div className="grid grid-cols-5 grid-rows-5 gap-2 w-full h-full p-2 bg-slate-100 rounded-2xl border border-gray-300 shadow-inner">
        {board.map((cellValue, index) => {
          const isMarked = cellValue !== null && markedNumbers.has(cellValue);
          const isWinning = winningCells.has(index);

          // Phase: SETUP styling
          if (phase === "setup") {
            const hasNumber = cellValue !== null;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onCellClick(index)}
                onDoubleClick={() => onCellDoubleClick(index)}
                title={
                  hasNumber
                    ? "Double-click to remove this number"
                    : "Click to assign next number"
                }
                className={`aspect-square rounded-xl text-2xl sm:text-4xl font-bold flex flex-col items-center justify-center transition-all duration-150 select-none cursor-pointer border relative ${
                  hasNumber
                    ? "bg-white text-gray-900 border-gray-400 shadow-sm hover:border-rose-400 hover:scale-[1.02]"
                    : "bg-gray-200/60 border-dashed border-gray-400 text-gray-400 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500"
                }`}
              >
                {hasNumber ? (
                  <>
                    <span>{cellValue}</span>
                    <span className="hidden sm:block text-[9px] font-sans font-medium text-gray-400 absolute bottom-1">
                      2x to remove
                    </span>
                  </>
                ) : (
                  <span className="text-xl sm:text-2xl font-light opacity-50">+</span>
                )}
              </button>
            );
          }

          // Phase: PLAYING or WON styling
          return (
            <button
              key={index}
              type="button"
              onClick={() => onCellClick(index)}
              disabled={isMarked || phase === "won"}
              className={`aspect-square rounded-xl text-2xl sm:text-4xl font-bold flex items-center justify-center transition-all duration-200 select-none border relative ${
                isMarked
                  ? "bg-rose-300 text-rose-950 border-rose-400 shadow-xs cursor-default scale-[0.98]"
                  : "bg-gray-200 text-gray-800 border-gray-400 hover:bg-rose-100 hover:border-rose-300 cursor-pointer active:scale-95"
              }`}
            >
              <span>{cellValue ?? index + 1}</span>

              {/* Winning Straight Line Glow Indicator */}
              {isWinning && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-600 animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BingoBoard;
