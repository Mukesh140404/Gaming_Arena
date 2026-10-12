import React, { useState, useEffect, useMemo, useCallback } from "react";
import winLines from "./config";
import BingoHeader from "./bingo-header";
import BingoLetters from "./bingo-letters";
import BingoBoard from "./bingo-board";
import BingoControls from "./bingo-controls";
import BingoWinModal from "./bingo-win-modal";

const Bingo: React.FC = () => {
  const [phase, setPhase] = useState<"setup" | "playing" | "won">("setup");
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(true);
  const [isWin, setIsWin] = useState<boolean>(false);

  const [board, setBoard] = useState<(number | null)[]>(Array(25).fill(null));

  const [markedNumbers, setMarkedNumbers] = useState<Set<number>>(new Set());

  const availableNumbers = useMemo(() => {
    const placed = new Set(board.filter((n): n is number => n !== null));
    const unplaced: number[] = [];
    for (let i = 1; i <= 25; i++) {
      if (!placed.has(i)) unplaced.push(i);
    }
    return unplaced;
  }, [board]);

  const placedCount = 25 - availableNumbers.length;

  // Transition from setup to playing phase (auto-fills any empty cells)
  const startGame = useCallback(() => {
    setBoard((prev) => {
      const placed = new Set(prev.filter((n): n is number => n !== null));
      const missing: number[] = [];
      for (let i = 1; i <= 25; i++) {
        if (!placed.has(i)) missing.push(i);
      }
      // Shuffle missing numbers
      for (let i = missing.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [missing[i], missing[j]] = [missing[j], missing[i]];
      }

      let missingIndex = 0;
      return prev.map((val) => {
        if (val !== null) return val;
        return missing[missingIndex++] ?? 1;
      });
    });

    setMarkedNumbers(new Set());
    setIsMyTurn(true);
    setIsWin(false);
    setPhase("playing");
  }, []);

  // 30-second Countdown Timer during Setup Phase
  useEffect(() => {
    if (phase !== "setup") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, startGame]);

  // Click on cell
  const handleCellClick = (index: number) => {
    // Phase 1: Setup - assign next available number
    if (phase === "setup") {
      if (board[index] === null && availableNumbers.length > 0) {
        const nextNum = availableNumbers[0];
        const newBoard = [...board];
        newBoard[index] = nextNum;
        setBoard(newBoard);
      }
      return;
    }

    // Phase 2: Playing - mark cell with rose-300
    if (phase === "playing") {
      const num = board[index];
      if (num === null || markedNumbers.has(num)) return;

      const newMarked = new Set(markedNumbers);
      newMarked.add(num);
      setMarkedNumbers(newMarked);

      // Check if this move completes 5 straight lines
      let completedLines = 0;
      winLines.forEach((line) => {
        const isLineComplete = line.every((cellIndex) => {
          const val = board[cellIndex];
          return val !== null && newMarked.has(val);
        });
        if (isLineComplete) completedLines++;
      });

      if (completedLines >= 5) {
        setIsWin(true);
        setPhase("won");
      } else {
        // Alternate turn after clicking
        setIsMyTurn((prev) => !prev);
      }
    }
  };

  // Double-click on cell: remove number in setup phase
  const handleCellDoubleClick = (index: number) => {
    if (phase === "setup" && board[index] !== null) {
      const newBoard = [...board];
      newBoard[index] = null;
      setBoard(newBoard);
    }
  };

  // Auto-fill entire board randomly
  const handleAutoFill = () => {
    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    setBoard(numbers);
  };

  // Clear all cells
  const handleClear = () => {
    setBoard(Array(25).fill(null));
  };

  // Restart match back to Setup
  const handleRestart = () => {
    setTimeLeft(30);
    setBoard(Array(25).fill(null));
    setMarkedNumbers(new Set());
    setIsMyTurn(true);
    setIsWin(false);
    setPhase("setup");
  };

  // Calculate completed lines based on winLines config
  const { completedLinesCount, winningCells } = useMemo(() => {
    let count = 0;
    const activeWinningCells = new Set<number>();

    winLines.forEach((line) => {
      const isCompleted = line.every((cellIndex) => {
        const val = board[cellIndex];
        return val !== null && markedNumbers.has(val);
      });

      if (isCompleted) {
        count++;
        line.forEach((cellIndex) => activeWinningCells.add(cellIndex));
      }
    });

    return {
      completedLinesCount: Math.min(count, 5),
      winningCells: activeWinningCells,
    };
  }, [board, markedNumbers]);

  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-6 w-full max-w-2xl mx-auto space-y-4">
      {/* 1. Top Header: Players side-by-side, Turns, 30s Countdown */}
      <BingoHeader
        phase={phase}
        timeLeft={timeLeft}
        isMyTurn={isMyTurn}
        playerName="You"
        opponentName="Opponent"
      />

      {/* 2. B - I - N - G - O Letters Progress Tracker */}
      <BingoLetters completedLinesCount={completedLinesCount} />

      {/* 3. Victory Modal when 5 lines are formed */}
      {isWin ? (
        <BingoWinModal onRestart={handleRestart} />
      ) : (
        /* 4. Single 5x5 Board */
        <BingoBoard
          phase={phase}
          board={board}
          markedNumbers={markedNumbers}
          winningCells={winningCells}
          onCellClick={handleCellClick}
          onCellDoubleClick={handleCellDoubleClick}
        />
      )}

      {/* 5. Controls (Auto-fill, Clear, Start / Restart) */}
      <BingoControls
        phase={phase}
        placedCount={placedCount}
        onAutoFill={handleAutoFill}
        onClear={handleClear}
        onStartGame={startGame}
        onRestart={handleRestart}
      />
    </div>
  );
};

export default Bingo;