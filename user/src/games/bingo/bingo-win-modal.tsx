import React from "react";
import { Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BingoWinModalProps {
  onRestart: () => void;
}

export const BingoWinModal: React.FC<BingoWinModalProps> = ({ onRestart }) => {
  return (
    <div className="w-full max-w-xl p-6 bg-white border-2 border-rose-300 rounded-2xl shadow-xl text-center space-y-4">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
        <Trophy className="h-8 w-8 animate-bounce" />
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          🎉 BINGO! YOU WON!
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          5 Straight Lines successfully completed!
        </p>
      </div>

      <div className="pt-2">
        <Button
          onClick={onRestart}
          className="h-11 px-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm cursor-pointer shadow-md"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default BingoWinModal;
