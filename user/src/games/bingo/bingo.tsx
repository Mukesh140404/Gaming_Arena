import React, { useEffect, useMemo, useState } from "react";
import winLines from "./config";
import BingoHeader from "./bingo-header";
import BingoLetters from "./bingo-letters";
import BingoBoard from "./bingo-board";
import BingoControls from "./bingo-controls";
import BingoWinModal from "./bingo-win-modal";
import { useCurrentUser } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useUpdateRoomMutation } from "@/hooks/useRoom";
import BingoFinalBoards from "./bingo-final-boards";

interface BingoProps {
  roomId?: string;
}

// Fill the empty cells of a draft board with the missing numbers (shuffled)
const fillBoard = (draft: (number | null)[]): number[] => {
  const placed = new Set(draft.filter((n): n is number => n !== null));
  const missing: number[] = [];
  for (let i = 1; i <= 25; i++) {
    if (!placed.has(i)) missing.push(i);
  }
  for (let i = missing.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [missing[i], missing[j]] = [missing[j], missing[i]];
  }
  let k = 0;
  return draft.map((n) => (n !== null ? n : missing[k++]));
};

const Bingo: React.FC<BingoProps> = ({ roomId: propRoomId }) => {
  const {
    roomId: wsRoomId,
    gameState,
    gameResult,
    gameError,
    sendGameAction,
    setGameState,
    setGameResult,
    setIsGameStarted,
    finalState,
    setFinalState,
  } = useWebSocket();
  const { data: authUser } = useCurrentUser();

  const roomId = propRoomId || wsRoomId;
  const updateRoomMutation = useUpdateRoomMutation(roomId);
  // Local draft board, only used while arranging numbers in the setup phase
  const [draft, setDraft] = useState<(number | null)[]>(Array(25).fill(null));
  const [timeLeft, setTimeLeft] = useState(30);

  // Everything below comes from the server
  const myBoard: number[] | null = gameState?.myBoard ?? null;
  const calledNumbers: number[] = gameState?.calledNumbers ?? [];
  const serverPhase: "setup" | "playing" = gameState?.phase ?? "setup";
  const isMyTurn = gameState?.turn === authUser?.id;
  const submitted = myBoard !== null;

  const phase: "setup" | "playing" | "won" = gameResult
    ? "won"
    : serverPhase === "playing"
      ? "playing"
      : "setup";

  const availableNumbers = useMemo(() => {
    const placed = new Set(draft.filter((n): n is number => n !== null));
    const unplaced: number[] = [];
    for (let i = 1; i <= 25; i++) if (!placed.has(i)) unplaced.push(i);
    return unplaced;
  }, [draft]);
  const placedCount = 25 - availableNumbers.length;

  const submitBoard = () => {
    if (submitted) return;
    sendGameAction(roomId, { type: "SUBMIT_BOARD", board: fillBoard(draft) });
  };

  // 30 second countdown while arranging the board
  useEffect(() => {
    if (phase !== "setup" || submitted) return;
    const timer = setInterval(
      () => setTimeLeft((t) => Math.max(0, t - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [phase, submitted]);

  // Time is over: auto-fill the rest and submit
  useEffect(() => {
    if (timeLeft === 0 && phase === "setup" && !submitted) submitBoard();
  }, [timeLeft, phase, submitted]);

  // Setup phase: click assigns the next number, double click removes it
  const handleCellClick = (index: number) => {
    if (phase === "setup" && !submitted) {
      if (draft[index] === null && availableNumbers.length > 0) {
        const next = [...draft];
        next[index] = availableNumbers[0];
        setDraft(next);
      }
      return;
    }
    // Playing phase: the number in this cell is the number I call
    if (phase === "playing" && isMyTurn && myBoard) {
      sendGameAction(roomId, { type: "CALL_NUMBER", number: myBoard[index] });
    }
  };

  const handleCellDoubleClick = (index: number) => {
    if (phase === "setup" && !submitted && draft[index] !== null) {
      const next = [...draft];
      next[index] = null;
      setDraft(next);
    }
  };

  const handleGameStatusChange = async () => {
    try {
      await updateRoomMutation.mutateAsync({
        roomId: roomId,
        status: "waiting",
      });
    } catch {}
  };

  const handleBackToRoom = () => {
    handleGameStatusChange();
    setGameResult(null);
    setGameState(null);
    setFinalState(null);
    setIsGameStarted(false);
  };

  const markedNumbers = useMemo(() => new Set(calledNumbers), [calledNumbers]);
  const boardToShow: (number | null)[] = myBoard ?? draft;

  const { completedLinesCount, winningCells } = useMemo(() => {
    let count = 0;
    const cells = new Set<number>();
    if (myBoard) {
      winLines.forEach((line) => {
        if (line.every((i) => markedNumbers.has(myBoard[i]))) {
          count++;
          line.forEach((i) => cells.add(i));
        }
      });
    }
    return { completedLinesCount: Math.min(count, 5), winningCells: cells };
  }, [myBoard, markedNumbers]);

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-2xl mx-auto space-y-4">
      {gameError && (
        <div className="w-full p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold text-center">
          {gameError}
        </div>
      )}

      <BingoHeader
        phase={phase}
        timeLeft={timeLeft}
        isMyTurn={isMyTurn}
        playerName="You"
        opponentName="Opponent"
      />

      <BingoLetters completedLinesCount={completedLinesCount} />

      {gameResult ? (
        <>
          <BingoWinModal
            isWinner={gameResult.winnerId === authUser?.id}
            isDraw={!!gameResult.draw}
            onBackToRoom={handleBackToRoom}
          />
          {finalState?.boards && (
            <BingoFinalBoards
              players={finalState.players}
              boards={finalState.boards}
              calledNumbers={finalState.calledNumbers}
              currentUserId={authUser?.id}
              winnerId={gameResult.winnerId}
            />
          )}
        </>
      ) : (
        // <BingoWinModal
        //   isWinner={gameResult.winnerId === authUser?.id}
        //   isDraw={!!gameResult.draw}
        //   onBackToRoom={handleBackToRoom}
        // />
        <BingoBoard
          phase={phase === "setup" && !submitted ? "setup" : "playing"}
          board={boardToShow}
          markedNumbers={markedNumbers}
          winningCells={winningCells}
          isEnabled={phase === "playing" && isMyTurn}
          onCellClick={handleCellClick}
          onCellDoubleClick={handleCellDoubleClick}
        />
      )}

      {phase === "setup" && !submitted && (
        <BingoControls
          phase="setup"
          placedCount={placedCount}
          onAutoFill={() => setDraft(fillBoard(Array(25).fill(null)))}
          onClear={() => setDraft(Array(25).fill(null))}
          onStartGame={submitBoard}
          onRestart={() => {}}
        />
      )}

      {phase === "setup" && submitted && (
        <p className="text-sm font-bold text-gray-600">
          Board submitted. Waiting for the opponent...
        </p>
      )}
    </div>
  );
};

export default Bingo;
