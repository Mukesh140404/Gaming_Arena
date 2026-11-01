import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion } from "motion/react";
import { Flame, AlertCircle, CornerDownLeft, Sparkles } from "lucide-react";
import { typingSfx } from "./config";

interface TypingAreaProps {
  targetText: string;
  disabled: boolean;
  onProgress: (metrics: {
    progress: number;
    wpm: number;
    accuracy: number;
    completed: boolean;
    totalKeystrokes: number;
    errorCount: number;
  }) => void;
  onStreakChange?: (streak: number) => void;
  startTime: number | null;
  onFirstKey: () => void;
}

export const TypingArea: React.FC<TypingAreaProps> = ({
  targetText,
  disabled,
  onProgress,
  onStreakChange,
  startTime,
  onFirstKey,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typedText, setTypedText] = useState("");
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Track which words have already been logged to console
  const lastLoggedWordCountRef = useRef<number>(0);

  // Parse words and their required typed lengths from targetText
  const wordList = useMemo(() => {
    const list: { word: string; requiredLength: number }[] = [];
    const regex = /\S+/g;
    let match;
    const matches: { word: string; index: number }[] = [];
    while ((match = regex.exec(targetText)) !== null) {
      matches.push({ word: match[0], index: match.index });
    }

    for (let i = 0; i < matches.length; i++) {
      const isLast = i === matches.length - 1;
      // Word is complete when typed text covers the word and the space (or end of quote)
      const requiredLength = isLast
        ? matches[i].index + matches[i].word.length
        : matches[i].index + matches[i].word.length + 1; // +1 includes the space

      list.push({
        word: matches[i].word,
        requiredLength,
      });
    }

    return list;
  }, [targetText]);

  // Calculate completed words count for any typed text
  const getCompletedWordsCount = useCallback(
    (typed: string) => {
      let count = 0;
      for (let i = 0; i < wordList.length; i++) {
        if (typed.length >= wordList[i].requiredLength) {
          count++;
        } else {
          break;
        }
      }
      return count;
    },
    [wordList]
  );

  // Focus input automatically and on click
  const focusInput = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  useEffect(() => {
    focusInput();
  }, [focusInput, disabled]);

  // Reset internal state when targetText changes
  useEffect(() => {
    setTypedText("");
    setStreak(0);
    setTotalKeystrokes(0);
    setErrorCount(0);
    setHasError(false);
    lastLoggedWordCountRef.current = 0;
    focusInput();
  }, [targetText, focusInput]);

  // Real-time calculation of WPM, Accuracy, and WORD-BASED Progress
  const calculateMetrics = useCallback(
    (currentTyped: string, errors: number, totalKeys: number) => {
      const targetLen = targetText.length;
      const completedWords = getCompletedWordsCount(currentTyped);

      // Word-by-word progress: progress only increases when a full word is completed!
      const progress =
        wordList.length > 0
          ? Math.min(100, (completedWords / wordList.length) * 100)
          : 0;

      const isCompleted =
        currentTyped.length >= targetLen && currentTyped === targetText;

      let wpm = 0;
      if (startTime) {
        const timeElapsedMinutes = (Date.now() - startTime) / 60000;
        if (timeElapsedMinutes > 0.01) {
          const wordsTyped = currentTyped.length / 5;
          wpm = Math.max(0, wordsTyped / timeElapsedMinutes);
        }
      }

      let accuracy = 100;
      if (totalKeys > 0) {
        accuracy = Math.max(
          0,
          Math.round(((totalKeys - errors) / totalKeys) * 1000) / 10
        );
      }

      // Check and console.log when a word is completed
      if (completedWords > lastLoggedWordCountRef.current) {
        for (let idx = lastLoggedWordCountRef.current; idx < completedWords; idx++) {
          const completedWord = wordList[idx]?.word;
          const wordProgress = Math.round(((idx + 1) / wordList.length) * 100);
          console.log(
            `%c[Typing Race] Word completed: "${completedWord}" (${idx + 1}/${wordList.length}) | Progress: ${wordProgress}% | Speed: ${Math.round(wpm)} WPM`,
            "color: #10b981; font-weight: bold; font-size: 13px; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;"
          );
        }
        lastLoggedWordCountRef.current = completedWords;
      } else if (completedWords < lastLoggedWordCountRef.current) {
        lastLoggedWordCountRef.current = completedWords;
      }

      return {
        progress,
        wpm,
        accuracy,
        completed: isCompleted,
        totalKeystrokes: totalKeys,
        errorCount: errors,
      };
    },
    [targetText, startTime, wordList, getCompletedWordsCount]
  );

  // Handle keystroke logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Detect Caps Lock state
    setCapsLockActive(e.getModifierState("CapsLock"));

    // Prevent default scrolling on space
    if (e.key === " ") {
      e.preventDefault();
    }

    // Ignore modifier keys like Shift, Control, Alt
    if (
      e.key === "Shift" ||
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "Meta"
    ) {
      return;
    }

    // Handle Backspace
    if (e.key === "Backspace") {
      if (typedText.length > 0) {
        const nextTyped = typedText.slice(0, -1);
        setTypedText(nextTyped);
        setStreak(0);
        onStreakChange?.(0);
        setHasError(false);

        const metrics = calculateMetrics(
          nextTyped,
          errorCount,
          totalKeystrokes
        );
        onProgress(metrics);
        typingSfx.playKey(typedText.length);
      }
      return;
    }

    // Only process single printable characters
    if (e.key.length !== 1) return;

    // Trigger start timer on first keypress
    if (!startTime) {
      onFirstKey();
    }

    const nextCharIndex = typedText.length;
    if (nextCharIndex >= targetText.length) return;

    const expectedChar = targetText[nextCharIndex];
    const inputChar = e.key;

    const nextTotalKeys = totalKeystrokes + 1;
    setTotalKeystrokes(nextTotalKeys);

    if (inputChar === expectedChar) {
      // Correct character typed
      const nextTyped = typedText + inputChar;
      setTypedText(nextTyped);
      setHasError(false);

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      onStreakChange?.(nextStreak);

      // Play audio feedback
      typingSfx.playKey(nextCharIndex);
      if (nextStreak > 0 && nextStreak % 15 === 0) {
        typingSfx.playComboChime(Math.floor(nextStreak / 15));
      }

      const metrics = calculateMetrics(nextTyped, errorCount, nextTotalKeys);
      onProgress(metrics);

      if (metrics.completed) {
        typingSfx.playVictory();
      }
    } else {
      // Incorrect character typed (Error)
      setHasError(true);
      const nextErrors = errorCount + 1;
      setErrorCount(nextErrors);
      setStreak(0);
      onStreakChange?.(0);

      typingSfx.playError();

      const metrics = calculateMetrics(typedText, nextErrors, nextTotalKeys);
      onProgress(metrics);
    }
  };

  // Render text segments
  const characters = useMemo(() => {
    return targetText.split("").map((char, index) => {
      let status: "correct" | "current" | "untyped" = "untyped";
      let isErrorAtCurrent = false;

      if (index < typedText.length) {
        status = "correct";
      } else if (index === typedText.length) {
        status = "current";
        isErrorAtCurrent = hasError;
      }

      return {
        char,
        index,
        status,
        isErrorAtCurrent,
      };
    });
  }, [targetText, typedText, hasError]);

  return (
    <div
      onClick={focusInput}
      className={`relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 select-none cursor-text ${
        hasError
          ? "border-rose-400 bg-rose-50/30 shadow-xs"
          : "border-gray-200 bg-white shadow-xs"
      }`}
    >
      {/* Hidden real input capturing key events */}
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none -top-10"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {/* Top Bar inside Typing Box */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        {/* Streak / Combo Meter */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all ${
              streak >= 25
                ? "bg-linear-to-r from-[#FF6562] to-amber-500 text-white shadow-md shadow-red-200 scale-105"
                : streak >= 10
                ? "bg-amber-100 text-amber-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Flame
              className={`h-3.5 w-3.5 ${
                streak >= 20 ? "fill-white animate-bounce" : "fill-amber-500"
              }`}
            />
            <span>
              {streak >= 25 ? "MAX NITRO" : `Streak: ${streak}`}
            </span>
          </div>

          {streak >= 15 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[11px] font-black text-[#FF6562] flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" /> SPEED BOOST!
            </motion.span>
          )}
        </div>

        {/* Warning Flags: CapsLock & Focus Prompt */}
        <div className="flex items-center gap-2">
          {capsLockActive && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
              <AlertCircle className="h-3.5 w-3.5" />
              Caps Lock ON
            </span>
          )}

          <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> Click anywhere to focus
          </span>
        </div>
      </div>

      {/* Main Typography Text Container */}
      <div className="relative font-mono text-base sm:text-xl lg:text-2xl leading-relaxed sm:leading-loose tracking-wide">
        {characters.map(({ char, index, status, isErrorAtCurrent }) => {
          if (status === "correct") {
            return (
              <span
                key={index}
                className="text-emerald-600 font-semibold transition-colors duration-100"
              >
                {char}
              </span>
            );
          }

          if (status === "current") {
            return (
              <span key={index} className="relative inline-block">
                {/* Smooth Blinking Caret Indicator */}
                <motion.span
                  className="absolute -top-1 bottom-0 -left-[2px] w-[3px] rounded-full bg-[#FF6562] z-10"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />

                {/* Character block */}
                <span
                  className={`px-0.5 rounded-md font-bold transition-all ${
                    isErrorAtCurrent
                      ? "bg-rose-500 text-white animate-shake shadow-xs shadow-rose-500/50"
                      : "bg-[#FF6562]/15 text-gray-900"
                  }`}
                >
                  {char === " " ? "␣" : char}
                </span>
              </span>
            );
          }

          // Untyped remaining character
          return (
            <span
              key={index}
              className="text-gray-400/90 font-medium transition-colors"
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* Shake Animation Keyframe helper */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        .animate-shake {
          animation: shake 0.15s ease-in-out 2;
        }
      `}</style>
    </div>
  );
};

export default TypingArea;
