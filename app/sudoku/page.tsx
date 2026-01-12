"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  RotateCcw,
  Settings2,
  Timer as TimerIcon,
  Eraser,
  Pencil,
  Lightbulb,
  AlertCircle,
  ChevronLeft,
  Pause,
} from "lucide-react";
import Link from "next/link";
import SudokuGrid from "@/components/Sudoku/sudoku-grid";
import PauseModal from "@/components/Sudoku/pause-modal";
import SettingsModal, {
  GameSettings,
  defaultSettings,
} from "@/components/Sudoku/settings-modal";
import {
  getSudokuPuzzle,
  SudokuGrid as SudokuPuzzle,
} from "@/lib/actions/sudoku-actions";
import { isBoardCorrect, formatTime } from "@/lib/sudoku-utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Toaster } from "sonner";

const STORAGE_KEY = "sudoku_game_state";
const SETTINGS_KEY = "sudoku_settings";
const SAVED_PUZZLES_KEY = "savedSudokuRounds";

// Helper functions for cache management
const getSavedPuzzles = (): SudokuPuzzle[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(SAVED_PUZZLES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const savePuzzles = (puzzles: SudokuPuzzle[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVED_PUZZLES_KEY, JSON.stringify(puzzles));
  } catch (error) {
    console.error("Failed to save puzzles to localStorage:", error);
  }
};

const replenishCache = async (targetCount: number) => {
  const currentCache = getSavedPuzzles();
  const needed = targetCount - currentCache.length;

  if (needed <= 0) return;

  try {
    const result = await getSudokuPuzzle(needed);
    if (result) {
      const newPuzzles = Array.isArray(result) ? result : [result];
      savePuzzles([...currentCache, ...newPuzzles]);
    }
  } catch (error) {
    console.error("Failed to replenish cache:", error);
  }
};

interface GameState {
  board: (number | null)[][];
  initialBoard: (number | null)[][];
  solution: number[][];
  difficulty: string;
  notes: number[][][]; // Serialized Set<number>
  timer: number;
  mistakes: number;
  status: "playing" | "won" | "lost";
  hintsUsed: number;
}

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
  const [hasStarted, setHasStarted] = useState(false); // Timer starts on first input
  const [isPaused, setIsPaused] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [history, setHistory] = useState<(number | null)[][][]>([]);
  const [hintsLimit, setHintsLimit] = useState(3);

  // Modal State
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {}
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Adjust cache size when localSaveCount setting changes
  useEffect(() => {
    const currentCache = getSavedPuzzles();
    const targetCount = settings.localSaveCount;

    if (currentCache.length > targetCount) {
      // Trim excess puzzles
      savePuzzles(currentCache.slice(0, targetCount));
    } else if (currentCache.length < targetCount) {
      // Replenish to target count
      replenishCache(targetCount);
    }
  }, [settings.localSaveCount]);

  // Load game state from localStorage
  useEffect(() => {
    const savedGame = localStorage.getItem(STORAGE_KEY);
    if (savedGame) {
      try {
        const state: GameState = JSON.parse(savedGame);
        if (state.status === "playing") {
          setBoard(state.board);
          setInitialBoard(state.initialBoard);
          setSolution(state.solution);
          setDifficulty(state.difficulty);
          setNotes(state.notes.map((row) => row.map((cell) => new Set(cell))));
          setTimer(state.timer);
          setMistakes(state.mistakes);
          setStatus(state.status);
          setHasStarted(state.timer > 0);
          setHintsLimit(state.hintsUsed);
          setLoading(false);
          return;
        }
      } catch {}
    }
    fetchNewGame();
  }, []);

  // Save game state to localStorage
  useEffect(() => {
    if (loading || status !== "playing") return;
    const state: GameState = {
      board,
      initialBoard,
      solution,
      difficulty,
      notes: notes.map((row) => row.map((cell) => Array.from(cell))),
      timer,
      mistakes,
      status,
      hintsUsed: hintsLimit,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [
    board,
    initialBoard,
    solution,
    difficulty,
    notes,
    timer,
    mistakes,
    status,
    hintsLimit,
    loading,
  ]);

  const fetchNewGame = useCallback(async () => {
    setLoading(true);
    setStatus("playing");
    setMistakes(0);
    setTimer(0);
    setHasStarted(false);
    setHistory([]);
    setSelectedCell(null);
    localStorage.removeItem(STORAGE_KEY);

    // Try to use cached puzzle first
    const cachedPuzzles = getSavedPuzzles();
    let puzzle: SudokuPuzzle | null = null;

    if (cachedPuzzles.length > 0) {
      // Use first cached puzzle
      puzzle = cachedPuzzles[0];
      // Remove it from cache
      const remainingPuzzles = cachedPuzzles.slice(1);
      savePuzzles(remainingPuzzles);
      // Show toast notification
      toast.info("Playing saved round", {
        description: `${remainingPuzzles.length} puzzles remaining in cache`,
      });
      // Replenish cache in background
      replenishCache(settings.localSaveCount);
    } else {
      toast.info("Fetching new puzzle", {
        description: "Please wait while we fetch a new puzzle",
      });
      // No cached puzzles, fetch from API
      const result = await getSudokuPuzzle();
      puzzle = Array.isArray(result) ? result[0] : result;
      // Start building cache in background
      replenishCache(settings.localSaveCount);
    }

    if (puzzle) {
      setInitialBoard(
        puzzle.value.map((row: number[]) =>
          row.map((cell: number) => (cell === 0 ? null : cell))
        )
      );
      setBoard(
        puzzle.value.map((row: number[]) =>
          row.map((cell: number) => (cell === 0 ? null : cell))
        )
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
    }
    setLoading(false);
  }, [settings.localSaveCount]);

  // Timer logic - only runs when started and not paused
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (hasStarted && !isPaused && status === "playing") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isPaused, status]);

  // Pause when modal opens
  useEffect(() => {
    if (showPauseModal) {
      setIsPaused(true);
    }
  }, [showPauseModal]);

  const handleCellValueChange = useCallback(
    (r: number, c: number, value: number | null) => {
      if (status !== "playing" || initialBoard[r][c] !== null) return;

      // Start timer on first input
      if (!hasStarted && value !== null) {
        setHasStarted(true);
      }

      if (isNoteMode && value !== null) {
        const newNotes = notes.map((row) => row.map((cell) => new Set(cell)));
        const cellNotes = newNotes[r][c];
        if (cellNotes.has(value)) {
          cellNotes.delete(value);
        } else {
          cellNotes.add(value);
        }
        setNotes(newNotes);
        return;
      }

      setHistory((prev) => [...prev, board.map((row) => [...row])]);

      const newBoard = board.map((row, ri) =>
        row.map((cell, ci) => (ri === r && ci === c ? value : cell))
      );

      setBoard(newBoard);

      // Auto-remove notes when filling a cell
      if (value !== null && settings.autoRemoveNotes) {
        const newNotes = notes.map((row) => row.map((cell) => new Set(cell)));
        newNotes[r][c].clear();
        // Remove this value from notes in same row, column, and box
        for (let i = 0; i < 9; i++) {
          newNotes[r][i].delete(value);
          newNotes[i][c].delete(value);
        }
        const boxR = Math.floor(r / 3) * 3;
        const boxC = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            newNotes[boxR + i][boxC + j].delete(value);
          }
        }
        setNotes(newNotes);
      }

      if (value !== null && value !== solution[r][c]) {
        setMistakes((prev) => {
          const next = prev + 1;
          if (next >= 3) setStatus("lost");
          return next;
        });
      }

      if (isBoardCorrect(newBoard, solution)) {
        setStatus("won");
        localStorage.removeItem(STORAGE_KEY);
      }
    },
    [
      board,
      initialBoard,
      isNoteMode,
      notes,
      solution,
      status,
      hasStarted,
      settings.autoRemoveNotes,
    ]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setBoard(previous);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleHint = () => {
    if (hintsLimit === 0) {
      toast.warning("No Hints Left", {
        description: "You have used all your hints.",
      });
      return;
    }
    if (!selectedCell || status !== "playing") return;
    const [r, c] = selectedCell;
    if (board[r][c] !== null) return;
    if (!hasStarted) setHasStarted(true);
    setHintsLimit((prev) => prev - 1);
    handleCellValueChange(r, c, solution[r][c]);
    toast.info("Hint Used", {
      description: `You have ${hintsLimit} hints left.`,
    });
  };

  const handlePauseResume = () => {
    setShowPauseModal(false);
    setIsPaused(false);
  };

  const handleQuit = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "/";
  };

  const NumberPad = () => (
    <div className="grid grid-cols-9 md:grid-cols-3 gap-2 md:gap-4 mx-auto w-full">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <motion.button
          key={num}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            selectedCell &&
            handleCellValueChange(selectedCell[0], selectedCell[1], num)
          }
          className="w-full aspect-square rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-2xl md:text-3xl font-bold transition-colors flex items-center justify-center backdrop-blur-sm"
        >
          {num}
        </motion.button>
      ))}
    </div>
  );

  const GameStats = ({ device }: { device: "mobile" | "desktop" }) => {
    const deviceType =
      device === "mobile" ? "flex md:hidden" : "hidden lg:flex";
    return (
      <div
        className={`${deviceType} items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl w-full`}
      >
        <div className="flex flex-col items-center">
          <span className="text-[9px] lg:text-xs uppercase font-bold text-white/40 mb-1">
            Difficulty
          </span>
          <span className="text-blue-400 font-bold text-xs lg:text-base">
            {difficulty}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] lg:text-xs uppercase font-bold text-white/40 mb-1">
            Mistakes
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-bold transition-colors text-xs lg:text-base",
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
        {settings.showTimer && (
          <div className="flex flex-col items-center">
            <span className="text-[9px] lg:text-xs uppercase font-bold text-white/40 mb-1">
              Time
            </span>
            <div className="flex items-center gap-2">
              <TimerIcon className="size-4 text-blue-400" />
              <span className="font-mono text-xs lg:text-base font-bold">
                {formatTime(timer)}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowPauseModal(true)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          title="Pause"
        >
          <Pause className="size-5" />
        </button>
      </div>
    );
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <main className="min-h-screen w-full bg-[#0a0a0a] text-white p-4 selection:bg-blue-500/30">
        {/* Background Decor */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <header className="w-full flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium group-hover:flex hidden">
                Dashboard
              </span>
            </Link>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
              SUDOKU
            </h1>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Settings2 className="size-5" />
            </button>
          </header>

          <GameStats device="mobile" />

          <div className="md:mt-8 w-full h-[calc(100vh-10rem)] flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center">
            {/* Grid Column */}
            <div className="flex flex-col items-center w-full md:w-[60%]">
              {loading ? (
                <div className="w-full aspect-square max-w-[320px] sm:max-w-[400px] md:max-w-[500px] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 mx-auto">
                  <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-white/60 font-medium italic">
                      Generating Puzzle...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative group w-full">
                  <SudokuGrid
                    board={board}
                    initialBoard={initialBoard}
                    notes={notes}
                    selectedCell={selectedCell}
                    onCellSelect={(r, c) => setSelectedCell([r, c])}
                    onCellValueChange={handleCellValueChange}
                    settings={settings}
                  />

                  {/* Victory / Game Over Overlay */}
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
                              Completed in {formatTime(timer)} with {mistakes}{" "}
                              mistakes.
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
            </div>

            {/* Controls Column */}
            <div className="w-full md:w-[40%] flex flex-col gap-4 md:gap-6">
              {/* Game Stats */}
              <GameStats device="desktop" />

              {/* Controls */}
              <div className="flex items-center justify-around w-full gap-2">
                <ControlButton
                  icon={<RotateCcw className="size-4 md:size-6" />}
                  label="Undo"
                  onClick={handleUndo}
                />
                <ControlButton
                  icon={<Eraser className="size-4 md:size-6" />}
                  label="Erase"
                  onClick={() =>
                    selectedCell &&
                    handleCellValueChange(
                      selectedCell[0],
                      selectedCell[1],
                      null
                    )
                  }
                />
                <ControlButton
                  icon={<Pencil className="size-4 md:size-6" />}
                  label="Notes"
                  active={isNoteMode}
                  onClick={() => setIsNoteMode(!isNoteMode)}
                />
                <ControlButton
                  icon={<Lightbulb className="size-4 md:size-6" />}
                  label="Hint"
                  onClick={handleHint}
                />
              </div>

              <NumberPad />
            </div>
          </div>
        </div>

        {/* Modals */}
        <PauseModal
          isOpen={showPauseModal}
          onClose={handlePauseResume}
          onNewGame={() => {
            setShowPauseModal(false);
            fetchNewGame();
          }}
          onQuit={handleQuit}
          timer={timer}
          mistakes={mistakes}
          difficulty={difficulty}
        />

        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />
      </main>
    </>
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
    title={label}
    onClick={onClick}
    className={cn(
      "flex-1 py-2 md:py-4 flex items-center justify-center rounded-xl border transition-all duration-200 group text-white/60 hover:text-white",
      active
        ? "bg-blue-600 border-blue-400/50 shadow-lg text-white"
        : "bg-white/5 border-white/10 hover:bg-white/10"
    )}
  >
    <div
      className={cn(
        "transition-transform group-hover:scale-110",
        active && "scale-110 text-white"
      )}
    >
      {icon}
    </div>
  </button>
);

export default SudokuPage;
