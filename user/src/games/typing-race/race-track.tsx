import React from "react";
import { motion } from "motion/react";
import { Flame, Crown } from "lucide-react";
import { CAR_CONFIGS, type TypingRacer } from "./config";

interface RaceTrackProps {
  racers: TypingRacer[];
  userStreak?: number;
}

export const RaceTrack: React.FC<RaceTrackProps> = ({ racers, userStreak = 0 }) => {
  // Determine leader
  let leaderId: string | null = null;
  let topScore = 0;
  racers.forEach((r) => {
    if (r.score > topScore) {
      topScore = r.score;
      leaderId = r.id;
    }
  });

  // Vertical lane positions (percentage from top) for up to 4 racers on the single track
  const laneTops = [12, 37, 62, 87];

  return (
    <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
      {/* Track Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-white">
            <Flame className="h-4 w-4 text-rose-500 animate-pulse" />
            Live Grand Prix Circuit
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            (All racers on single track)
          </span>
        </div>

        <span className="flex items-center gap-1 font-mono text-[11px] text-amber-400">
          🏁 Finish Line (100%)
        </span>
      </div>

      {/* THE SINGLE COMBINED SPEEDWAY TRACK */}
      <div className="relative w-full h-64 sm:h-72 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 select-none shadow-inner">
        {/* Asphalt Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_92%,rgba(255,255,255,0.03)_8%)] bg-[length:32px_100%] pointer-events-none" />

        {/* Start Line at 0% on Left */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-linear-to-r from-emerald-500/40 to-transparent border-r border-emerald-500/60 z-0 flex items-center justify-center">
          <span className="text-[8px] font-mono font-black text-emerald-400 -rotate-90 select-none tracking-widest opacity-80">
            START
          </span>
        </div>

        {/* Checkered Finish Line at 100% on Right */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-[repeating-conic-gradient(#fff_0_25%,#000_0_50%)] bg-[length:8px_8px] opacity-60 z-0 border-l border-white/30" />

        {/* 4 Driving Sub-Lanes Dividers (Horizontal Dashed Road Markings) */}
        <div className="absolute left-3 right-8 top-[25%] border-b border-dashed border-slate-700/60 pointer-events-none" />
        <div className="absolute left-3 right-8 top-[50%] border-b-2 border-dashed border-amber-400/40 pointer-events-none" />
        <div className="absolute left-3 right-8 top-[75%] border-b border-dashed border-slate-700/60 pointer-events-none" />

        {/* Milestone Distance Markers along track bottom */}
        <div className="absolute bottom-1 left-4 right-10 flex justify-between text-[9px] font-mono font-bold text-slate-600 pointer-events-none">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span className="text-amber-400">100% 🏆</span>
        </div>

        {/* All Racers Driving on the Single Track */}
        <div className="relative h-full w-[calc(100%-110px)] ml-4">
          {racers.slice(0, 4).map((racer, index) => {
            const clampedScore = Math.min(100, Math.max(0, racer.score));
            const isLeader = leaderId === racer.id && racer.score > 0;
            const isNitroActive = racer.isSelf && userStreak >= 20;
            const topPosition = laneTops[index % laneTops.length];
            const carConfig = CAR_CONFIGS[index % CAR_CONFIGS.length];
            const carImage = racer.carImage || carConfig.image;
            const shouldRotate = racer.rotateCar ?? carConfig.rotate180;

            return (
              <motion.div
                key={racer.id || index}
                className="absolute flex items-center z-10 -translate-y-1/2"
                style={{ top: `${topPosition}%` }}
                animate={{
                  left: `${clampedScore}%`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 18,
                }}
              >
                {/* Flame Exhaust Trail if moving */}
                {clampedScore > 0 && clampedScore < 100 && (
                  <span
                    className={`mr-0.5 text-xs select-none ${
                      isNitroActive ? "text-rose-500 scale-125 animate-bounce" : "text-amber-400"
                    }`}
                  >
                    🔥
                  </span>
                )}

                {/* Car Container */}
                <div className="relative flex flex-col items-center">
                  {/* Subtle Floating Info: YOU badge / 1ST Crown / Live WPM */}
                  <div className="absolute -top-3.5 flex items-center gap-1 pointer-events-none whitespace-nowrap z-20">
                    {racer.isSelf && (
                      <span className="text-[8px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-sm ring-1 ring-white/30">
                        YOU
                      </span>
                    )}
                    {isLeader && (
                      <span className="text-[8px] font-black bg-amber-400 text-black px-1 py-0.2 rounded flex items-center gap-0.5 shadow-sm">
                        <Crown className="h-2 w-2 fill-black" />
                        1ST
                      </span>
                    )}
                    <span className="text-[8px] font-mono font-bold text-white/90 bg-slate-900/80 px-1 py-0.2 rounded border border-white/10 backdrop-blur-xs">
                      {Math.round(racer.wpm)}W
                    </span>
                  </div>

                  {/* Car Image with 180deg rotation for car3 */}
                  <img
                    src={carImage}
                    alt={racer.name}
                    className={`h-9 sm:h-11 w-auto max-w-[100px] sm:max-w-[125px] object-contain select-none pointer-events-none transition-transform duration-100 ${
                      racer.isSelf
                        ? "drop-shadow-[0_4px_12px_rgba(244,63,94,0.7)]"
                        : "drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                    }`}
                    style={{
                      transform: shouldRotate ? "rotateY(180deg)" : undefined,
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Leaderboard / Racer Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {racers.slice(0, 4).map((racer, index) => {
          const isLeader = leaderId === racer.id && racer.score > 0;
          const carConfig = CAR_CONFIGS[index % CAR_CONFIGS.length];
          const carImage = racer.carImage || carConfig.image;
          const shouldRotate = racer.rotateCar ?? carConfig.rotate180;

          return (
            <div
              key={racer.id || index}
              className={`p-2 rounded-xl border text-xs flex items-center justify-between ${
                racer.isSelf
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-slate-800/40 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <div className="h-4 w-9 shrink-0 flex items-center justify-center">
                  <img
                    src={carImage}
                    alt={racer.name}
                    className="h-full w-full object-contain select-none"
                    style={{
                      transform: shouldRotate ? "rotateY(180deg)" : undefined,
                    }}
                  />
                </div>
                <span className="font-bold truncate text-[11px] text-white">
                  {racer.name}
                </span>
                {isLeader && <Crown className="h-3 w-3 text-amber-400" />}
              </div>

              <div className="font-mono text-[11px] text-right">
                <span className="text-white font-black">{Math.round(racer.score)}%</span>
                <span className="text-[10px] text-slate-500 block">
                  {Math.round(racer.wpm)} WPM
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RaceTrack;
