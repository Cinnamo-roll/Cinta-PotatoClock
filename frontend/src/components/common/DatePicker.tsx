import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, daysInLocalMonth, formatLocalDate, localDateKey, localMonthKey, parseLocalDate, pad2 } from "@/utils/date";
import { cn } from "@/utils/cn";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  label?: string;
  className?: string;
}

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

function monthStartOffset(monthKey: string) {
  const first = parseLocalDate(`${monthKey}-01`).getDay();
  return first === 0 ? 6 : first - 1;
}

export function DatePicker({ value, onChange, minDate, label, className }: DatePickerProps) {
  const today = localDateKey();
  const safeValue = value || minDate || today;
  const [visibleMonth, setVisibleMonth] = useState(() => localMonthKey(parseLocalDate(safeValue)));
  const visibleDate = parseLocalDate(`${visibleMonth}-01`);
  const minMonth = minDate ? localMonthKey(parseLocalDate(minDate)) : "";
  const canGoPrev = !minMonth || visibleMonth > minMonth;
  useEffect(() => {
    setVisibleMonth((current) => {
      const next = localMonthKey(parseLocalDate(safeValue));
      return current === next ? current : next;
    });
  }, [safeValue]);
  const days = useMemo(() => {
    const offset = monthStartOffset(visibleMonth);
    const total = daysInLocalMonth(visibleMonth);
    return [...Array(offset).fill(null), ...Array.from({ length: total }, (_, index) => index + 1)];
  }, [visibleMonth]);

  const shiftMonth = (step: -1 | 1) => {
    const next = localMonthKey(addMonths(visibleDate, step));
    if (step < 0 && minMonth && next < minMonth) return;
    setVisibleMonth(next);
  };

  const pick = (day: number) => {
    const next = `${visibleMonth}-${pad2(day)}`;
    if (minDate && next < minDate) return;
    onChange(next);
  };

  return (
    <div className={cn("rounded-[22px] border border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-card)_74%,var(--app-primary-soft))] p-3", className)}>
      {label ? <p className="mb-2 text-sm font-black text-[var(--app-muted)]">{label}</p> : null}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-card)] text-[var(--app-primary-strong)] disabled:opacity-35"
          disabled={!canGoPrev}
          onClick={() => shiftMonth(-1)}
          aria-label="上个月"
        >
          <ChevronLeft size={17} />
        </button>
        <div className="text-center">
          <p className="text-base font-black text-[var(--app-text)]">{visibleDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}</p>
          <p className="text-xs font-bold text-[var(--app-muted)]">{formatLocalDate(safeValue)}</p>
        </div>
        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-card)] text-[var(--app-primary-strong)]" onClick={() => shiftMonth(1)} aria-label="下个月">
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-black text-[var(--app-muted)]">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} className="h-9" />;
          const dateKey = `${visibleMonth}-${pad2(day)}`;
          const disabled = !!minDate && dateKey < minDate;
          const selected = dateKey === safeValue;
          const isToday = dateKey === today;
          return (
            <button
              key={dateKey}
              type="button"
              disabled={disabled}
              onClick={() => pick(day)}
              className={cn(
                "h-9 rounded-[14px] text-sm font-black transition active:scale-95",
                selected ? "bg-[var(--app-primary)] text-white shadow-[0_8px_18px_color-mix(in_srgb,var(--app-primary)_18%,transparent)]" : "bg-[color-mix(in_srgb,var(--app-card)_72%,transparent)] text-[var(--app-text)]",
                isToday && !selected && "text-[var(--app-primary-strong)]",
                disabled && "cursor-not-allowed bg-transparent text-[color-mix(in_srgb,var(--app-muted)_38%,transparent)] active:scale-100"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
