import { motion } from "motion/react";
import type { TimerMode } from "@/types/timer";
import { cn } from "@/utils/cn";

const modes: Array<{ value: TimerMode; label: string }> = [
  { value: "focus", label: "专注" },
  { value: "short_break", label: "短休息" },
  { value: "long_break", label: "长休息" }
];

interface ModeSwitcherProps {
  value: TimerMode;
  onChange: (mode: TimerMode) => void;
}

export function ModeSwitcher({ value, onChange }: ModeSwitcherProps) {
  return (
    <div className="grid grid-cols-3 rounded-full bg-white/48 p-1 dark:bg-white/8">
      {modes.map((mode) => (
        <button
          key={mode.value}
          className={cn(
            "relative min-h-10 rounded-full px-2 text-xs font-bold transition",
            value === mode.value ? "text-soil dark:text-cocoa" : "text-soil/55 dark:text-cream/55"
          )}
          onClick={() => onChange(mode.value)}
        >
          {value === mode.value ? <motion.span layoutId="mode-pill" className="absolute inset-0 rounded-full bg-potato" /> : null}
          <span className="relative">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
