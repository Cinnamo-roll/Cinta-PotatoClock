import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedList({ children, className, stagger = 0.03 }: AnimatedListProps) {
  return (
    <div className={className} data-stagger={stagger}>
      {children}
    </div>
  );
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  return (
    <div className={cn("min-w-0", className)}>
      {children}
    </div>
  );
}
