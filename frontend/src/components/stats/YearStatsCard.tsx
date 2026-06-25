import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/common/Card";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { YearStats } from "@/types/stats";

function DurationInline({ minutes }: { minutes: number }) {
  return (
    <p className="overflow-hidden whitespace-nowrap text-right text-[11px] font-extrabold leading-4 text-[var(--app-text)]">{formatMinutes(minutes)}</p>
  );
}

export function YearStatsCard({ yearly, onShiftYear }: { yearly: YearStats; onShiftYear: (step: -1 | 1) => void }) {
  const reduceMotion = useReducedMotion();
  const maxMinutes = Math.max(1, ...yearly.monthlyTrend.map((item) => item.focusMinutes));
  const summary = [
    { label: "完成专注", value: `${yearly.focusCount} 次` },
    { label: "专注时长", value: formatMinutes(yearly.focusMinutes) },
    { label: "放弃专注", value: `${yearly.abandonedCount} 次` },
    { label: "活跃天数", value: `${yearly.activeDays} 天` },
    { label: "最长连续", value: `${yearly.longestStreakDays} 天` },
    { label: "完成率", value: `${yearly.completionRate}%` }
  ];

  return (
    <Card className="space-y-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--app-text)]">年度数据</p>
          <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{yearly.year} · 全年专注记录</p>
        </div>
        <div className="flex gap-2">
          <button aria-label="上一年" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => onShiftYear(-1)} type="button">
            <ChevronLeft size={17} />
          </button>
          <button aria-label="下一年" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => onShiftYear(1)} type="button">
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="space-y-2 rounded-[22px] bg-[var(--app-card-soft)] p-3">
        {yearly.monthlyTrend.map((item, index) => (
          <div key={item.month} className="grid grid-cols-[34px_1fr_86px] items-center gap-2">
            <p className="text-xs font-black text-[var(--app-muted)]">{item.label ?? `${index + 1}月`}</p>
            <div className="h-3 overflow-hidden rounded-full bg-white">
              <motion.div
                animate={{ width: `${Math.max(4, (item.focusMinutes / maxMinutes) * 100)}%` }}
                className="h-full rounded-full bg-[var(--app-primary)]"
                initial={{ width: reduceMotion ? `${Math.max(4, (item.focusMinutes / maxMinutes) * 100)}%` : "0%" }}
                transition={{ delay: reduceMotion ? 0 : index * 0.025, duration: reduceMotion ? 0 : 0.46, ease: "easeOut" }}
              />
            </div>
            <DurationInline minutes={item.focusMinutes} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {summary.map((row) => (
          <div key={row.label} className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
            <p className="text-xs font-bold text-[var(--app-muted)]">{row.label}</p>
            <p className="mt-1 text-base font-black text-[var(--app-text)]">{row.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
