import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface MetricTileProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  labelClassName?: string;
  valueClassName?: string;
  compact?: boolean;
}

export function MetricTile({ label, value, compact = false, className, labelClassName, valueClassName, ...props }: MetricTileProps) {
  return (
    <div className={cn("app-metric-tile min-w-0 rounded-2xl px-3 py-2", compact && "px-2 py-1.5 text-center", className)} {...props}>
      <p className={cn(compact ? "text-[10px]" : "text-xs", "font-bold text-[var(--app-muted)]", labelClassName)}>{label}</p>
      <p className={cn("mt-1 truncate font-black text-[var(--app-text)]", compact ? "text-xs" : "text-sm", valueClassName)}>{value}</p>
    </div>
  );
}
