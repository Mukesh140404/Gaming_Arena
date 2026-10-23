import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  RotateCcw,
  Share2,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TypingRacer } from "./config";
import { toast } from "sonner";

interface RaceWinModalProps {
  userRacer: TypingRacer;
  racers: TypingRacer[];
  elapsedTime: number;
  totalKeystrokes: number;
  errorCount: number;
  onRestart: () => void;
  onNextQuote?: () => void;
}

export const RaceWinModal: React.FC<RaceWinModalProps> = ({
  userRacer,
  racers,
  elapsedTime,
  totalKeystrokes,
  errorCount,
  onRestart,
  onNextQuote,
}) => {
  const [copied, setCopied] = useState(false);

  // Sort racers by placement
  const sortedRacers = [...racers].sort((a, b) => {
    if (a.completed && b.completed) {
      return (a.finishTime || 0) - (b.finishTime || 0);
    }
    if (a.completed) return -1;
    if (b.completed) return 1;
    return b.score - a.score;
  });

  const userRankIndex = sortedRacers.findIndex((r) => r.id === userRacer.id);
  const isChampion = userRankIndex === 0;

  // Format time
  const formatTime = (ms: number) => {
    const totalSecs = (ms / 1000).toFixed(1);
    return `${totalSecs}s`;
  };

  const handleShare = () => {
    const shareText = `🏎️ Typing Race Arena: Finished #${userRankIndex + 1} with ${Math.round(
      userRacer.wpm
    )} WPM and ${userRacer.accuracy}% accuracy in ${formatTime(elapsedTime)}! ⚡`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success("Race results copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Background glow celebration */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-linear-to-br from-amber-400/20 via-rose-500/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-linear-to-tr from-cyan-400/20 via-purple-500/20 to-transparent blur-3xl" />

      {/* Podium Header */}
      <div className="text-center space-y-2 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-tr from-amber-300 via-amber-400 to-yellow-500 text-white shadow-xl shadow-amber-400/30"
        >
          <Trophy className="h-10 w-10 text-white drop-shadow-md" />
        </motion.div>

        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl sm:text-3xl font-black text-[#1F2438]">
            {isChampion ? "Race Champion!" : "Race Completed!"}
          </span>
          <span className="text-xl">
            {userRankIndex === 0 ? "🥇" : userRankIndex === 1 ? "🥈" : "🥉"}
          </span>
        </div>

        <p className="text-xs sm:text-sm font-medium text-gray-500">
          You finished in{" "}
          <span className="font-bold text-gray-800">
            #{userRankIndex + 1} place
          </span>{" "}
          out of {racers.length} competitors!
        </p>
      </div>

      {/* Stat Cards Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        <div className="rounded-2xl bg-linear-to-br from-[#FF6562]/10 to-rose-50 border border-[#FF6562]/20 p-3.5 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
            Speed
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-[#E85D56]">
            {Math.round(userRacer.wpm)}
          </span>
          <span className="text-[10px] text-gray-400 font-bold block">WPM</span>
        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3.5 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
            Accuracy
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-600">
            {userRacer.accuracy}%
          </span>
          <span className="text-[10px] text-gray-400 font-bold block">
            {errorCount} errors
          </span>
        </div>

        <div className="rounded-2xl bg-cyan-50 border border-cyan-200/80 p-3.5 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
            Time
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-700">
            {formatTime(elapsedTime)}
          </span>
          <span className="text-[10px] text-gray-400 font-bold block">
            total duration
          </span>
        </div>

        <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-3.5 text-center">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
            Keystrokes
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-black text-amber-700">
            {totalKeystrokes}
          </span>
          <span className="text-[10px] text-gray-400 font-bold block">
            chars entered
          </span>
        </div>
      </div>

      {/* Leaderboard Table / Standings */}
      <div className="space-y-2 relative z-10">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400 block px-1">
          Final Standings
        </span>
        <div className="space-y-1.5">
          {sortedRacers.map((racer, index) => (
            <div
              key={racer.id}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border text-xs ${
                racer.isSelf
                  ? "border-[#FF6562]/40 bg-[#FCECE9]/40 font-black text-[#1F2438]"
                  : "border-gray-100 bg-gray-50/70 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-lg font-mono font-black text-xs ${
                    index === 0
                      ? "bg-amber-400 text-white"
                      : index === 1
                      ? "bg-gray-300 text-gray-800"
                      : index === 2
                      ? "bg-amber-700 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </span>

                <span className="text-base">{racer.avatar}</span>

                <span className="truncate max-w-[120px] sm:max-w-none">
                  {racer.name} {racer.isSelf && "(You)"}
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <span className="font-bold text-gray-500">
                  {Math.round(racer.wpm)} WPM
                </span>
                <span className="font-black text-emerald-600">
                  {racer.accuracy}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 relative z-10">
        <Button
          onClick={onRestart}
          className="w-full sm:flex-1 h-12 rounded-2xl bg-[#FF6562] hover:bg-[#fa534f] text-white font-black text-xs shadow-md shadow-red-200 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          <span>Race Again</span>
        </Button>

        {onNextQuote && (
          <Button
            variant="outline"
            onClick={onNextQuote}
            className="w-full sm:flex-1 h-12 rounded-2xl border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs cursor-pointer"
          >
            <span>Next Quote Challenge</span>
            <ChevronRight className="h-4 w-4 ml-1.5" />
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleShare}
          className="w-full sm:w-auto h-12 px-4 rounded-2xl border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs cursor-pointer"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default RaceWinModal;
