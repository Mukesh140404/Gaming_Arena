import React from "react";
import { Button } from "@/components/ui/button";
import { Shuffle, Trash2, Play, RotateCcw } from "lucide-react";

interface BingoControlsProps {
  phase: "setup" | "playing" | "won";
  placedCount: number;
  onAutoFill: () => void;
  onClear: () => void;
  onStartGame: () => void;
  onRestart: () => void;
}

export const BingoControls: React.FC<BingoControlsProps> = ({
  phase,
  placedCount,
  onAutoFill,
  onClear,
  onStartGame,
  onRestart,
}) => {
  return (
    <div className="max-w-xl w-full space-y-2 mt-4">
      {phase === "setup" ? (
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onAutoFill}
            className="w-full h-10 border-gray-300 font-bold text-xs sm:text-sm cursor-pointer hover:bg-gray-100"
          >
            <Shuffle className="h-4 w-4 mr-1 sm:mr-1.5 text-gray-600" />
            Auto Fill
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            disabled={placedCount === 0}
            className="w-full h-10 border-gray-300 font-bold text-xs sm:text-sm cursor-pointer hover:bg-gray-100"
          >
            <Trash2 className="h-4 w-4 mr-1 sm:mr-1.5 text-gray-600" />
            Clear
          </Button>

          <Button
            type="button"
            onClick={onStartGame}
            className="w-full h-10 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm cursor-pointer"
          >
            <Play className="h-4 w-4 mr-1 sm:mr-1.5 fill-current" />
            {placedCount === 25 ? "Start" : "Fill & Start"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onRestart}
            className="w-full h-10 border-gray-300 font-bold text-sm cursor-pointer hover:bg-gray-100 text-gray-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart Game
          </Button>
        </div>
      )}
    </div>
  );
};

export default BingoControls;
