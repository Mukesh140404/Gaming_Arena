import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { DEFAULT_TARGET_CLICKS, RACER_ICONS, sfx, type Racer } from "./config";
import RaceHeader from "./race-header";
import RaceTrack from "./race-track";
import ClickArea from "./click-area";
import RaceWinModal from "./race-win-modal";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useCurrentUser } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { singleRoomQueryOptions } from "@/hooks/useRoom";

interface ClickRaceProps {
  roomId?: string;
}

export const ClickRace: React.FC<ClickRaceProps> = ({ roomId: propRoomId }) => {
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

  // Fetch room players for accurate names
  const { data: room } = useQuery(singleRoomQueryOptions(effectiveRoomId));

  // Time and Speed tracking
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentCps, setCurrentCps] = useState(0);
  const [peakCps, setPeakCps] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const clickTimestampsRef = useRef<number[]>([]);
  const lastClickTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const targetClicks = DEFAULT_TARGET_CLICKS;

  // -----------------------------------------------------------
  // GAME OVER / WINNER STATUS (From Server WebSocket)
  // -----------------------------------------------------------
  const isGameOver = Boolean(gameResult?.winnerId);

  const winnerInfo = useMemo(() => {
    if (!gameResult?.winnerId) return null;
    const isMe = gameResult.winnerId === authUser?.id;

    // Find winner's display name from room players
    const winnerPlayer = room?.roomPlayersList?.find(
      (p: any) => p.userId === gameResult.winnerId
    );
    const winnerName = isMe
      ? "You"
      : winnerPlayer?.user?.name || winnerPlayer?.name || "Opponent";

    return { name: winnerName, isSelf: isMe };
  }, [gameResult, authUser, room]);

  useEffect(() => {
    if (winnerInfo?.isSelf) {
      sfx.playWin();
    }
  }, [winnerInfo]);

  // -----------------------------------------------------------
  // ELAPSED TIME STOPWATCH & CPS TRACKING
  // -----------------------------------------------------------
  useEffect(() => {
    if (startTime && !isGameOver) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedTime(now - startTime);

        // Calculate CPS in rolling 1.5s window
        const recent = clickTimestampsRef.current.filter((t) => now - t <= 1500);
        const calculated = recent.length > 0 ? recent.length / 1.5 : 0;
        setCurrentCps(calculated);
        setPeakCps((prev) => Math.max(prev, calculated));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isGameOver]);

  // -----------------------------------------------------------
  // TAP / CLICK ACTION (Sends directly to Server via WebSocket)
  // -----------------------------------------------------------
  const handleTap = useCallback(() => {
    if (isGameOver) return;

    const now = Date.now();
    if (!startTime) {
      setStartTime(now);
    }

    clickTimestampsRef.current.push(now);
    clickTimestampsRef.current = clickTimestampsRef.current.filter((t) => now - t <= 2000);

    // Combo calculation
    if (now - lastClickTimeRef.current < 400) {
      setComboCount((prev) => {
        const next = prev + 1;
        if (next % 5 === 0) sfx.playNitro();
        return next;
      });
    } else {
      setComboCount(1);
    }
    lastClickTimeRef.current = now;

    sfx.playClick(comboCount);

    // Live Server WebSocket Action
    if (effectiveRoomId) {
      sendGameAction(effectiveRoomId, { type: "click" });
    }
  }, [isGameOver, startTime, comboCount, effectiveRoomId, sendGameAction]);

  // -----------------------------------------------------------
  // RESTART MATCH (Calls Server START_GAME)
  // -----------------------------------------------------------
  const handleRestart = useCallback(() => {
    setStartTime(null);
    setElapsedTime(0);
    setCurrentCps(0);
    setPeakCps(0);
    setComboCount(0);
    clickTimestampsRef.current = [];
    lastClickTimeRef.current = 0;

    if (effectiveRoomId) {
      startGame(effectiveRoomId);
    }
  }, [effectiveRoomId, startGame]);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sfx.enabled = next;
      return next;
    });
  };

  // -----------------------------------------------------------
  // REAL RACERS DATA FROM SERVER WEBSOCKET STATE
  // -----------------------------------------------------------
  const racers: Racer[] = useMemo(() => {
    const scores = (gameState?.scores || {}) as Record<string, number>;
    const activeRoomPlayers = (room?.roomPlayersList || []).filter(
      (p: any) => p.status === "active"
    );

    // If we have active room players, build racers list from room players
    if (activeRoomPlayers.length > 0) {
      return activeRoomPlayers.map((player: any, idx: number) => {
        const isSelf = player.userId === authUser?.id;
        const score = scores[player.userId] ?? 0;
        const name = isSelf
          ? `${player.user?.name || authUser?.name || "You"} (You)`
          : player.user?.name || player.name || `Player ${idx + 1}`;

        return {
          id: player.userId,
          name,
          score,
          color: isSelf ? "bg-rose-500" : "bg-cyan-500",
          avatar: RACER_ICONS[idx % RACER_ICONS.length],
          isSelf,
        };
      });
    }

    // Fallback: build from gameState.scores keys if room list is not yet loaded
    const scoreEntries = Object.entries(scores);
    if (scoreEntries.length > 0) {
      return scoreEntries.map(([userId, score], idx) => {
        const isSelf = userId === authUser?.id;
        return {
          id: userId,
          name: isSelf ? "You" : `Player ${idx + 1}`,
          score,
          color: isSelf ? "bg-rose-500" : "bg-cyan-500",
          avatar: RACER_ICONS[idx % RACER_ICONS.length],
          isSelf,
        };
      });
    }

    // Default placeholder while connecting
    return [
      {
        id: authUser?.id || "you",
        name: authUser?.name ? `${authUser.name} (You)` : "You",
        score: 0,
        color: "bg-rose-500",
        avatar: "🏎️",
        isSelf: true,
      },
    ];
  }, [gameState, room, authUser]);

  // Current user's live score from server
  const myCurrentScore = useMemo(() => {
    if (!authUser?.id || !gameState?.scores) return 0;
    return gameState.scores[authUser.id] ?? 0;
  }, [gameState, authUser]);

  // Leader on the track
  const leaderId = useMemo(() => {
    let topScore = -1;
    let topId: string | null = null;
    racers.forEach((r) => {
      if (r.score > topScore) {
        topScore = r.score;
        topId = r.id;
      }
    });
    return topId;
  }, [racers]);

  return (
    <div className="w-full max-w-xl mx-auto p-3 sm:p-5 space-y-4 font-sans select-none">
      {/* Server Error Notice if any */}
      {gameError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold text-center">
          {gameError}
        </div>
      )}

      {/* 1. Header: Timer, CPS, Status */}
      <RaceHeader
        elapsedTime={elapsedTime}
        cps={currentCps}
        targetClicks={targetClicks}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRestart={handleRestart}
        isMultiplayer={true}
      />

      {/* 2. Real Live Speedway Track */}
      <RaceTrack
        racers={racers}
        targetClicks={targetClicks}
        leaderId={leaderId}
      />

      {/* 3. Victory Modal or Real Interactive Tap Area */}
      {isGameOver && winnerInfo ? (
        <RaceWinModal
          winnerName={winnerInfo.name}
          isSelfWinner={winnerInfo.isSelf}
          totalTime={elapsedTime}
          peakCps={peakCps}
          totalClicks={myCurrentScore}
          onRestart={handleRestart}
        />
      ) : (
        <ClickArea
          onTap={handleTap}
          disabled={isGameOver}
          comboCount={comboCount}
          playerScore={myCurrentScore}
          targetClicks={targetClicks}
        />
      )}
    </div>
  );
};

export default ClickRace;