import React from "react";
import { BINGO_LETTERS } from "./config";

interface BingoLettersProps {
  completedLinesCount: number;
}

export const BingoLetters: React.FC<BingoLettersProps> = ({ completedLinesCount }) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-xl">
      <div className="flex items-center justify-between w-full px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Bingo Progress
        </span>
        <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          {completedLinesCount} / 5 Lines
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 w-full">
        {BINGO_LETTERS.map((letter, index) => {
          const isCompleted = completedLinesCount > index;
          return (
            <div
              key={letter}
              className={`h-12 sm:h-14 rounded-xl flex items-center justify-center font-black text-2xl sm:text-3xl font-mono transition-all duration-300 border select-none ${
                isCompleted
                  ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/30 scale-105 ring-2 ring-rose-400"
                  : "bg-gray-100 text-gray-400 border-gray-200"
              }`}
            >
              {letter}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BingoLetters;
