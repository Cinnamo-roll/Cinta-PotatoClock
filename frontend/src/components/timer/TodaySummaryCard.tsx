import { Clock3, Flame, Sprout } from "lucide-react";
import { Card } from "@/components/common/Card";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { TodayStats } from "@/types/stats";

interface TodaySummaryCardProps {
  stats?: TodayStats;
}

export function TodaySummaryCard({ stats }: TodaySummaryCardProps) {
  const items = [
    { label: "专注时长", value: formatMinutes(stats?.todayFocusMinutes ?? 0), icon: Clock3, isDuration: true },
    { label: "专注次数", value: `${stats?.todayFocusCount ?? 0}次`, icon: Sprout },
    { label: "放弃次数", value: `${stats?.todayAbandonedCount ?? 0}次`, icon: Flame }
  ];

  return (
    <Card className="grid grid-cols-3 gap-2 p-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-3xl bg-[var(--app-primary-soft)] p-3 text-center">
          <item.icon className="mx-auto text-[var(--app-primary-strong)]" size={18} />
          <p className={item.isDuration ? "mt-1 min-h-6 truncate whitespace-nowrap text-sm font-extrabold leading-6 text-[var(--app-text)]" : "mt-1 min-h-6 truncate whitespace-nowrap text-lg font-black leading-6 text-[var(--app-text)]"}>{item.value}</p>
          <p className="text-[11px] font-semibold text-[var(--app-muted)]">{item.label}</p>
        </div>
      ))}
    </Card>
  );
}
