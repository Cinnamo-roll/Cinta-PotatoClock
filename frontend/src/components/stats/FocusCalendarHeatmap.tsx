import { Card } from "@/components/common/Card";
import { formatMinutes } from "@/components/stats/statsFormat";
import { cn } from "@/utils/cn";
import type { CalendarStatsItem } from "@/types/stats";

function intensity(minutes: number) {
  if (minutes <= 0) return "bg-[var(--app-primary-soft)] opacity-45";
  if (minutes < 30) return "bg-[var(--app-primary)] opacity-45";
  if (minutes < 90) return "bg-[var(--app-primary)] opacity-70";
  return "bg-[var(--app-primary-strong)] opacity-90";
}

export function FocusCalendarHeatmap({
  data,
  selectedDate,
  onSelectDate
}: {
  data: CalendarStatsItem[];
  selectedDate?: string;
  onSelectDate: (date: string) => void;
}) {
  const selected = data.find((item) => item.date === selectedDate) ?? data[data.length - 1];

  return (
    <Card>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[var(--app-muted)]">日历</p>
          <h2 className="text-base font-black text-[var(--app-text)]">最近 28 天热力</h2>
        </div>
        {selected ? (
          <p className="text-right text-xs font-bold text-[var(--app-muted)]">
            {selected.date}
            <br />
            {formatMinutes(selected.focusMinutes)}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {data.map((item) => (
          <button
            key={item.date}
            className={cn(
              "aspect-square rounded-xl border border-transparent transition active:scale-95",
              intensity(item.focusMinutes),
              item.date === selected?.date && "border-[var(--app-primary-strong)] ring-2 ring-[var(--app-primary-soft)]"
            )}
            aria-label={`${item.date} 专注 ${formatMinutes(item.focusMinutes)}`}
            onClick={() => onSelectDate(item.date)}
            type="button"
          />
        ))}
      </div>
    </Card>
  );
}
