import React from "react";
import { Crown, Flame } from "lucide-react";
import type { Racer } from "./config";

interface RaceTrackProps {
  racers: Racer[];
  targetClicks: number;
  leaderId: string | null;
}

export const RaceTrack: React.FC<RaceTrackProps> = ({
  racers,
  targetClicks,
  leaderId,
}) => {
  return (
    <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-3 sm:p-5 shadow-xl space-y-3.5">
      {/* Race Track Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
        <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <Flame className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
          Live Speedway Track
        </span>
        <span className="flex items-center gap-1 font-mono text-[11px] text-amber-400">
          🏁 Finish Line ({targetClicks} clicks)
        </span>
      </div>

      {/* Track Lanes */}
      <div className="space-y-3">
        {racers.map((racer, index) => {
          const progressPercent = Math.min(
            100,
            Math.max(0, (racer.score / targetClicks) * 100)
          );
          const isLeader = leaderId === racer.id && racer.score > 0;

          return (
            <div
              key={racer.id || index}
              className={`relative rounded-xl p-3 transition-all duration-300 border ${
                racer.isSelf
                  ? "bg-slate-800/90 border-rose-500/50 ring-2 ring-rose-500/20 shadow-lg shadow-rose-950/20"
                  : "bg-slate-800/60 border-slate-700/80"
              }`}
            >
              {/* Lane Info Header */}
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{racer.avatar}</span>
                  <span
                    className={`font-black ${
                      racer.isSelf ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {racer.name}
                  </span>

                  {racer.isSelf && (
                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.2 rounded">
                      YOU
                    </span>
                  )}

                  {isLeader && (
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded flex items-center gap-1">
                      <Crown className="h-2.5 w-2.5 text-amber-400" />
                      1ST
                    </span>
                  )}
                </div>

                {/* Score Counter */}
                <div className="flex items-center gap-1 font-mono">
                  <span
                    className={`text-base font-black ${
                      racer.isSelf ? "text-rose-400" : "text-slate-200"
                    }`}
                  >
                    {racer.score}
                  </span>
                  <span className="text-slate-500 text-xs">/ {targetClicks}</span>
                </div>
              </div>

              {/* Asphalt Track Bar with Finish Flag */}
              <div className="relative h-9 w-full bg-slate-950/90 rounded-lg overflow-hidden border border-slate-800 flex items-center px-1">
                {/* Lane Track Grid Markings */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_90%,rgba(255,255,255,0.06)_10%)] bg-[length:24px_100%] pointer-events-none" />

                {/* Checkered Finish Line at End */}
                <div className="absolute right-0 top-0 bottom-0 w-7 bg-[repeating-conic-gradient(#fff_0_25%,#000_0_50%)] bg-[length:8px_8px] opacity-70 z-0 border-l border-white/20" />

                {/* Colored Progress Bar fill */}
                <div
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-150 ease-out opacity-25 ${
                    racer.isSelf ? "bg-rose-500" : "bg-cyan-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />

                {/* Moving Racer Avatar on Track */}
                <div
                  className="absolute transition-all duration-150 ease-out flex items-center z-10"
                  style={{
                    left: `calc(${progressPercent}% * 0.88)`,
                  }}
                >
                  <div
                    className={`h-7 px-2 rounded-md flex items-center justify-center font-bold text-sm shadow-md transition-transform duration-100 ${
                      racer.isSelf
                        ? "bg-rose-500 text-white shadow-rose-500/40 scale-105"
                        : "bg-cyan-600 text-white shadow-cyan-500/30"
                    }`}
                  >
                    <span className="mr-1 text-sm">{racer.avatar}</span>
                    <span className="text-xs font-mono font-black">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RaceTrack;
