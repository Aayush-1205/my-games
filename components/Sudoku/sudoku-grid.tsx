"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getConflicts } from "@/lib/sudoku-utils";

interface SudokuGridProps {
  board: (number | null)[][];
  initialBoard: (number | null)[][];
  notes: Set<number>[][];
  selectedCell: [number, number] | null;
  onCellSelect: (row: number, col: number) => void;
  onCellValueChange: (row: number, col: number, value: number | null) => void;
  showConflicts?: boolean;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({
  board,
  initialBoard,
  notes,
  selectedCell,
  onCellSelect,
  onCellValueChange,
  showConflicts = true,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const [r, c] = selectedCell;

      if (e.key >= "1" && e.key <= "9") {
        onCellValueChange(r, c, parseInt(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        onCellValueChange(r, c, null);
      } else if (e.key === "ArrowUp" && r > 0) {
        onCellSelect(r - 1, c);
      } else if (e.key === "ArrowDown" && r < 8) {
        onCellSelect(r + 1, c);
      } else if (e.key === "ArrowLeft" && c > 0) {
        onCellSelect(r, c - 1);
      } else if (e.key === "ArrowRight" && c < 8) {
        onCellSelect(r, c + 1);
      }
    },
    [selectedCell, onCellValueChange, onCellSelect]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const renderCell = (r: number, c: number) => {
    const value = board[r][c];
    const isInitial = initialBoard[r][c] !== null;
    const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
    const isRelated =
      selectedCell &&
      (selectedCell[0] === r ||
        selectedCell[1] === c ||
        (Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) &&
          Math.floor(selectedCell[1] / 3) === Math.floor(c / 3)));

    const conflicts = showConflicts
      ? getConflicts(board, r, c)
      : { row: false, col: false, box: false };
    const hasConflict = conflicts.row || conflicts.col || conflicts.box;

    return (
      <motion.div
        key={`${r}-${c}`}
        whileHover={{ scale: isInitial ? 1 : 1.05 }}
        whileTap={{ scale: isInitial ? 1 : 0.95 }}
        onClick={() => onCellSelect(r, c)}
        className={cn(
          "relative group size-10 sm:size-12 md:size-14 flex items-center justify-center cursor-pointer transition-all duration-200 border-r border-b border-white/10 select-none text-xl md:text-2xl font-medium",
          // Thicker borders for boxes
          c % 3 === 2 && c !== 8 && "border-r-2 border-r-white/40",
          r % 3 === 2 && r !== 8 && "border-b-2 border-b-white/40",
          // Background colors
          isSelected
            ? "bg-blue-500/40 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10"
            : isRelated
            ? "bg-white/5 active:bg-white/10"
            : "hover:bg-white/5",
          // Text colors
          isInitial ? "text-white font-bold" : "text-blue-200 font-light",
          hasConflict && !isInitial && "text-red-400 bg-red-500/10",
          // Rounding corners
          r === 0 && c === 0 && "rounded-tl-xl",
          r === 0 && c === 8 && "rounded-tr-xl",
          r === 8 && c === 0 && "rounded-bl-xl",
          r === 8 && c === 8 && "rounded-br-xl"
        )}
      >
        <AnimatePresence mode="popLayout">
          {value ? (
            <motion.span
              key="value"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {value}
            </motion.span>
          ) : (
            <div
              key="notes"
              className="grid grid-cols-3 grid-rows-3 size-full p-1 gap-0.5 pointer-events-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <div
                  key={num}
                  className={cn(
                    "flex items-center justify-center text-[8px] md:text-[10px] text-white/40 transition-opacity",
                    notes[r][c].has(num) ? "opacity-100" : "opacity-0"
                  )}
                >
                  {num}
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="p-1 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
      <div className="grid grid-cols-9 overflow-hidden rounded-xl border-l border-t border-white/10">
        {board.map((row, r) => row.map((_, c) => renderCell(r, c)))}
      </div>
    </div>
  );
};

export default SudokuGrid;
