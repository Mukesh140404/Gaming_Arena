import React from "react";
import { History } from "lucide-react";
import type { Choice, RoundResult } from "./types";

interface RoundHistoryProps {
  history: RoundResult[];
  myId?: string;
  myName: string;
  opponentName: string;
}

const CHOICE_EMOJIS: Record<Choice, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

export const RoundHistory: React.FC<RoundHistoryProps> = ({
  history,
  myId,
  myName,
  opponentName,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-4 shadow-xs w-full">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-gray-500" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
          Match Round History
        </h4>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {history.map((round) => {
          const isMyWin = round.winnerId === myId;
          const isOppWin = round.winnerId && round.winnerId !== myId;

          const myChoice = myId ? round.choices[myId] : null;
          const oppId = Object.keys(round.choices).find((id) => id !== myId);
          const oppChoice = oppId ? round.choices[oppId] : null;

          return (
            <div
              key={round.roundNumber}
              className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium transition ${
                isMyWin
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
                  : isOppWin
                    ? "bg-rose-50/80 border-rose-200 text-rose-800"
                    : "bg-amber-50/80 border-amber-200 text-amber-800"
              }`}
            >
              <span className="font-mono font-bold text-[11px] opacity-70">
                R{round.roundNumber}
              </span>

              <div className="flex items-center gap-1 font-bold">
                <span title={`${myName}: ${myChoice || "Unknown"}`}>
                  {myChoice ? CHOICE_EMOJIS[myChoice] : "❓"}
                </span>
                <span className="opacity-40 text-[10px]">vs</span>
                <span title={`${opponentName}: ${oppChoice || "Unknown"}`}>
                  {oppChoice ? CHOICE_EMOJIS[oppChoice] : "❓"}
                </span>
              </div>

              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                  isMyWin
                    ? "bg-emerald-200/60 text-emerald-900"
                    : isOppWin
                      ? "bg-rose-200/60 text-rose-900"
                      : "bg-amber-200/60 text-amber-900"
                }`}
              >
                {isMyWin ? "+1 You" : isOppWin ? "+1 Opp" : "Draw"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
