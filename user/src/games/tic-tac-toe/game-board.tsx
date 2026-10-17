import type { BoardCell } from "./types";
import CrossImage from "@/assets/Cross.webp";
import CircleImage from "@/assets/Circle.webp";

interface GameBoardProps {
  isEnabled: boolean;
  cells: BoardCell[];
  onCellClick: (cellIndex: number) => void;
}

export const GameBoard = ({
  cells,
  isEnabled,
  onCellClick,
}: GameBoardProps) => {
  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-5 space-y-4 font-sans select-none">
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        {cells.map((cell) => (
          <div
            key={cell.index}
            onClick={() => isEnabled && onCellClick(cell.index)}
            className="bg-slate-50 border aspect-square border-slate-200/80 rounded-xl p-2.5 flex flex-col items-center justify-center"
          >
            <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
              {cell.value === "X" && (
                <img src={CrossImage} alt="X" className=" text-gray-500" />
              )}
              {cell.value === "O" && (
                <img src={CircleImage} alt="O" className=" text-gray-500" />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
