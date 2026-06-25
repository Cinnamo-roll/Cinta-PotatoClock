import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/common/Card";
import { CheckinLineChart } from "@/components/stats/CheckinLineChart";
import type { CheckinLineItem } from "@/types/stats";

interface WakeupCheckinLineChartCardProps {
  month: string;
  data: CheckinLineItem[];
  onShiftMonth: (step: -1 | 1) => void;
}

export function WakeupCheckinLineChartCard({ month, data, onShiftMonth }: WakeupCheckinLineChartCardProps) {
  return (
    <Card className="space-y-4 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--app-text)]">起床打卡分布</p>
          <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{month} · 日期 - 起床时间</p>
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
      <CheckinLineChart data={data} emptyText="暂无起床打卡数据" tooltipLabel="起床" />
    </Card>
  );
}
