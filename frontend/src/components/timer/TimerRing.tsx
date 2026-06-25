import { motion } from "motion/react";
import { CutePotatoLogo } from "@/components/common/CutePotatoLogo";
import { formatSeconds, modeLabel } from "@/utils/format";
import type { TimerMode } from "@/types/timer";

interface TimerRingProps {
  mode: TimerMode;
  remainingSeconds: number;
  durationSeconds: number;
}

export function TimerRing({ mode, remainingSeconds, durationSeconds }: TimerRingProps) {
  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  const progress = durationSeconds ? 1 - remainingSeconds / durationSeconds : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative mx-auto flex h-[286px] w-[286px] items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 260 260" role="img" aria-label="倒计时进度">
        <circle cx="130" cy="130" r={radius} fill="none" stroke="rgba(255,255,255,0.58)" strokeWidth="18" />
        <motion.circle
          cx="130"
          cy="130"
          r={radius}
          fill="none"
          stroke={mode === "focus" ? "#bd7a38" : "#8fb66a"}
          strokeLinecap="round"
          strokeWidth="18"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />
      </svg>
      <div className="relative flex h-[224px] w-[224px] flex-col items-center justify-center rounded-[44%_56%_50%_50%] bg-gradient-to-br from-[#f7d77c] via-[#f2bf6c] to-[#d9984e] p-5 text-center shadow-soft dark:from-[#8b663c] dark:via-[#6f4d31] dark:to-[#4a3525]">
        <CutePotatoLogo size="sm" className="mb-2" />
        <p className="text-xs font-black uppercase tracking-[0.16em] text-soil/70 dark:text-cream/70">{modeLabel(mode)}</p>
        <p className="mt-1 text-5xl font-black tabular-nums text-soil dark:text-cream">{formatSeconds(remainingSeconds)}</p>
        <p className="mt-2 text-sm font-semibold text-soil/70 dark:text-cream/70">
          {mode === "focus" ? "本轮专注进行中" : "休息一下"}
        </p>
      </div>
    </div>
  );
}
