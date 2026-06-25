import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/common/Card";
import { chartAnimation } from "@/components/stats/chartAnimation";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import type { DistributionItem, StatsRange } from "@/types/stats";

const rangeTitle: Record<StatsRange, string> = {
  day: "今天",
  week: "本周",
  month: "本月",
  custom: "自定义"
};

export function FocusTrendChart({ data, range }: { data: DistributionItem[]; range: StatsRange }) {
  const hasData = data.some((item) => item.focusMinutes > 0);

  return (
    <Card>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--app-muted)]">{rangeTitle[range]}</p>
          <h2 className="text-base font-black text-[var(--app-text)]">专注趋势</h2>
        </div>
        <p className="rounded-full bg-[var(--app-card-soft)] px-3 py-1 text-xs font-bold text-[var(--app-primary-strong)]">分钟</p>
      </div>
      {hasData ? (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -24, right: 4, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="focusTrendFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--app-primary)" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="var(--app-primary)" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--app-border)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--app-muted)" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--app-muted)" />
              <Tooltip
                cursor={{ stroke: "var(--app-primary)", strokeWidth: 1 }}
                contentStyle={{ borderRadius: 14, border: "1px solid var(--app-border)", background: "var(--app-card)", boxShadow: "0 8px 20px rgba(80,40,60,0.08)" }}
              />
              <Area type="monotone" dataKey="focusMinutes" name="分钟" stroke="var(--app-primary-strong)" strokeWidth={3} fill="url(#focusTrendFill)" {...chartAnimation} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <StatsEmptyState />
      )}
    </Card>
  );
}
