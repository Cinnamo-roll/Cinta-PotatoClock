import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/common/Card";
import { chartAnimation } from "@/components/stats/chartAnimation";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import type { DistributionItem } from "@/types/stats";

export function TimePeriodChart({ data }: { data: DistributionItem[] }) {
  const hasData = data.some((item) => item.focusMinutes > 0);

  return (
    <Card>
      <div className="mb-3">
        <p className="text-sm font-bold text-[var(--app-muted)]">时间段</p>
        <h2 className="text-base font-black text-[var(--app-text)]">专注时段分布</h2>
      </div>
      {hasData ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -24, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--app-border)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--app-muted)" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--app-muted)" />
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid var(--app-border)", background: "var(--app-card)" }} />
              <Bar dataKey="focusMinutes" name="分钟" radius={[12, 12, 4, 4]} fill="var(--app-primary)" {...chartAnimation} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <StatsEmptyState />
      )}
    </Card>
  );
}
