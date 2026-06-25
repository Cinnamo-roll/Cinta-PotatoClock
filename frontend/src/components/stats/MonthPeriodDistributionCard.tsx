import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/common/Card";
import { chartAnimation } from "@/components/stats/chartAnimation";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import type { DistributionItem } from "@/types/stats";

export function MonthPeriodDistributionCard({ month, data }: { month: string; data: DistributionItem[] }) {
  const hasData = data.some((item) => item.focusMinutes > 0);

  return (
    <Card className="space-y-4 bg-white">
      <div>
        <p className="text-sm font-bold text-[var(--app-muted)]">本月专注时段分布</p>
        <h2 className="text-lg font-black text-[var(--app-text)]">{month}</h2>
      </div>
      <div className="h-[210px] rounded-[22px] bg-[var(--app-card-soft)] p-3">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -18, right: 4, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="monthPeriodArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="var(--app-primary)" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="var(--app-primary-soft)" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(120,80,100,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--app-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--app-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: "1px solid rgba(255,255,255,.78)", borderRadius: 16, background: "rgba(255,255,255,.84)", backdropFilter: "blur(18px)" }} />
              <Area type="monotone" dataKey="focusMinutes" name="专注分钟" stroke="var(--app-primary)" strokeWidth={3} fill="url(#monthPeriodArea)" {...chartAnimation} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <StatsEmptyState title="暂无数据" description="这个月还没有形成明显的专注时段。" />
        )}
      </div>
    </Card>
  );
}
