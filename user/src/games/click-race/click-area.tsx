import React, { useEffect, useState } from "react";
import { Zap, Flame } from "lucide-react";

interface ClickAreaProps {
  onTap: () => void;
  disabled: boolean;
  comboCount: number;
  playerScore: number;
  targetClicks: number;
}

export const ClickArea: React.FC<ClickAreaProps> = ({
  onTap,
  disabled,
  comboCount,
  playerScore,
  targetClicks,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Spacebar hotkey listener for rapid tapping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !disabled) {
        e.preventDefault();
        setIsPressed(true);
        onTap();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onTap, disabled]);

  const handlePointerDown = () => {
    if (disabled) return;
    setIsPressed(true);
    onTap();
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-4 select-none">
      {/* Combo / Turbo Streak Banner */}
      <div className="h-7 flex items-center justify-center">
        {comboCount >= 3 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-rose-500 to-amber-500 text-white font-black text-xs shadow-md shadow-rose-500/25 animate-bounce">
            <Flame className="h-3.5 w-3.5 fill-current" />
            <span>TURBO STREAK x{comboCount}!</span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-gray-400">
            Click as fast as you can to trigger Turbo!
          </span>
        )}
      </div>

      {/* Big Interactive 3D Tap Button */}
      <div className="relative group">
        {/* Glow halo behind button */}
        <div
          className={`absolute -inset-2 rounded-full transition-opacity duration-300 blur-xl ${
            comboCount >= 5
              ? "bg-linear-to-r from-rose-500 to-amber-500 opacity-70"
              : "bg-rose-500/30 opacity-40 group-hover:opacity-60"
          }`}
        />

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          disabled={disabled}
          className={`relative h-44 w-44 sm:h-52 sm:w-52 rounded-full flex flex-col items-center justify-center font-sans font-black text-white shadow-2xl transition-all duration-75 select-none touch-manipulation cursor-pointer border-4 ${
            disabled
              ? "bg-gray-300 border-gray-400 cursor-not-allowed opacity-60 shadow-none"
              : isPressed
              ? "bg-linear-to-b from-rose-600 to-rose-700 border-rose-300 scale-95 shadow-inner translate-y-1"
              : "bg-linear-to-b from-rose-500 via-rose-500 to-rose-600 border-rose-300 hover:scale-[1.03] active:scale-95 shadow-rose-500/50"
          }`}
        >
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full border-2 border-white/30 pointer-events-none" />

          <Zap
            className={`h-10 w-10 sm:h-12 sm:w-12 transition-transform duration-100 ${
              isPressed ? "scale-125" : "scale-100"
            }`}
          />
          <span className="text-xl sm:text-2xl tracking-wider uppercase mt-1">
            {disabled ? "RACE OVER" : "TAP FAST!"}
          </span>
          <span className="text-xs font-mono font-medium opacity-90 mt-0.5">
            {playerScore} / {targetClicks}
          </span>
        </button>
      </div>

      {/* Control Hint */}
      <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1.5 pt-1">
        <span>Click the button or press</span>
        <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono font-bold text-[11px] shadow-2xs">
          Spacebar
        </kbd>
        <span>to accelerate!</span>
      </div>
    </div>
  );
};

export default ClickArea;
