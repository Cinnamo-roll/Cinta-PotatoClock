import { Card } from "@/components/common/Card";
import { MetricTile } from "@/components/common/MetricTile";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { TodayStats } from "@/types/stats";

export function TodayFocusCard({ today }: { today: TodayStats }) {
  return (
    <Card className="overflow-hidden bg-[var(--app-card)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black text-[var(--app-text)]">今日专注</p>
      </div>
      <div className="mt-3 rounded-[22px] bg-[color-mix(in_srgb,var(--app-card-soft)_78%,transparent)] px-4 py-4">
        <p className="truncate text-[28px] font-black leading-none text-[var(--app-text)]">{formatMinutes(today.todayFocusMinutes)}</p>
        <p className="mt-2 text-xs font-bold text-[var(--app-muted)]">今天已经完成的专注时长</p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <MetricTile className="bg-white/62" label="专注次数" value={`${today.todayFocusCount}次`} labelClassName="text-[11px]" />
        <MetricTile className="bg-white/62" label="放弃次数" value={`${today.todayAbandonedCount}次`} labelClassName="text-[11px]" />
      </div>
    </Card>
  );
}
