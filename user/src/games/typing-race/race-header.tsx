import React from "react";
import { Keyboard, Volume2, VolumeX, RotateCcw, Timer, Gauge, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RaceHeaderProps {
  elapsedTime: number; // in milliseconds
  wpm: number;
  accuracy: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
  isMultiplayer: boolean;
}

export const RaceHeader: React.FC<RaceHeaderProps> = ({
  elapsedTime,
  wpm,
  accuracy,
  soundEnabled,
  onToggleSound,
  onRestart,
  isMultiplayer,
}) => {
  const seconds = (elapsedTime / 1000).toFixed(1);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-linear-to-tr from-[#FF6562] to-amber-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
            <Keyboard className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                TYPING RACE
              </h2>
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-300 font-bold px-2 py-0.5 text-xs">
                {isMultiplayer ? "Live Room Match" : "Speed Arena"}
              </Badge>
            </div>
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              <span>Type accurately to accelerate across the finish line!</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSound}
            className="h-8 px-2.5 rounded-xl border-gray-200 text-xs font-semibold text-gray-600 cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 mr-1 text-[#FF6562]" />
                <span>Audio</span>
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
            className="h-8 px-2.5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row: Time + Speed + Accuracy */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
        {/* Stopwatch Time */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <Timer className="h-3 w-3 text-gray-500" /> Time
          </span>
          <span className="text-lg sm:text-xl font-mono font-black text-gray-900">
            {seconds}s
          </span>
        </div>

        {/* Speed (WPM) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <Gauge className="h-3 w-3 text-rose-500" /> Speed (WPM)
          </span>
          <span className="text-lg sm:text-xl font-mono font-black text-rose-600">
            {Math.round(wpm)}
          </span>
        </div>

        {/* Accuracy (%) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
            <Target className="h-3 w-3 text-emerald-500" /> Accuracy
          </span>
          <span className="text-lg sm:text-xl font-mono font-black text-emerald-600">
            {accuracy}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default RaceHeader;
