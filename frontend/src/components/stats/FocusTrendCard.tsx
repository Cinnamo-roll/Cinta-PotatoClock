import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/common/Card";
import { chartAnimation } from "@/components/stats/chartAnimation";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import type { DistributionItem, StatsRange } from "@/types/stats";

interface FocusTrendCardProps {
  data: DistributionItem[];
  dateLabel: string;
  range: StatsRange;
}

const titleMap: Record<StatsRange, string> = {
  day: "今日专注趋势",
  week: "本周专注趋势",
  month: "本月专注趋势",
  custom: "自定义专注趋势"
};

export function FocusTrendCard({ data, dateLabel, range }: FocusTrendCardProps) {
  const hasData = data.some((item) => item.focusMinutes > 0 || item.focusCount > 0);
  const chartData = hasData ? data : [];

  return (
    <Card className="space-y-4 bg-[var(--app-card)]">
      <div>
        <p className="text-sm font-black text-[var(--app-text)]">{titleMap[range]}</p>
        <p className="mt-1 truncate text-xs font-bold text-[var(--app-muted)]">{dateLabel}</p>
      </div>
      <div className="h-[190px] rounded-[22px] bg-[linear-gradient(180deg,var(--app-card-soft)_0%,var(--app-card)_100%)] p-3">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            {range === "day" ? (
              <BarChart data={chartData} margin={{ left: -22, right: 2, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="rgba(120,80,100,0.07)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--app-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--app-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: "1px solid rgba(255,255,255,.78)", borderRadius: 14, background: "rgba(255,255,255,.88)", backdropFilter: "blur(18px)", boxShadow: "0 8px 22px rgba(120,70,90,.10)" }} />
                <Bar dataKey="focusMinutes" name="专注分钟" fill="var(--app-primary)" radius={[10, 10, 5, 5]} {...chartAnimation} />
              </BarChart>
            ) : (
              <AreaChart data={chartData} margin={{ left: -22, right: 2, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusTrendArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="var(--app-primary)" stopOpacity={0.36} />
                    <stop offset="95%" stopColor="var(--app-primary-soft)" stopOpacity={0.06} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(120,80,100,0.07)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--app-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--app-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: "1px solid rgba(255,255,255,.78)", borderRadius: 14, background: "rgba(255,255,255,.88)", backdropFilter: "blur(18px)", boxShadow: "0 8px 22px rgba(120,70,90,.10)" }} />
                <Area type="monotone" dataKey="focusMinutes" name="专注分钟" stroke="var(--app-primary)" strokeWidth={2.5} fill="url(#focusTrendArea)" {...chartAnimation} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <StatsEmptyState title="暂无趋势" description="完成专注后显示" />
        )}
      </div>
    </Card>
  );
}
