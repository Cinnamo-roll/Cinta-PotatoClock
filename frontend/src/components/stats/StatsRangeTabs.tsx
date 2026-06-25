import { cn } from "@/utils/cn";
import type { StatsRange } from "@/types/stats";

const ranges: Array<{ value: StatsRange; label: string }> = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
  { value: "custom", label: "自定" }
];

export function StatsRangeTabs({ value, onChange }: { value: StatsRange; onChange: (value: StatsRange) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1 rounded-full border border-[var(--app-border)] bg-[var(--app-primary-soft)]/70 p-1">
      {ranges.map((range) => (
        <button
          key={range.value}
          className={cn(
            "rounded-full px-3 py-2 text-sm font-bold text-[var(--app-muted)] transition",
            value === range.value && "bg-[var(--app-card)] text-[var(--app-primary-strong)] shadow-[0_6px_18px_rgba(60,50,70,0.10)]"
          )}
          onClick={() => onChange(range.value)}
          type="button"
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
