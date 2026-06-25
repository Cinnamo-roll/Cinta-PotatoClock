import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/common/Card";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import { formatPercent } from "@/components/stats/statsFormat";
import type { InterruptionReasonItem } from "@/types/stats";

const colors = ["var(--app-chart-1)", "var(--app-chart-2)", "var(--app-chart-3)", "var(--app-chart-4)", "var(--app-chart-5)"];

export function InterruptReasonCard({ month, reasons }: { month: string; reasons: InterruptionReasonItem[] }) {
  const hasData = reasons.some((item) => item.count > 0);

  return (
    <Card className="bg-[var(--app-card)]">
      <div className="mb-4">
        <p className="text-sm font-bold text-[var(--app-muted)]">打断原因分析</p>
        <h2 className="text-lg font-black text-[var(--app-text)]">{month}</h2>
      </div>
      {hasData ? (
        <div className="grid grid-cols-[120px_1fr] items-center gap-3">
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reasons} dataKey="count" nameKey="reason" innerRadius={34} outerRadius={54} paddingAngle={3}>
                  {reasons.map((item, index) => (
                    <Cell key={item.reason} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ border: "1px solid rgba(255,255,255,.78)", borderRadius: 16, background: "rgba(255,255,255,.84)", backdropFilter: "blur(18px)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {reasons.map((item, index) => (
              <div key={item.reason} className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--app-card-soft)] px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
                  <p className="truncate text-sm font-bold text-[var(--app-text)]">{item.reason}</p>
                </div>
                <p className="text-xs font-black text-[var(--app-muted)]">{formatPercent(item.percent)}%</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <StatsEmptyState title="暂无数据" description="放弃专注时选择原因后，这里会更有参考价值。" />
      )}
    </Card>
  );
}
