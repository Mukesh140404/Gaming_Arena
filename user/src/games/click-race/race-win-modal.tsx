import React from "react";
import { Trophy, RotateCcw, Timer, Gauge, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RaceWinModalProps {
  winnerName: string;
  isSelfWinner: boolean;
  totalTime: number;
  peakCps: number;
  totalClicks: number;
  onRestart: () => void;
}

export const RaceWinModal: React.FC<RaceWinModalProps> = ({
  winnerName,
  isSelfWinner,
  totalTime,
  peakCps,
  totalClicks,
  onRestart,
}) => {
  const seconds = (totalTime / 1000).toFixed(2);

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-white border-2 border-rose-300 rounded-3xl shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
      {/* Trophy Badge */}
      <div className="mx-auto h-20 w-20 rounded-3xl bg-linear-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-500/25 animate-bounce">
        <Trophy className="h-10 w-10" />
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          {isSelfWinner ? "🏆 VICTORY! YOU WON!" : `🏁 ${winnerName} WON!`}
        </h2>
        <p className="text-sm font-medium text-gray-600 mt-1">
          {isSelfWinner
            ? "Speed demon! You reached the finish line first!"
            : "Great effort! Opponent completed the clicks first."}
        </p>
      </div>

      {/* Race Stats Summary */}
      <div className="grid grid-cols-3 gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <Timer className="h-3 w-3 text-rose-500" /> Time
          </span>
          <span className="text-base sm:text-lg font-mono font-black text-gray-900 mt-0.5">
            {seconds}s
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <Gauge className="h-3 w-3 text-amber-500" /> Peak CPS
          </span>
          <span className="text-base sm:text-lg font-mono font-black text-amber-600 mt-0.5">
            {peakCps.toFixed(1)}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <Award className="h-3 w-3 text-emerald-500" /> Total Clicks
          </span>
          <span className="text-base sm:text-lg font-mono font-black text-emerald-600 mt-0.5">
            {totalClicks}
          </span>
        </div>
      </div>

      {/* Rematch Button */}
      <div className="pt-2 flex justify-center">
        <Button
          onClick={onRestart}
          className="h-11 px-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm cursor-pointer shadow-lg shadow-rose-500/25"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Race Again
        </Button>
      </div>
    </div>
  );
};

export default RaceWinModal;
