"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Palette,
  Type,
  Eye,
  Sparkles,
  Timer,
  Eraser,
  Hash,
  X,
  Save,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface GameSettings {
  numberSize: "small" | "medium" | "large";
  highlightColor: string;
  showConflicts: boolean;
  autoRemoveNotes: boolean;
  highlightMatchingNumbers: boolean;
  showTimer: boolean;
  localSaveCount: number;
}

export const defaultSettings: GameSettings = {
  numberSize: "medium",
  highlightColor: "#3b82f6", // blue-500
  showConflicts: true,
  autoRemoveNotes: true,
  highlightMatchingNumbers: true,
  showTimer: true,
  localSaveCount: 2,
};

const HIGHLIGHT_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Green", value: "#22c55e" },
  { name: "Orange", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const updateSetting = <K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const sizeToValue = (size: "small" | "medium" | "large"): number => {
    return size === "small" ? 0 : size === "medium" ? 50 : 100;
  };

  const valueToSize = (value: number): "small" | "medium" | "large" => {
    return value <= 25 ? "small" : value <= 75 ? "medium" : "large";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="bg-[#0a0a0a]/95 backdrop-blur-xl border-white/10 text-white max-w-md p-0 overflow-hidden"
      >
        {/* Neon glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 blur-[60px] rounded-full" />
        </div>

        <div className="relative z-10 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3 text-xl font-bold">
              <div className="flex items-center gap-3 text-xl font-bold">
                <div className="size-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Settings className="size-5 text-purple-400" />
                </div>
                Settings
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Number Size */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Type className="size-4 text-blue-400" />
                <Label className="text-sm font-medium text-white">
                  Number Size
                </Label>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/40 w-10">Small</span>
                <Slider
                  value={[sizeToValue(settings.numberSize)]}
                  onValueChange={(v) =>
                    updateSetting("numberSize", valueToSize(v[0]))
                  }
                  max={100}
                  step={50}
                  className="flex-1"
                />
                <span className="text-xs text-white/40 w-10 text-right">
                  Large
                </span>
              </div>
              <div className="flex justify-center">
                <span
                  className={cn(
                    "font-bold text-blue-400 transition-all",
                    settings.numberSize === "small" && "text-lg",
                    settings.numberSize === "medium" && "text-2xl",
                    settings.numberSize === "large" && "text-3xl"
                  )}
                >
                  {settings.numberSize === "small"
                    ? "7"
                    : settings.numberSize === "medium"
                    ? "7"
                    : "7"}
                </span>
              </div>
            </motion.div>

            {/* Highlight Color */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Palette className="size-4 text-purple-400" />
                <Label className="text-sm font-medium text-white">
                  Highlight Color
                </Label>
              </div>
              <div className="flex gap-2 flex-wrap">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateSetting("highlightColor", color.value)}
                    className={cn(
                      "size-10 rounded-xl border-2 transition-all hover:scale-110",
                      settings.highlightColor === color.value
                        ? "border-white shadow-lg scale-110"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </motion.div>

            {/* Toggle Options */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <SettingToggle
                icon={<Eye className="size-4" />}
                label="Show Conflicts"
                description="Highlight duplicate numbers"
                checked={settings.showConflicts}
                onCheckedChange={(v) => updateSetting("showConflicts", v)}
              />
              <SettingToggle
                icon={<Eraser className="size-4" />}
                label="Auto-Remove Notes"
                description="Clear notes when filling a cell"
                checked={settings.autoRemoveNotes}
                onCheckedChange={(v) => updateSetting("autoRemoveNotes", v)}
              />
              <SettingToggle
                icon={<Hash className="size-4" />}
                label="Highlight Matching"
                description="Show all instances of selected number"
                checked={settings.highlightMatchingNumbers}
                onCheckedChange={(v) =>
                  updateSetting("highlightMatchingNumbers", v)
                }
              />
              <SettingToggle
                icon={<Timer className="size-4" />}
                label="Show Timer"
                description="Display game timer"
                checked={settings.showTimer}
                onCheckedChange={(v) => updateSetting("showTimer", v)}
              />
            </motion.div>

            {/* Local Save Count */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Save className="size-4 text-green-400" />
                <Label className="text-sm font-medium text-white">
                  Local Save
                </Label>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/40 w-8">2</span>
                <Slider
                  value={[settings.localSaveCount]}
                  onValueChange={(v) => updateSetting("localSaveCount", v[0])}
                  min={2}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-white/40 w-8 text-right">10</span>
              </div>
              <div className="flex justify-center">
                <span className="text-sm font-bold text-green-400">
                  {settings.localSaveCount} puzzles cached
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SettingToggle = ({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
    <div className="flex items-center gap-3">
      <div className="text-blue-400">{icon}</div>
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-white/40">{description}</p>
      </div>
    </div>
    <Switch
      className="data-[state=checked]:bg-purple-500"
      checked={checked}
      onCheckedChange={onCheckedChange}
    />
  </div>
);

export default SettingsModal;
