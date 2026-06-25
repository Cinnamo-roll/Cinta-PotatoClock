import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "app-surface-card rounded-[24px] border border-[color-mix(in_srgb,var(--app-border)_72%,transparent)] p-4 transition",
        className
      )}
      {...props}
    />
  );
}
