"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  RotateCcw,
  Settings2,
  Timer as TimerIcon,
  Eraser,
  Pencil,
  Lightbulb,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import SudokuGrid from "@/components/Sudoku/sudoku-grid";
import {
  getSudokuPuzzle,
  SudokuGrid as APIGrid,
} from "@/lib/actions/sudoku-actions";
import { isBoardCorrect, formatTime } from "@/lib/sudoku-utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

const SudokuPage = () => {
  // Game State
  const [board, setBoard] = useState<(number | null)[][]>(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(null))
  );
  const [initialBoard, setInitialBoard] = useState<(number | null)[][]>(
    Array(9)
      .fill(null)
      .map(() => Array(9).fill(null))
  );
  const [solution, setSolution] = useState<number[][]>([]);
  const [difficulty, setDifficulty] = useState("Medium");
  const [notes, setNotes] = useState<Set<number>[][]>(
    Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => new Set())
      )
  );

  // UI State
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [history, setHistory] = useState<(number | null)[][][]>([]);

  const fetchNewGame = useCallback(async () => {
    setLoading(true);
    setStatus("playing");
    setMistakes(0);
    setTimer(0);
    setHistory([]);
    setSelectedCell(null);

    const puzzle = await getSudokuPuzzle();
    if (puzzle) {
      setInitialBoard(
        puzzle.value.map((row) => row.map((cell) => (cell === 0 ? null : cell)))
      );
      setBoard(
        puzzle.value.map((row) => row.map((cell) => (cell === 0 ? null : cell)))
      );
      setSolution(puzzle.solution);
      setDifficulty(puzzle.difficulty);
      setNotes(
        Array(9)
          .fill(null)
          .map(() =>
            Array(9)
              .fill(null)
              .map(() => new Set())
          )
      );
      setIsActive(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNewGame();
  }, [fetchNewGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && status === "playing") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, status]);

  const handleCellValueChange = useCallback(
    (r: number, c: number, value: number | null) => {
      if (status !== "playing" || initialBoard[r][c] !== null) return;

      if (isNoteMode && value !== null) {
        const newNotes = [...notes];
        const cellNotes = new Set(newNotes[r][c]);
        if (cellNotes.has(value)) {
          cellNotes.delete(value);
        } else {
          cellNotes.add(value);
        }
        newNotes[r][c] = cellNotes;
        setNotes(newNotes);
        return;
      }

      setHistory((prev) => [...prev, board.map((row) => [...row])]);

      const newBoard = board.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? value : cell))
      );

      setBoard(newBoard);

      if (value !== null && value !== solution[r][c]) {
        setMistakes((prev) => {
          const next = prev + 1;
          if (next >= 3) setStatus("lost");
          return next;
        });
      }

      if (isBoardCorrect(newBoard, solution)) {
        setStatus("won");
        setIsActive(false);
      }
    },
    [board, initialBoard, isNoteMode, notes, solution, status]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setBoard(previous);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleHint = () => {
    if (!selectedCell || status !== "playing") return;
    const [r, c] = selectedCell;
    if (board[r][c] !== null) return;
    handleCellValueChange(r, c, solution[r][c]);
  };

  const NumberPad = () => (
    <div className="grid grid-cols-3 gap-2 mt-8 max-w-[300px] mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <motion.button
          key={num}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            selectedCell &&
            handleCellValueChange(selectedCell[0], selectedCell[1], num)
          }
          className="size-12 md:size-14 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xl font-bold transition-colors flex items-center justify-center backdrop-blur-sm"
        >
          {num}
        </motion.button>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Header */}
        <header className="w-full flex justify-between items-center mb-8 px-4">
          <Link
            href="/"
            className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400 tracking-tighter">
              SUDOKU
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <Settings2 className="size-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
          {/* Left Column: Stats & Board */}
          <div className="lg:col-span-12 flex flex-col items-center">
            {/* Game Stats */}
            <div className="flex items-center gap-8 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl w-full max-w-[500px] justify-around">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-white/40 mb-1">
                  Difficulty
                </span>
                <span className="text-blue-400 font-bold">{difficulty}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-white/40 mb-1">
                  Mistakes
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "font-bold transition-colors",
                      mistakes > 0 ? "text-red-400" : "text-white"
                    )}
                  >
                    {mistakes}/3
                  </span>
                  {mistakes >= 1 && (
                    <AlertCircle className="size-4 text-red-400 animate-pulse" />
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-white/40 mb-1">
                  Time
                </span>
                <div className="flex items-center gap-2">
                  <TimerIcon className="size-4 text-blue-400" />
                  <span className="font-mono font-bold">
                    {formatTime(timer)}
                  </span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="size-[320px] sm:size-[400px] md:size-[500px] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
                <div className="flex flex-col items-center gap-4">
                  <div className="size-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-white/60 font-medium italic">
                    Generating Puzzle...
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <SudokuGrid
                  board={board}
                  initialBoard={initialBoard}
                  notes={notes}
                  selectedCell={selectedCell}
                  onCellSelect={(r, c) => setSelectedCell([r, c])}
                  onCellValueChange={handleCellValueChange}
                />

                {/* Overlays */}
                <AnimatePresence>
                  {status !== "playing" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 z-50 rounded-2xl bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 border border-white/20"
                    >
                      {status === "won" ? (
                        <>
                          <div className="size-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                            <Trophy className="size-10 text-green-500" />
                          </div>
                          <h2 className="text-4xl font-black mb-2 tracking-tight">
                            VICTORY!
                          </h2>
                          <p className="text-white/60 mb-8 max-w-[200px]">
                            You've completed the challenge in{" "}
                            {formatTime(timer)} with {mistakes} mistakes.
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="size-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="size-10 text-red-500" />
                          </div>
                          <h2 className="text-4xl font-black mb-2 tracking-tight">
                            GAME OVER
                          </h2>
                          <p className="text-white/60 mb-8 max-w-[200px]">
                            Maximum mistakes reached. Better luck next time!
                          </p>
                        </>
                      )}
                      <button
                        onClick={fetchNewGame}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                      >
                        <RotateCcw className="size-5" />
                        New Game
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Controls Bar */}
            <div className="mt-8 grid grid-cols-4 gap-4 w-full max-w-[500px]">
              <ControlButton
                icon={<RotateCcw />}
                label="Undo"
                onClick={handleUndo}
              />
              <ControlButton
                icon={<Eraser />}
                label="Erase"
                onClick={() =>
                  selectedCell &&
                  handleCellValueChange(selectedCell[0], selectedCell[1], null)
                }
              />
              <ControlButton
                icon={<Pencil />}
                label="Notes"
                active={isNoteMode}
                onClick={() => setIsNoteMode(!isNoteMode)}
              />
              <ControlButton
                icon={<Lightbulb />}
                label="Hint"
                onClick={handleHint}
              />
            </div>

            <NumberPad />
          </div>
        </div>
      </div>
    </main>
  );
};

const ControlButton = ({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 group text-white/60 hover:text-white",
      active
        ? "bg-blue-600 border-blue-400/50 shadow-lg text-white"
        : "bg-white/5 border-white/10 hover:bg-white/10"
    )}
  >
    <div
      className={cn(
        "size-6 transition-transform group-hover:scale-110",
        active && "scale-110 text-white"
      )}
    >
      {icon}
    </div>
    <span className="text-[10px] uppercase font-bold tracking-widest">
      {label}
    </span>
  </button>
);

export default SudokuPage;
