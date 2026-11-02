import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Swords, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Choice, RoundResult } from "./types";

interface BattleArenaProps {
  phase: "choosing" | "round-resolved";
  myChoice: Choice | null;
  opponentChoice: Choice | null;
  opponentHasChosen: boolean;
  lastRound: RoundResult | null;
  myId?: string;
  myName: string;
  opponentName: string;
  onNextRound: () => void;
  isGameOver: boolean;
}

const CHOICE_ICONS: Record<Choice, { emoji: string; name: string; color: string; border: string }> = {
  rock: {
    emoji: "🪨",
    name: "Rock",
    color: "from-amber-500 to-rose-600",
    border: "border-rose-400",
  },
  paper: {
    emoji: "📄",
    name: "Paper",
    color: "from-emerald-400 to-teal-600",
    border: "border-emerald-400",
  },
  scissors: {
    emoji: "✂️",
    name: "Scissors",
    color: "from-purple-500 to-indigo-600",
    border: "border-indigo-400",
  },
};

export const BattleArena: React.FC<BattleArenaProps> = ({
  phase,
  myChoice,
  opponentChoice,
  opponentHasChosen,
  lastRound,
  myId,
  myName,
  opponentName,
  onNextRound,
  isGameOver,
}) => {
  const isResolved = phase === "round-resolved" && lastRound !== null;

  const roundWinnerId = lastRound?.winnerId;
  const isMyRoundWin = isResolved && roundWinnerId === myId;
  const isOppRoundWin = isResolved && roundWinnerId && roundWinnerId !== myId;

  const roundMyChoice = isResolved && myId && lastRound.choices[myId]
    ? lastRound.choices[myId]
    : myChoice;

  const opponentId = isResolved
    ? Object.keys(lastRound?.choices || {}).find((id) => id !== myId)
    : undefined;

  const roundOppChoice = isResolved && opponentId && lastRound?.choices[opponentId]
    ? lastRound.choices[opponentId]
    : opponentChoice;

  return (
    <div className="relative bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-sm overflow-hidden min-h-[320px] flex flex-col justify-center items-center">
      {/* Background ambient pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* Phase 1: Choosing State */}
        {!isResolved && (
          <motion.div
            key="choosing-stage"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="w-full flex flex-col items-center justify-center text-center py-4"
          >
            <div className="flex items-center justify-center gap-8 sm:gap-16 w-full max-w-lg mb-6">
              {/* You Slot */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {myName} (You)
                </span>
                <div
                  className={`w-28 h-32 sm:w-32 sm:h-36 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                    myChoice
                      ? "bg-rose-50 border-2 border-rose-400 shadow-lg shadow-rose-200/60 scale-105"
                      : "bg-gray-50 border-2 border-dashed border-gray-300 text-gray-400"
                  }`}
                >
                  {myChoice ? (
                    <>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-4xl sm:text-5xl mb-1 select-none"
                      >
                        {CHOICE_ICONS[myChoice].emoji}
                      </motion.span>
                      <span className="text-xs font-black uppercase text-rose-700">
                        {CHOICE_ICONS[myChoice].name}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                        <CheckCircle2 className="h-3 w-3" /> Ready
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center p-2 text-center">
                      <Swords className="h-7 w-7 text-gray-400 animate-bounce mb-1" />
                      <span className="text-xs font-medium text-gray-400">
                        Pick below
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Clash Divider */}
              <div className="flex flex-col items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-black text-xs">
                  VS
                </div>
              </div>

              {/* Opponent Slot */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {opponentName}
                </span>
                <div
                  className={`w-28 h-32 sm:w-32 sm:h-36 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                    opponentHasChosen
                      ? "bg-blue-50 border-2 border-blue-400 shadow-lg shadow-blue-200/60 scale-105"
                      : "bg-gray-50 border-2 border-dashed border-gray-300 text-gray-400"
                  }`}
                >
                  {opponentHasChosen ? (
                    <div className="flex flex-col items-center text-center p-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-4xl sm:text-5xl mb-1 select-none"
                      >
                        🔒
                      </motion.div>
                      <span className="text-xs font-black uppercase text-blue-700">
                        Locked In
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                        <CheckCircle2 className="h-3 w-3" /> Ready
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center p-2 text-center">
                      <div className="h-3 w-3 rounded-full bg-amber-400 animate-ping mb-2" />
                      <span className="text-xs font-medium text-gray-400">
                        Thinking...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-xs font-bold text-gray-700">
              <Sparkles className="h-4 w-4 text-amber-500" />
              {myChoice
                ? "Your choice is locked! Awaiting opponent's strike..."
                : "Choose your weapon below to engage in battle!"}
            </div>
          </motion.div>
        )}

        {/* Phase 2: Clash / Round Resolved */}
        {isResolved && (
          <motion.div
            key="resolved-stage"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center justify-center text-center py-2"
          >
            {/* Clash Display */}
            <div className="flex items-center justify-center gap-6 sm:gap-14 w-full max-w-lg mb-6">
              {/* Your Card */}
              {roundMyChoice && (
                <motion.div
                  initial={{ x: -60, rotate: -15, scale: 0.8 }}
                  animate={{ x: 0, rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {myName}
                  </span>
                  <div
                    className={`w-28 h-32 sm:w-32 sm:h-36 rounded-2xl flex flex-col items-center justify-center border-2 ${
                      isMyRoundWin
                        ? "bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-200 ring-4 ring-emerald-200"
                        : "bg-white border-gray-300 shadow-md"
                    }`}
                  >
                    <span className="text-4xl sm:text-5xl mb-1 select-none">
                      {CHOICE_ICONS[roundMyChoice].emoji}
                    </span>
                    <span className="text-xs font-black uppercase text-gray-800">
                      {CHOICE_ICONS[roundMyChoice].name}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Clash Boom / Result Emblem */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center"
              >
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center text-xl shadow-lg ${
                    isMyRoundWin
                      ? "bg-emerald-500 text-white shadow-emerald-500/40"
                      : isOppRoundWin
                        ? "bg-rose-500 text-white shadow-rose-500/40"
                        : "bg-amber-500 text-white shadow-amber-500/40"
                  }`}
                >
                  {isMyRoundWin ? "⚡" : isOppRoundWin ? "💥" : "🤝"}
                </div>
              </motion.div>

              {/* Opponent Card */}
              {roundOppChoice && (
                <motion.div
                  initial={{ x: 60, rotate: 15, scale: 0.8 }}
                  animate={{ x: 0, rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {opponentName}
                  </span>
                  <div
                    className={`w-28 h-32 sm:w-32 sm:h-36 rounded-2xl flex flex-col items-center justify-center border-2 ${
                      isOppRoundWin
                        ? "bg-rose-50 border-rose-500 shadow-xl shadow-rose-200 ring-4 ring-rose-200"
                        : "bg-white border-gray-300 shadow-md"
                    }`}
                  >
                    <span className="text-4xl sm:text-5xl mb-1 select-none">
                      {CHOICE_ICONS[roundOppChoice].emoji}
                    </span>
                    <span className="text-xs font-black uppercase text-gray-800">
                      {CHOICE_ICONS[roundOppChoice].name}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Verdict Banner */}
            <div className="mb-4">
              <h3
                className={`text-xl sm:text-2xl font-black tracking-tight ${
                  isMyRoundWin
                    ? "text-emerald-600"
                    : isOppRoundWin
                      ? "text-rose-600"
                      : "text-amber-600"
                }`}
              >
                {isMyRoundWin
                  ? "🎉 You Won This Round!"
                  : isOppRoundWin
                    ? "💥 Opponent Won This Round!"
                    : "🤝 Round Ended in a Draw!"}
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {roundMyChoice && roundOppChoice && (
                  <>
                    {roundMyChoice === roundOppChoice
                      ? `Both players chose ${CHOICE_ICONS[roundMyChoice].name}. Scores remain unchanged.`
                      : isMyRoundWin
                        ? `${CHOICE_ICONS[roundMyChoice].name} beats ${CHOICE_ICONS[roundOppChoice].name}!`
                        : `${CHOICE_ICONS[roundOppChoice].name} beats ${CHOICE_ICONS[roundMyChoice].name}!`
                    }
                  </>
                )}
              </p>
            </div>

            {/* Next Round CTA (unless match is over) */}
            {!isGameOver && (
              <Button
                onClick={onNextRound}
                className="rounded-xl bg-[#FF6562] hover:bg-[#fa534f] text-white font-bold px-6 py-2.5 shadow-md shadow-red-200 cursor-pointer flex items-center gap-1.5 transition active:scale-95"
              >
                <span>Continue to Next Round</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
