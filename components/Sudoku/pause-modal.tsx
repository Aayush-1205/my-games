"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Play,
  RotateCcw,
  Home,
  Timer,
  X as XIcon,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTime } from "@/lib/sudoku-utils";
import { cn } from "@/lib/utils";

const SUDOKU_TIPS = [
  "Look for naked singles - cells with only one possible number.",
  "Use scanning to find hidden singles in rows, columns, and boxes.",
  "Pencil marks help you track possibilities!",
  "Start with the numbers that appear most frequently.",
  "Work on one box at a time for better focus.",
  "If stuck, try the elimination technique.",
];

interface PauseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewGame: () => void;
  onQuit: () => void;
  timer: number;
  mistakes: number;
  difficulty: string;
}

const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onClose,
  onNewGame,
  onQuit,
  timer,
  mistakes,
  difficulty,
}) => {
  const randomTip = React.useMemo(
    () => SUDOKU_TIPS[Math.floor(Math.random() * SUDOKU_TIPS.length)],
    [isOpen]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 text-white max-w-md p-0 overflow-hidden"
      >
        {/* Neon glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/20 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/20 blur-[60px] rounded-full" />
        </div>

        <div className="relative z-10 p-6">
          <DialogHeader>
            <DialogTitle className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="size-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-2">
                  <Clock className="size-8 text-blue-400" />
                </div>
                <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
                  GAME PAUSED
                </span>
              </motion.div>
            </DialogTitle>
          </DialogHeader>

          {/* Stats Grid */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 mt-6"
          >
            <StatCard
              icon={<Timer className="size-5" />}
              label="Time"
              value={formatTime(timer)}
              color="blue"
            />
            <StatCard
              icon={<Target className="size-5" />}
              label="Mistakes"
              value={`${mistakes}/3`}
              color={mistakes >= 2 ? "red" : mistakes >= 1 ? "yellow" : "green"}
            />
            <StatCard
              icon={<Zap className="size-5" />}
              label="Difficulty"
              value={difficulty}
              color="purple"
            />
          </motion.div>

          {/* Pro Tip */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-[10px] uppercase font-bold text-white/40 mb-1">
              💡 Pro Tip
            </p>
            <p className="text-sm text-white/70">{randomTip}</p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 space-y-3"
          >
            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] group"
            >
              <Play className="size-6 group-hover:scale-110 transition-transform" />
              Resume Game
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onNewGame}
                className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-medium flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="size-4" />
                New Game
              </button>
              <button
                onClick={onQuit}
                className="py-3 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white/80 hover:text-red-400 font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Home className="size-4" />
                Quit
              </button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "green" | "yellow" | "red" | "purple";
}) => {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    yellow: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div
      className={cn("p-3 rounded-xl border text-center", colorClasses[color])}
    >
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] uppercase font-medium opacity-60">{label}</p>
    </div>
  );
};

export default PauseModal;
