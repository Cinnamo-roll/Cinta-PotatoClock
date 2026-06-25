import { motion, useReducedMotion } from "motion/react";
import { Card } from "@/components/common/Card";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { StatsSummary, TodayStats } from "@/types/stats";

function ProgressLine({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const width = `${Math.min(100, Math.max(8, value))}%`;

  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--app-primary-soft)]">
      <motion.div
        animate={{ width }}
        className="h-full rounded-full bg-[var(--app-primary)]"
        initial={{ width: reduceMotion ? width : "0%" }}
        transition={{ duration: reduceMotion ? 0 : 0.52, ease: "easeOut" }}
      />
    </div>
  );
}

export function StatsOverviewCard({ today, summary }: { today: TodayStats; summary: StatsSummary }) {
  const todayProgress = Math.min(100, Math.round((today.todayFocusMinutes / 120) * 100));

  return (
    <div className="space-y-3">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[var(--app-muted)]">今天</p>
            <h2 className="mt-2 text-[32px] font-black leading-none text-[var(--app-primary-strong)]">{formatMinutes(today.todayFocusMinutes)}</h2>
            <p className="mt-2 text-sm font-semibold text-[var(--app-muted)]">已经专注了一小段扎实的时间</p>
          </div>
          <div className="rounded-full bg-[var(--app-primary-soft)] px-4 py-2 text-center">
            <p className="text-xl font-black text-[var(--app-primary-strong)]">{today.todayFocusCount}</p>
            <p className="text-xs font-bold text-[var(--app-muted)]">次数</p>
          </div>
        </div>
        <ProgressLine value={todayProgress} />
      </Card>

      <Card className="p-4">
        <p className="text-sm font-bold text-[var(--app-muted)]">累计专注</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-[var(--app-text)]">{summary.totalFocusCount} 次</p>
            <p className="mt-1 text-sm font-semibold text-[var(--app-muted)]">{formatMinutes(summary.totalFocusMinutes)}</p>
          </div>
          <p className="rounded-full bg-[var(--app-card-soft)] px-3 py-1 text-xs font-bold text-[var(--app-primary-strong)]">
            日均 {formatMinutes(summary.averageDailyFocusMinutes)}
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-sm font-bold text-[var(--app-muted)]">今日专注</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div>
            <p className="text-xl font-black text-[var(--app-text)]">{today.todayFocusCount}</p>
            <p className="text-xs font-semibold text-[var(--app-muted)]">次数</p>
          </div>
          <div>
            <p className="text-xl font-black text-[var(--app-text)]">{formatMinutes(today.todayFocusMinutes)}</p>
            <p className="text-xs font-semibold text-[var(--app-muted)]">时长</p>
          </div>
          <div>
            <p className="text-xl font-black text-[var(--app-text)]">{today.todayAbandonedCount}</p>
            <p className="text-xs font-semibold text-[var(--app-muted)]">放弃</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
