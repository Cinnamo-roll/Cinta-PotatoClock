import type { ReactNode } from "react";
import { Card } from "@/components/common/Card";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[var(--app-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-black text-[var(--app-text)]">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]">{icon}</div>
      </div>
    </Card>
  );
}
