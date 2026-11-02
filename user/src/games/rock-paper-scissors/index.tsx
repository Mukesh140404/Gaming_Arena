import React, { useState, useEffect, useMemo, useRef } from "react";
import { useCurrentUser } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useQuery } from "@tanstack/react-query";
import { singleRoomQueryOptions, useUpdateRoomMutation } from "@/hooks/useRoom";
import ResultGameDialog from "@/components/dialogs/result-game.model";

import { RPSHeader } from "./rps-header";
import { Scoreboard } from "./scoreboard";
import { BattleArena } from "./battle-arena";
import { ChoiceCards } from "./choice-cards";
import { RoundHistory } from "./round-history";
import type { Choice, RPSState } from "./types";
import { rpsSound } from "./sound";

interface RockPaperScissorProps {
  roomId?: string;
}

export const RockPaperScissor: React.FC<RockPaperScissorProps> = ({
  roomId: propRoomId,
}) => {
  const {
    roomId: wsRoomId,
    gameState,
    gameResult,
    gameError,
    sendGameAction,
    setIsGameStarted,
    setGameState,
    setGameResult,
  } = useWebSocket();

  const effectiveRoomId = propRoomId || wsRoomId;
  const { data: authUser } = useCurrentUser();
  const updateRoomMutation = useUpdateRoomMutation(effectiveRoomId);

  const { data: room } = useQuery(
    singleRoomQueryOptions(effectiveRoomId || "")
  );

  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastSoundRoundRef = useRef<number>(0);

  // Parse RPS state from WebSocket gameState
  const rpsState = useMemo<RPSState | null>(() => {
    if (!gameState || !gameState.players) return null;
    return gameState as RPSState;
  }, [gameState]);

  const myId = authUser?.id;
  const roomPlayers = room?.roomPlayersList;

  // Identify opponent
  const opponentId = useMemo(() => {
    if (rpsState?.playerIds && myId) {
      return rpsState.playerIds.find((id) => id !== myId);
    }
    const otherPlayer = roomPlayers?.find(
      (p: { userId: string }) => p.userId !== myId
    );
    return otherPlayer?.userId;
  }, [rpsState, myId, roomPlayers]);

  const myName = authUser?.name || "Player 1";
  const opponentName = useMemo(() => {
    if (opponentId && roomPlayers) {
      const opp = roomPlayers.find(
        (p: { userId: string; name?: string }) => p.userId === opponentId
      );
      if (opp?.name) return opp.name;
    }
    return "Opponent";
  }, [opponentId, roomPlayers]);

  const myPlayer = myId && rpsState?.players ? rpsState.players[myId] : undefined;
  const opponentPlayer =
    opponentId && rpsState?.players ? rpsState.players[opponentId] : undefined;

  const currentRound = rpsState?.currentRound ?? 1;
  const targetScore = rpsState?.targetScore ?? 3;
  const phase = rpsState?.phase ?? "choosing";
  const lastRound = rpsState?.lastRound ?? null;
  const history = rpsState?.history ?? [];

  const myChoice = myPlayer?.choice ?? null;
  const oppChoice = opponentPlayer?.choice ?? null;
  const oppHasChosen = Boolean(opponentPlayer?.hasChosen || oppChoice !== null);

  const isGameOver = Boolean(gameResult);

  // Play audio effects on round resolution
  useEffect(() => {
    if (!lastRound) return;
    if (lastSoundRoundRef.current === lastRound.roundNumber) return;

    lastSoundRoundRef.current = lastRound.roundNumber;
    rpsSound.playClash();

    setTimeout(() => {
      if (lastRound.isDraw) {
        rpsSound.playDraw();
      } else if (lastRound.winnerId === myId) {
        rpsSound.playWin();
      } else {
        rpsSound.playLose();
      }
    }, 250);
  }, [lastRound, myId]);

  // Play audio on match game over
  useEffect(() => {
    if (!gameResult) return;
    if (gameResult.winnerId === myId) {
      rpsSound.playWin();
    } else {
      rpsSound.playLose();
    }
  }, [gameResult, myId]);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      rpsSound.enabled = next;
      return next;
    });
  };

  const handleSelectChoice = (choice: Choice) => {
    if (!effectiveRoomId || isGameOver) return;
    sendGameAction(effectiveRoomId, { type: "CHOOSE", choice });
  };

  const handleNextRound = () => {
    if (!effectiveRoomId || isGameOver) return;
    sendGameAction(effectiveRoomId, { type: "NEXT_ROUND" });
  };

  const handleRestart = () => {
    if (!effectiveRoomId) return;
    sendGameAction(effectiveRoomId, { type: "RESTART" });
  };

  const handleBackToRoom = async () => {
    if (effectiveRoomId) {
      try {
        await updateRoomMutation.mutateAsync({
          roomId: effectiveRoomId,
          status: "waiting",
        });
      } catch {
        // Ignored
      }
    }
    setGameResult(null);
    setGameState(null);
    setIsGameStarted(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-5 space-y-4 font-sans select-none">
      {/* Game Error Message Banner */}
      {gameError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold text-center">
          {gameError}
        </div>
      )}

      {/* Header */}
      <RPSHeader
        currentRound={currentRound}
        targetScore={targetScore}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRestart={handleRestart}
      />

      {/* Scoreboard */}
      <Scoreboard
        myId={myId}
        myName={myName}
        myPlayer={myPlayer}
        opponentName={opponentName}
        opponentPlayer={opponentPlayer}
        targetScore={targetScore}
        currentRound={currentRound}
      />

      {/* Battle Clash Arena */}
      <BattleArena
        phase={phase}
        myChoice={myChoice}
        opponentChoice={oppChoice}
        opponentHasChosen={oppHasChosen}
        lastRound={lastRound}
        myId={myId}
        myName={myName}
        opponentName={opponentName}
        onNextRound={handleNextRound}
        isGameOver={isGameOver}
      />

      {/* Interactive Choice Cards (Rock / Paper / Scissors) */}
      <ChoiceCards
        selectedChoice={myChoice}
        onSelect={handleSelectChoice}
        disabled={myChoice !== null || isGameOver}
      />

      {/* Round History Log */}
      <RoundHistory
        history={history}
        myId={myId}
        myName={myName}
        opponentName={opponentName}
      />

      {/* Match Outcome Result Dialog */}
      <ResultGameDialog
        gameResult={gameResult}
        userId={myId}
        onBackToRoom={handleBackToRoom}
      />
    </div>
  );
};

export default RockPaperScissor;