import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, icon: Icon, action, className }: PageHeaderProps) {
  return (
    <header className={cn("app-page-header", className)}>
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {Icon ? (
            <div className="app-page-header-icon">
              <Icon size={18} strokeWidth={2.3} />
            </div>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? <p className="text-xs font-black uppercase text-[var(--app-primary-strong)]">{eyebrow}</p> : null}
            <h1 className="app-page-title text-[24px] font-black leading-none tracking-normal">{title}</h1>
            {description ? <p className="mt-1 text-xs font-black text-[var(--app-muted)]">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="relative shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
