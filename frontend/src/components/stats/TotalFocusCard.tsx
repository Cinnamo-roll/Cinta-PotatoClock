import { Card } from "@/components/common/Card";
import { MetricTile } from "@/components/common/MetricTile";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { StatsSummary } from "@/types/stats";

export function TotalFocusCard({ summary }: { summary: StatsSummary }) {
  return (
    <Card className="relative overflow-hidden border-[color-mix(in_srgb,var(--app-border)_74%,transparent)] bg-[linear-gradient(135deg,var(--app-card)_0%,color-mix(in_srgb,var(--app-primary-soft)_48%,var(--app-card)_52%)_100%)] shadow-[0_10px_28px_rgba(60,50,70,0.08)]">
      <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
      <div className="relative">
        <p className="text-sm font-black text-[var(--app-text)]">累计专注</p>
        <p className="mt-3 truncate text-[30px] font-black leading-none text-[var(--app-primary-strong)]">{formatMinutes(summary.totalFocusMinutes)}</p>
        <p className="mt-2 text-xs font-bold text-[var(--app-muted)]">所有完成专注累计时长</p>
      </div>
      <div className="relative mt-4 grid grid-cols-2 gap-2">
        <MetricTile className="bg-white/58" label="累计次数" value={`${summary.totalFocusCount}次`} labelClassName="text-[11px]" />
        <MetricTile className="bg-white/58" label="日均时长" value={formatMinutes(summary.averageDailyFocusMinutes)} labelClassName="text-[11px]" />
      </div>
    </Card>
  );
}
