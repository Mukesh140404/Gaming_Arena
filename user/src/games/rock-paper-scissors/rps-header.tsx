import React from "react";
import { Swords, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RPSHeaderProps {
  currentRound: number;
  targetScore: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
}

export const RPSHeader: React.FC<RPSHeaderProps> = ({
  currentRound,
  targetScore,
  soundEnabled,
  onToggleSound,
  onRestart,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-2xl p-4 shadow-sm w-full transition-all">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Title and Badges */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <Swords className="h-5 w-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                ROCK PAPER SCISSORS
              </h1>
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border border-rose-300 font-bold px-2 py-0.5 text-xs">
                Live Duel
              </Badge>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Round <span className="font-bold text-gray-800">#{currentRound}</span> • First to{" "}
              <span className="font-bold text-rose-600">{targetScore}</span> Wins
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSound}
            className="h-8 px-2.5 rounded-xl border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 mr-1 text-rose-500" />
                <span>Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5 mr-1 text-gray-400" />
                <span>Muted</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRestart}
            className="h-8 px-2.5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
