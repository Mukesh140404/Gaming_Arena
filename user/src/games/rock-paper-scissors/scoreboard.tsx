import React from "react";
import { User, ShieldCheck, Clock, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { RPSPlayer } from "./types";

interface ScoreboardProps {
  myId?: string;
  myName: string;
  myPlayer?: RPSPlayer;
  opponentName: string;
  opponentPlayer?: RPSPlayer;
  targetScore: number;
  currentRound: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  myName,
  myPlayer,
  opponentName,
  opponentPlayer,
  targetScore,
  currentRound,
}) => {
  const myScore = myPlayer?.score ?? 0;
  const oppScore = opponentPlayer?.score ?? 0;
  const myLocked = myPlayer?.choice !== null;
  const oppLocked = opponentPlayer?.hasChosen ?? (opponentPlayer?.choice !== null);

  return (
    <div className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-20 left-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Left: You */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/30">
              <div className="h-full w-full bg-gray-900 rounded-[14px] flex items-center justify-center text-rose-400 font-bold">
                <User className="h-6 w-6" />
              </div>
            </div>
            {myLocked && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 bg-emerald-500 rounded-full items-center justify-center ring-2 ring-gray-900">
                <ShieldCheck className="h-3 w-3 text-white" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase font-extrabold tracking-wider text-rose-400">
                YOU
              </span>
              <span className="text-xs text-gray-400 font-mono">({myName})</span>
            </div>

            {/* Score Points */}
            <div className="flex items-center gap-1.5 mt-1.5">
              {Array.from({ length: targetScore }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2.5 w-6 rounded-full transition-all duration-300 ${
                    idx < myScore
                      ? "bg-rose-500 shadow-sm shadow-rose-500/50"
                      : "bg-gray-800 border border-gray-700/60"
                  }`}
                />
              ))}
            </div>

            {/* Status indicator */}
            <div className="mt-2 text-xs font-semibold flex items-center gap-1.5">
              {myLocked ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Choice Locked
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                  <Clock className="h-3.5 w-3.5" /> Selecting...
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              {myScore}
            </span>
          </div>
        </div>

        {/* Center: VS Emblem */}
        <div className="flex flex-col items-center justify-center text-center py-2 md:py-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold tracking-widest text-gray-300 uppercase mb-2">
            <Trophy className="h-3 w-3 text-amber-400" />
            Round {currentRound}
          </div>

          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="h-full w-full bg-gray-950 rounded-full flex items-center justify-center">
                <span className="font-black text-sm tracking-tighter bg-gradient-to-r from-rose-400 via-amber-300 to-indigo-300 bg-clip-text text-transparent">
                  VS
                </span>
              </div>
            </div>
          </motion.div>

          <span className="text-[11px] text-gray-400 font-medium mt-2">
            Target: {targetScore} Wins
          </span>
        </div>

        {/* Right: Opponent */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="text-left">
            <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
              {oppScore}
            </span>
          </div>

          <div className="flex-1 min-w-0 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span className="text-xs text-gray-400 font-mono truncate max-w-[120px]">
                ({opponentName})
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-blue-400">
                OPPONENT
              </span>
            </div>

            {/* Score Points */}
            <div className="flex items-center justify-end gap-1.5 mt-1.5">
              {Array.from({ length: targetScore }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2.5 w-6 rounded-full transition-all duration-300 ${
                    idx < oppScore
                      ? "bg-blue-500 shadow-sm shadow-blue-500/50"
                      : "bg-gray-800 border border-gray-700/60"
                  }`}
                />
              ))}
            </div>

            {/* Status indicator */}
            <div className="mt-2 text-xs font-semibold flex items-center justify-end gap-1.5">
              {oppLocked ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  Ready <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                  Deciding... <Clock className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/30">
              <div className="h-full w-full bg-gray-900 rounded-[14px] flex items-center justify-center text-blue-400 font-bold">
                <User className="h-6 w-6" />
              </div>
            </div>
            {oppLocked && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 bg-emerald-500 rounded-full items-center justify-center ring-2 ring-gray-900">
                <ShieldCheck className="h-3 w-3 text-white" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
