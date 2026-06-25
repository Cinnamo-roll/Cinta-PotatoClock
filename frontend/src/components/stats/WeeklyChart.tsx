import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/common/Card";
import { chartAnimation } from "@/components/stats/chartAnimation";
import type { DistributionItem } from "@/types/stats";

interface WeeklyChartProps {
  data: DistributionItem[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <div className="space-y-3">
      <Card>
        <h2 className="mb-3 text-base font-black text-[var(--app-text)]">最近 7 天专注分钟</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -24, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--app-border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--app-muted)" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--app-muted)" />
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid var(--app-border)", background: "var(--app-card)" }} />
              <Bar dataKey="focusMinutes" radius={[12, 12, 4, 4]} fill="var(--app-primary)" {...chartAnimation} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 text-base font-black text-[var(--app-text)]">专注次数趋势</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -24, right: 4, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--app-border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--app-muted)" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--app-muted)" />
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid var(--app-border)", background: "var(--app-card)" }} />
              <Line type="monotone" dataKey="focusCount" stroke="var(--app-primary-strong)" strokeWidth={4} dot={{ r: 4, fill: "var(--app-primary)" }} {...chartAnimation} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
