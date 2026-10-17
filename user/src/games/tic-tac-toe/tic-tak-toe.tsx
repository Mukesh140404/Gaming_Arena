import { useMemo } from "react";
import { GameHeader } from "./game-header";
import { GameBoard } from "./game-board";
import { useCurrentUser } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { BoardCell } from "./types";

interface TicTacToeProps {
  roomId?: string;
}

export const TicTacToe: React.FC<TicTacToeProps> = ({ roomId: propRoomId }) => {
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

  const cells = useMemo<BoardCell[]>(() => {
    const board: (string | null)[] = gameState?.board ?? Array(9).fill(null);
    const players: string[] = gameState?.players ?? [];

    return board.map((cell, index): BoardCell => ({
      index,
      value: cell === null ? null : cell === players[0] ? "X" : "O",
    }));
  }, [gameState]);

  const isMyTurn = gameState?.turn === authUser?.id;
  const isGameOver = gameResult !== null;

  const handleCellClick = (cellIndex: number) => {
    if (!isMyTurn || isGameOver) return;
    sendGameAction(effectiveRoomId, { type: "MOVE", index: cellIndex });
  };

  const handleBackToRoom = () => {
    setGameResult(null);
    setGameState(null);
    setIsGameStarted(false); // room page shows the lobby again
  };

  const statusText = () => {
    if (gameResult?.draw) return "It's a draw!";
    if (gameResult) {
      return gameResult.winnerId === authUser?.id ? "You won!" : "You lost!";
    }
    return isMyTurn ? "Your turn" : "Opponent's turn";
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-5 space-y-4 font-sans select-none">
      {gameError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold text-center">
          {gameError}
        </div>
      )}

      <GameHeader
        elapsedTime={0}
        cps={0}
        targetClicks={0}
        soundEnabled={true}
        onToggleSound={() => {}}
        onRestart={() => {}}
        isMultiplayer={true}
      />

      <p className="text-center text-lg font-bold">{statusText()}</p>

      <GameBoard
        cells={cells}
        isEnabled={isMyTurn && !isGameOver}
        onCellClick={handleCellClick}
      />

      {gameResult && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-2xl font-black">
            {gameResult.draw
              ? "It's a draw!"
              : gameResult.winnerId === authUser?.id
                ? "You won!"
                : "You lost!"}
          </p>
          <button
            onClick={handleBackToRoom}
            className="rounded-xl bg-[#FF6562] px-5 py-2 text-sm font-bold text-white"
          >
            Back to Room
          </button>
        </div>
      )}
    </div>
  );
};
