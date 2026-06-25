import { ChevronLeft, ChevronRight } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/common/Card";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import { formatPercent } from "@/components/stats/statsFormat";
import type { InterruptionReasonItem } from "@/types/stats";

const colors = ["var(--app-chart-1)", "var(--app-chart-2)", "var(--app-chart-3)", "var(--app-chart-4)", "var(--app-chart-5)"];

const reasonText: Record<string, string> = {
  interrupted: "被打断",
  plan_changed: "计划调整",
  tired: "太累了",
  other: "其他"
};

interface MonthlyInterruptionReasonCardProps {
  month: string;
  reasons: InterruptionReasonItem[];
  onShiftMonth: (step: -1 | 1) => void;
}

export function MonthlyInterruptionReasonCard({ month, reasons, onShiftMonth }: MonthlyInterruptionReasonCardProps) {
  const displayReasons = reasons
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      displayReason: item.reasonText || reasonText[item.reason] || item.reason || "未填写原因"
    }));
  const totalCount = displayReasons.reduce((sum, item) => sum + item.count, 0);
  const hasData = totalCount > 0;

  return (
    <Card className="space-y-4 bg-[var(--app-card)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--app-text)]">月度打断原因分布</p>
          <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{month}</p>
        </div>
        <div className="flex gap-2">
          <button aria-label="上个月" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => onShiftMonth(-1)} type="button">
            <ChevronLeft size={17} />
          </button>
          <button aria-label="下个月" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => onShiftMonth(1)} type="button">
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      {hasData ? (
        <div className="grid grid-cols-[118px_1fr] items-center gap-3">
          <div className="h-[118px]">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}>
              <PieChart>
                <Pie data={displayReasons} dataKey="count" nameKey="displayReason" innerRadius={34} outerRadius={54} paddingAngle={3}>
                  {displayReasons.map((item, index) => (
                    <Cell key={item.reason} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload as (typeof displayReasons)[number];
                    return (
                      <div className="rounded-2xl border border-white/80 bg-white/95 px-3 py-2 text-xs font-bold text-[var(--app-text)] shadow-[0_10px_24px_rgba(120,70,90,0.14)] backdrop-blur-[18px]">
                        <p className="font-black">{item.displayReason}</p>
                        <p className="mt-1 text-[var(--app-muted)]">
                          {item.count} 次 · {formatPercent(item.percent)}%
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            <div className="rounded-2xl bg-[var(--app-card-soft)] px-3 py-2">
              <p className="text-xs font-bold text-[var(--app-muted)]">本月放弃</p>
              <p className="mt-1 text-lg font-black text-[var(--app-text)]">{totalCount} 次</p>
            </div>
            {displayReasons.map((item, index) => (
              <div key={item.reason} className="flex items-center justify-between gap-2 rounded-2xl bg-[var(--app-card-soft)] px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
                  <p className="truncate text-sm font-bold text-[var(--app-text)]">{item.displayReason}</p>
                </div>
                <p className="text-xs font-black text-[var(--app-muted)]">
                  {item.count} 次 · {formatPercent(item.percent)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <StatsEmptyState title="暂无打断原因数据" description="有放弃记录后显示" />
      )}
    </Card>
  );
}
