import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useCurrentUser } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { singleRoomQueryOptions } from "@/hooks/useRoom";
import {
  SAMPLE_QUOTES,
  RACER_PALETTES,
  RACER_AVATARS,
  DEFAULT_AI_BOTS,
  CAR_CONFIGS,
  typingSfx,
  type TypingRacer,
  type QuoteData,
} from "./config";
import RaceHeader from "./race-header";
import RaceTrack from "./race-track";
import TypingArea from "./typing-area";
import RaceWinModal from "./race-win-modal";

interface TypingRaceProps {
  roomId?: string;
}

const createInitialBots = (): TypingRacer[] => {
  return DEFAULT_AI_BOTS.slice(0, 3).map((bot, idx) => {
    const carConfig = CAR_CONFIGS[(idx + 1) % CAR_CONFIGS.length];
    return {
      ...bot,
      score: 0,
      wpm: 0,
      accuracy: 96 + Math.round(Math.random() * 3),
      isSelf: false,
      color: bot.color,
      accentHex: bot.accentHex,
      avatar: bot.avatar,
      carImage: bot.carImage || carConfig.image,
      rotateCar: bot.rotateCar ?? carConfig.rotate180,
      rank: idx + 2,
    };
  });
};

export const TypingRace: React.FC<TypingRaceProps> = ({
  roomId: propRoomId,
}) => {
  const { data: authUser } = useCurrentUser();
  const {
    roomId: wsRoomId,
    gameState,
    gameResult,
    gameError,
    sendGameAction,
    startGame,
  } = useWebSocket();

  const effectiveRoomId = propRoomId || wsRoomId;
  const isMultiplayer = Boolean(effectiveRoomId);

  // Fetch room players for accurate names when in a multiplayer room
  const { data: room } = useQuery({
    ...singleRoomQueryOptions(effectiveRoomId || ""),
    enabled: Boolean(effectiveRoomId),
  });

  const [quoteIndex, setQuoteIndex] = useState(0);

  const activeQuote: QuoteData = useMemo(() => {
    if (gameState?.quote) {
      return {
        id: "server-quote",
        category: "gaming",
        title: "Match Arena",
        author: "Server Match",
        text: gameState.quote,
      };
    }
    return SAMPLE_QUOTES[quoteIndex % SAMPLE_QUOTES.length];
  }, [gameState, quoteIndex]);

  // Telemetry & Timing State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [myWpm, setMyWpm] = useState(0);
  const [myAccuracy, setMyAccuracy] = useState(100);
  const [myProgress, setMyProgress] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Bot Racers for solo / demo mode
  const [botRacers, setBotRacers] = useState<TypingRacer[]>(() =>
    isMultiplayer ? [] : createInitialBots()
  );
  const [prevIsMultiplayer, setPrevIsMultiplayer] = useState(isMultiplayer);
  if (prevIsMultiplayer !== isMultiplayer) {
    setPrevIsMultiplayer(isMultiplayer);
    setBotRacers(isMultiplayer ? [] : createInitialBots());
  }

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Game completion state
  const isGameOver = Boolean(gameResult?.winnerId) || myProgress >= 100;

  // Restart match
  const handleRestart = useCallback(() => {
    setStartTime(null);
    setElapsedTime(0);
    setMyWpm(0);
    setMyAccuracy(100);
    setMyProgress(0);
    setMyStreak(0);
    setTotalKeystrokes(0);
    setErrorCount(0);

    if (isMultiplayer && effectiveRoomId) {
      startGame(effectiveRoomId);
    } else {
      setBotRacers(createInitialBots());
    }
  }, [isMultiplayer, effectiveRoomId, startGame]);

  // Elapsed time stopwatch
  useEffect(() => {
    if (startTime && !isGameOver) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isGameOver]);

  // Word-by-word bot simulation in solo/demo mode
  useEffect(() => {
    if (isMultiplayer || !startTime || isGameOver) {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      return;
    }

    const words = activeQuote.text.trim().split(/\s+/);
    const totalWords = words.length;
    if (totalWords === 0) return;

    botIntervalRef.current = setInterval(() => {
      setBotRacers((prevBots) =>
        prevBots.map((bot) => {
          if (bot.score >= 100) return bot;

          const targetWpm = bot.botTargetWpm || 55;
          // Words per second = targetWpm / 60
          const wordsPerSec = targetWpm / 60;
          // Interval is 400ms = 0.4s
          const probPerTick = wordsPerSec * 0.4 * (0.8 + Math.random() * 0.4);

          const currentWordCount = Math.round((bot.score / 100) * totalWords);
          let nextWordCount = currentWordCount;
          if (Math.random() < probPerTick) {
            nextWordCount = Math.min(totalWords, currentWordCount + 1);
          }

          const nextScore = Math.min(100, (nextWordCount / totalWords) * 100);
          const timeElapsedMin = (Date.now() - startTime) / 60000;
          const liveWpm =
            timeElapsedMin > 0.01
              ? (nextWordCount * 5) / timeElapsedMin
              : targetWpm;

          return {
            ...bot,
            score: nextScore,
            wpm: Math.round(liveWpm),
            completed: nextScore >= 100,
            finishTime: nextScore >= 100 ? Date.now() - startTime : undefined,
          };
        })
      );
    }, 400);

    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    };
  }, [isMultiplayer, startTime, isGameOver, activeQuote.text]);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      typingSfx.enabled = next;
      return next;
    });
  };

  const handleFirstKey = () => {
    if (!startTime) {
      setStartTime(Date.now());
    }
  };

  const handleProgress = useCallback(
    (metrics: {
      progress: number;
      wpm: number;
      accuracy: number;
      completed: boolean;
      totalKeystrokes: number;
      errorCount: number;
    }) => {
      setMyProgress(metrics.progress);
      setMyWpm(metrics.wpm);
      setMyAccuracy(metrics.accuracy);
      setTotalKeystrokes(metrics.totalKeystrokes);
      setErrorCount(metrics.errorCount);

      if (isMultiplayer && effectiveRoomId) {
        sendGameAction(effectiveRoomId, {
          type: "progress",
          progress: metrics.progress,
          wpm: metrics.wpm,
          accuracy: metrics.accuracy,
          completed: metrics.completed,
        });
      }
    },
    [isMultiplayer, effectiveRoomId, sendGameAction]
  );

  const handleNextQuote = () => {
    setQuoteIndex((prev) => prev + 1);
    handleRestart();
  };

  // Build racer list
  const racers: TypingRacer[] = useMemo(() => {
    const myId = authUser?.id || "you";
    const myName = authUser?.name ? `${authUser.name} (You)` : "You";

    const userCar = CAR_CONFIGS[0];
    const userRacer: TypingRacer = {
      id: myId,
      name: myName,
      score: myProgress,
      wpm: myWpm,
      accuracy: myAccuracy,
      color: "from-rose-500 to-red-600",
      accentHex: "#FF6562",
      avatar: "🏎️",
      carImage: userCar.image,
      rotateCar: userCar.rotate180,
      isSelf: true,
      completed: myProgress >= 100,
      finishTime: myProgress >= 100 ? elapsedTime : undefined,
    };

    if (isMultiplayer) {
      const playerStates = (gameState?.players || {}) as Record<string, any>;
      const activeRoomPlayers = (room?.roomPlayersList || []).filter(
        (p: any) => p.status === "active"
      );

      if (activeRoomPlayers.length > 0) {
        return activeRoomPlayers.map((player: any, idx: number) => {
          const isSelf = player.userId === myId;
          const pState = playerStates[player.userId] || {};
          const palette = RACER_PALETTES[idx % RACER_PALETTES.length];
          const avatar = RACER_AVATARS[idx % RACER_AVATARS.length];
          const car = CAR_CONFIGS[idx % CAR_CONFIGS.length];

          if (isSelf) return {
            ...userRacer,
            carImage: car.image,
            rotateCar: car.rotate180,
          };

          return {
            id: player.userId,
            name: player.user?.name || player.name || `Racer ${idx + 1}`,
            score: pState.progress ?? 0,
            wpm: pState.wpm ?? 0,
            accuracy: pState.accuracy ?? 100,
            color: palette.color,
            accentHex: palette.accentHex,
            avatar,
            carImage: car.image,
            rotateCar: car.rotate180,
            isSelf: false,
            completed: pState.completed ?? false,
            finishTime: pState.finishTime,
          };
        });
      }

      return [userRacer];
    }

    return [userRacer, ...botRacers];
  }, [
    authUser,
    myProgress,
    myWpm,
    myAccuracy,
    elapsedTime,
    isMultiplayer,
    gameState,
    room,
    botRacers,
  ]);

  const userRacer = useMemo(
    () => racers.find((r) => r.isSelf) || racers[0],
    [racers]
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-2 space-y-4 font-sans select-none">
      {/* Server Error Alert if any */}
      {gameError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold text-center">
          {gameError}
        </div>
      )}

      {/* 1. Header: Time, Speed, Accuracy */}
      <RaceHeader
        elapsedTime={elapsedTime}
        wpm={myWpm}
        accuracy={myAccuracy}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRestart={handleRestart}
        isMultiplayer={isMultiplayer}
      />

      {/* 2. Speedway Track */}
      <RaceTrack racers={racers} userStreak={myStreak} />

      {/* 3. Victory Modal or Interactive Typing Box */}
      {isGameOver ? (
        <RaceWinModal
          userRacer={userRacer}
          racers={racers}
          elapsedTime={elapsedTime}
          totalKeystrokes={totalKeystrokes}
          errorCount={errorCount}
          onRestart={handleRestart}
          onNextQuote={!isMultiplayer ? handleNextQuote : undefined}
        />
      ) : (
        <TypingArea
          targetText={activeQuote.text}
          disabled={isGameOver}
          onProgress={handleProgress}
          onStreakChange={setMyStreak}
          startTime={startTime}
          onFirstKey={handleFirstKey}
        />
      )}
    </div>
  );
};

export default TypingRace;