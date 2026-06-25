import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import { StatsRangeTabs } from "@/components/stats/StatsRangeTabs";
import { StatsRecordMenu } from "@/components/stats/StatsRecordMenu";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { StatsRange, TaskStatsItem } from "@/types/stats";

interface FocusDistributionCardProps {
  tasks: TaskStatsItem[];
  dateLabel: string;
  range: StatsRange;
  menuOpen: boolean;
  onRangeChange: (range: StatsRange) => void;
  onShiftDate: (step: -1 | 1) => void;
  onToggleMenu: () => void;
  onOpenCustom: () => void;
  onOpenHistory: () => void;
  onOpenHeatmap: () => void;
  onOpenWeekly: () => void;
}

const colors = ["var(--app-chart-1)", "var(--app-chart-2)", "var(--app-chart-3)", "var(--app-chart-4)", "var(--app-chart-5)"];

export function FocusDistributionCard({
  tasks,
  dateLabel,
  range,
  menuOpen,
  onRangeChange,
  onShiftDate,
  onToggleMenu,
  onOpenCustom,
  onOpenHistory,
  onOpenHeatmap,
  onOpenWeekly
}: FocusDistributionCardProps) {
  const recordButtonRef = useRef<HTMLButtonElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
  const distribution = tasks
    .filter((task) => task.focusMinutes > 0)
    .slice(0, 4)
    .map((task) => ({ name: task.taskTitle, value: task.focusMinutes }));
  const extraMinutes = tasks.slice(4).reduce((sum, task) => sum + task.focusMinutes, 0);
  const chartData = extraMinutes > 0 ? [...distribution, { name: "其他", value: extraMinutes }] : distribution;
  const totalMinutes = chartData.reduce((sum, item) => sum + item.value, 0);
  const hasData = totalMinutes > 0;

  const handleRangeChange = (nextRange: StatsRange) => {
    onRangeChange(nextRange);
    if (nextRange === "custom") onOpenCustom();
  };

  return (
    <Card className="space-y-4 bg-[var(--app-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-[var(--app-text)]">专注时长分布</p>
          <p className="mt-1 truncate text-xs font-bold text-[var(--app-muted)]">{dateLabel}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            aria-label="上一段时间"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/75 text-[var(--app-primary-strong)] shadow-[0_8px_20px_rgba(120,70,90,0.10)] backdrop-blur-[18px]"
            onClick={() => onShiftDate(-1)}
            type="button"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="下一段时间"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/75 text-[var(--app-primary-strong)] shadow-[0_8px_20px_rgba(120,70,90,0.10)] backdrop-blur-[18px]"
            onClick={() => onShiftDate(1)}
            type="button"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <StatsRangeTabs value={range} onChange={handleRangeChange} />

      {hasData ? (
        <>
          <div className="relative h-[190px] rounded-[22px] bg-[linear-gradient(180deg,var(--app-card-soft)_0%,var(--app-card)_100%)] p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={3} stroke="rgba(255,255,255,0.88)" strokeWidth={3}>
                  {chartData.map((item, index) => (
                    <Cell key={item.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatMinutes(Number(value)), "专注时长"]}
                  contentStyle={{ border: "1px solid color-mix(in srgb, var(--app-border) 72%, transparent)", borderRadius: 16, background: "color-mix(in srgb, var(--app-card) 88%, transparent)", backdropFilter: "blur(18px)", boxShadow: "0 10px 28px rgba(60,50,70,.10)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs font-bold text-[var(--app-muted)]">总时长</p>
                <p className="mt-1 text-lg font-black text-[var(--app-text)]">{formatMinutes(totalMinutes)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {chartData.map((item, index) => {
              const percent = Math.round((item.value / totalMinutes) * 100);
              return (
                <div key={item.name} className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--app-card-soft)] px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
                    <p className="truncate text-sm font-black text-[var(--app-text)]">{item.name}</p>
                  </div>
                  <p className="shrink-0 text-xs font-black text-[var(--app-muted)]">
                    {formatMinutes(item.value)} · {percent}%
                  </p>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <StatsEmptyState />
      )}

      <div className="relative">
        <Button
          ref={recordButtonRef}
          className="w-full"
          variant="secondary"
          onClick={() => {
            setMenuAnchor(recordButtonRef.current?.getBoundingClientRect() ?? null);
            onToggleMenu();
          }}
        >
          查看专注记录
        </Button>
        <StatsRecordMenu open={menuOpen} anchorRect={menuAnchor} onClose={onToggleMenu} onOpenHistory={onOpenHistory} onOpenHeatmap={onOpenHeatmap} onOpenWeekly={onOpenWeekly} />
      </div>
    </Card>
  );
}
