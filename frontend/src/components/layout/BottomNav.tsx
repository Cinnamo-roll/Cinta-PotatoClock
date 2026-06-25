import { BarChart3, CalendarClock, FolderKanban, ListTodo, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "@/utils/cn";

const items = [
  { to: "/", label: "待办", icon: ListTodo },
  { to: "/collections", label: "待办集", icon: FolderKanban },
  { to: "/stats", label: "统计", icon: BarChart3 },
  { to: "/future", label: "未来", icon: CalendarClock },
  { to: "/profile", label: "我的", icon: UserRound }
];

export function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-2 pb-[calc(var(--safe-bottom)+10px)]">
      <div className="app-bottom-nav-surface pointer-events-auto relative grid grid-cols-5 overflow-hidden rounded-[26px] border border-[color-mix(in_srgb,var(--app-border)_68%,transparent)] p-1.5">
        <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[color-mix(in_srgb,var(--app-card)_88%,transparent)]" />
        <span className="app-bottom-nav-sheen pointer-events-none absolute inset-x-7 top-1 h-4 rounded-full blur-md" />
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.94 }}
                className={cn(
                  "relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-[22px] text-[11px] font-bold transition-colors",
                  isActive ? "text-[var(--app-primary-strong)]" : "text-[var(--app-muted)]"
                )}
              >
                <span className="relative flex h-6 w-8 items-center justify-center">
                  {isActive ? (
                    <motion.span
                      className="app-bottom-nav-icon-glow absolute h-7 w-7 rounded-full"
                      initial={{ opacity: 0, scale: 0.72 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.72 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    />
                  ) : null}
                  <motion.span className="relative flex" animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 24 }}>
                    <item.icon size={18} strokeWidth={2.2} />
                  </motion.span>
                </span>
                <span className="relative leading-none">{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
