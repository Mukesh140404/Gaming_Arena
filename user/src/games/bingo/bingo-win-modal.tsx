import React from "react";
import { Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BingoWinModalProps {
  isWinner: boolean;
  isDraw: boolean;
  onBackToRoom: () => void;
}

export const BingoWinModal: React.FC<BingoWinModalProps> = ({
  isWinner,
  isDraw,
  onBackToRoom,
}) => {
  const title = isDraw
    ? "It's a draw!"
    : isWinner
      ? "BINGO! YOU WON!"
      : "You lost. Better luck next time!";

  return (
    <div className="w-full max-w-xl p-6 bg-white border-2 border-rose-300 rounded-2xl shadow-xl text-center space-y-4">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
        <Trophy className="h-8 w-8 animate-bounce" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
        {title}
      </h2>
      <Button
        onClick={onBackToRoom}
        className="h-11 px-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm cursor-pointer shadow-md"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Back to Room
      </Button>
    </div>
  );
};

export default BingoWinModal;