"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getConflicts } from "@/lib/sudoku-utils";
import type { GameSettings } from "./settings-modal";

interface SudokuGridProps {
  board: (number | null)[][];
  initialBoard: (number | null)[][];
  notes: Set<number>[][];
  selectedCell: [number, number] | null;
  onCellSelect: (row: number, col: number) => void;
  onCellValueChange: (row: number, col: number, value: number | null) => void;
  settings: GameSettings;
}

const SudokuGrid: React.FC<SudokuGridProps> = ({
  board,
  initialBoard,
  notes,
  selectedCell,
  onCellSelect,
  onCellValueChange,
  settings,
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

  // Get the highlighted number (selected cell's value)
  const highlightedNumber = selectedCell
    ? board[selectedCell[0]][selectedCell[1]]
    : null;

  const numberSizeClass = {
    small: "text-lg",
    medium: "text-xl md:text-2xl",
    large: "text-2xl md:text-3xl",
  }[settings.numberSize];

  const noteSizeClass = {
    small: "text-[6px]",
    medium: "text-[8px] md:text-[10px]",
    large: "text-[10px] md:text-[12px]",
  }[settings.numberSize];

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

    const isMatchingNumber =
      settings.highlightMatchingNumbers &&
      highlightedNumber !== null &&
      value === highlightedNumber &&
      !isSelected;

    const conflicts = settings.showConflicts
      ? getConflicts(board, r, c)
      : { row: false, col: false, box: false };
    const hasConflict = conflicts.row || conflicts.col || conflicts.box;

    return (
      <motion.div
        key={`${r}-${c}`}
        whileHover={{ scale: isInitial ? 1 : 1.02 }}
        whileTap={{ scale: isInitial ? 1 : 0.98 }}
        onClick={() => onCellSelect(r, c)}
        className={cn(
          "relative group w-full aspect-square md:aspect-auto md:h-16 lg:h-18 flex items-center justify-center cursor-pointer transition-all duration-200 border-r border-b border-white/10 select-none font-medium",
          numberSizeClass,
          // Thicker borders for boxes
          c % 3 === 2 && c !== 8 && "border-r-2 border-r-white/40",
          r % 3 === 2 && r !== 8 && "border-b-2 border-b-white/40",
          // Background colors
          isSelected && "z-10",
          isRelated && !isSelected && "bg-white/5",
          !isSelected && !isRelated && "hover:bg-white/5",
          // Matching number highlight
          isMatchingNumber && "bg-opacity-30",
          // Text colors
          isInitial ? "text-white font-bold" : "text-blue-200 font-light",
          hasConflict && !isInitial && "text-red-400 bg-red-500/10",
          // Rounding corners
          r === 0 && c === 0 && "rounded-tl-xl",
          r === 0 && c === 8 && "rounded-tr-xl",
          r === 8 && c === 0 && "rounded-bl-xl",
          r === 8 && c === 8 && "rounded-br-xl"
        )}
        style={{
          backgroundColor: isSelected
            ? `${settings.highlightColor}40`
            : isMatchingNumber
            ? `${settings.highlightColor}20`
            : undefined,
          boxShadow: isSelected
            ? `0 0 15px ${settings.highlightColor}50`
            : undefined,
        }}
      >
        <AnimatePresence mode="popLayout">
          {value ? (
            <motion.span
              key="value"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="lg:text-3xl"
            >
              {value}
            </motion.span>
          ) : (
            <div
              key="notes"
              className={cn(
                "grid grid-cols-3 grid-rows-3 size-full p-1 gap-0.5 pointer-events-none",
                noteSizeClass
              )}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <div
                  key={num}
                  className={cn(
                    "flex items-center justify-center text-white/40 transition-opacity",
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
    <div className="p-1 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl w-full max-w-[400px] sm:max-w-[480px] md:max-w-none mx-auto">
      <div className="grid grid-cols-9 overflow-hidden rounded-xl border-l border-t border-white/10">
        {board.map((row, r) => row.map((_, c) => renderCell(r, c)))}
      </div>
    </div>
  );
};

export default SudokuGrid;
