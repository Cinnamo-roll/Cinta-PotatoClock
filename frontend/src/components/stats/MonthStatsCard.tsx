import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/common/Card";
import { formatDuration } from "@/components/stats/statsFormat";
import type { MonthlyStats } from "@/types/stats";

export function MonthStatsCard({ monthly, onShiftMonth }: { monthly: MonthlyStats; onShiftMonth: (step: -1 | 1) => void }) {
  const reduceMotion = useReducedMotion();
  const rows = [
    { label: "完成专注", value: `${monthly.focusCount} 次`, progress: Math.min(100, monthly.focusCount * 4) },
    { label: "专注时长", value: formatDuration(monthly.focusSeconds, monthly.focusMinutes), progress: Math.min(100, monthly.focusMinutes / 12) },
    { label: "放弃专注", value: `${monthly.abandonedCount} 次`, progress: Math.min(100, monthly.abandonedCount * 12) },
    { label: "完成率", value: `${monthly.completionRate}%`, progress: monthly.completionRate },
    { label: "专注天数", value: `${monthly.activeDays} 天`, progress: Math.min(100, (monthly.activeDays / 30) * 100) }
  ];

  return (
    <Card className="bg-white">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--app-text)]">月度数据</p>
          <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{monthly.month}</p>
        </div>
        <div className="flex gap-2">
          <button aria-label="上个月" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => onShiftMonth(-1)} type="button">
            <ChevronLeft size={17} />
          </button>
          <button aria-label="下个月" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => onShiftMonth(1)} type="button">
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[var(--app-muted)]">{row.label}</p>
              </div>
              <p className="shrink-0 text-sm font-black text-[var(--app-text)]">{row.value}</p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white">
              <motion.div
                animate={{ width: `${Math.max(4, row.progress)}%` }}
                className="h-full rounded-full bg-[var(--app-primary)]"
                initial={{ width: reduceMotion ? `${Math.max(4, row.progress)}%` : "0%" }}
                transition={{ delay: reduceMotion ? 0 : 0.04, duration: reduceMotion ? 0 : 0.52, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
