import { Sprout } from "lucide-react";

export function StatsEmptyState({
  title = "暂无专注数据",
  description = "完成专注后显示"
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-[var(--app-card-soft)] px-4 py-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--app-primary-strong)]">
        <Sprout size={20} />
      </div>
      <p className="mt-3 text-sm font-black text-[var(--app-text)]">{title}</p>
      <p className="mx-auto mt-1 max-w-[220px] text-xs font-semibold leading-5 text-[var(--app-muted)]">{description}</p>
    </div>
  );
}
