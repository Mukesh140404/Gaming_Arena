import React from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Choice, ChoiceCardMeta } from "./types";
import { rpsSound } from "./sound";

interface ChoiceCardsProps {
  selectedChoice: Choice | null;
  onSelect: (choice: Choice) => void;
  disabled: boolean;
}

const CARDS: ChoiceCardMeta[] = [
  {
    type: "rock",
    label: "ROCK",
    emoji: "🪨",
    description: "Crushes Scissors with crushing force",
    beats: "Beats Scissors",
    colorScheme: {
      bg: "from-rose-500/10 via-amber-500/5 to-white",
      border: "hover:border-rose-400",
      glow: "hover:shadow-rose-500/15",
      accent: "text-rose-600",
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
      badgeText: "text-rose-700",
    },
  },
  {
    type: "paper",
    label: "PAPER",
    emoji: "📄",
    description: "Covers & neutralizes Rock completely",
    beats: "Beats Rock",
    colorScheme: {
      bg: "from-emerald-500/10 via-teal-500/5 to-white",
      border: "hover:border-emerald-400",
      glow: "hover:shadow-emerald-500/15",
      accent: "text-emerald-600",
      badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeText: "text-emerald-700",
    },
  },
  {
    type: "scissors",
    label: "SCISSORS",
    emoji: "✂️",
    description: "Slices through Paper with precision",
    beats: "Beats Paper",
    colorScheme: {
      bg: "from-indigo-500/10 via-purple-500/5 to-white",
      border: "hover:border-indigo-400",
      glow: "hover:shadow-indigo-500/15",
      accent: "text-indigo-600",
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
      badgeText: "text-indigo-700",
    },
  },
];

export const ChoiceCards: React.FC<ChoiceCardsProps> = ({
  selectedChoice,
  onSelect,
  disabled,
}) => {
  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
          Make Your Move
        </h3>
        <p className="text-xs text-gray-400">
          {disabled
            ? "Your choice is locked. Wait for the round outcome or next round."
            : "Click one of the cards below to lock in your strike"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CARDS.map((card) => {
          const isSelected = selectedChoice === card.type;

          return (
            <motion.button
              key={card.type}
              type="button"
              disabled={disabled}
              onMouseEnter={() => {
                if (!disabled) rpsSound.playHover();
              }}
              onClick={() => {
                if (!disabled) {
                  rpsSound.playSelect();
                  onSelect(card.type);
                }
              }}
              whileHover={
                !disabled
                  ? { scale: 1.03, y: -4, transition: { duration: 0.15 } }
                  : {}
              }
              whileTap={!disabled ? { scale: 0.98 } : {}}
              className={`relative flex flex-col items-center justify-between p-6 rounded-3xl border-2 text-center transition-all duration-200 ${
                isSelected
                  ? "bg-gradient-to-b from-rose-50 to-white border-rose-500 shadow-xl shadow-rose-200/50 ring-4 ring-rose-100"
                  : disabled
                    ? "bg-gray-50/80 border-gray-200 opacity-60 cursor-not-allowed"
                    : `bg-gradient-to-b ${card.colorScheme.bg} border-gray-200/80 hover:shadow-xl ${card.colorScheme.border} ${card.colorScheme.glow} cursor-pointer`
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-sm">
                  <Check className="h-3 w-3 stroke-[3]" /> Locked
                </span>
              )}

              {/* Big Emoji / Icon */}
              <div className="h-24 w-24 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-5xl shadow-sm mb-3 select-none">
                {card.emoji}
              </div>

              {/* Title */}
              <h4 className="text-lg font-black text-gray-900 tracking-tight">
                {card.label}
              </h4>

              {/* Description */}
              <p className="text-xs text-gray-500 mt-1 mb-3 line-clamp-1">
                {card.description}
              </p>

              {/* Advantage Badge */}
              <span
                className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${card.colorScheme.badgeBg}`}
              >
                {card.beats}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
