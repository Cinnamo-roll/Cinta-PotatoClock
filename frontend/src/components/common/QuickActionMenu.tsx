import { CheckCheck, CheckCircle2, Moon, Sunrise } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";
import { checkinLabel, checkinMenuDescription } from "@/services/checkinService";

export interface QuickActionMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWakeup: () => void;
  onFocusCheckin: () => void;
  onSleep: () => void;
}

export function QuickActionMoreButton({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button aria-label="快捷打卡菜单" aria-expanded={open} className="app-header-button" onClick={onClick} type="button">
      <CheckCheck size={19} />
    </button>
  );
}

export function QuickActionMenu({ open, onOpenChange, onWakeup, onFocusCheckin, onSleep }: QuickActionMenuProps) {
  const reduceMotion = useReducedMotion();
  const items = [
    { type: "wakeup" as const, icon: Sunrise, action: onWakeup, tone: "#EFAF52" },
    { type: "focus_today" as const, icon: CheckCircle2, action: onFocusCheckin, tone: "var(--app-primary-strong)" },
    { type: "sleep" as const, icon: Moon, action: onSleep, tone: "#6E78B7" }
  ];

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="关闭快捷菜单"
            className="fixed inset-0 z-[70] cursor-default bg-transparent"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            transition={{ duration: reduceMotion ? 0 : 0.14 }}
            type="button"
          />
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="app-quick-menu fixed top-[calc(var(--safe-top)+4rem)] z-[80] w-60 max-w-[calc(100vw-2rem)] rounded-[22px] p-2"
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.985, y: reduceMotion ? 0 : -4 }}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.985, y: reduceMotion ? 0 : -4 }}
            style={{ right: "max(1rem, calc((100vw - 430px) / 2 + 1rem))", transformOrigin: "top right" }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
          >
            <div className="mb-1 flex items-center gap-2 px-3 py-2 text-xs font-black text-[var(--app-muted)]">
              <CheckCheck size={14} />
              快捷操作
            </div>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  animate={{ opacity: 1 }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-[var(--app-text)] transition hover:bg-[var(--app-primary-soft)]"
                  initial={{ opacity: 0 }}
                  key={item.type}
                  onClick={() => {
                    item.action();
                    onOpenChange(false);
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.12 }}
                  type="button"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--app-primary-soft)]" style={{ color: item.tone }}>
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-black">{checkinLabel(item.type)}</span>
                    <span className="mt-0.5 block text-xs font-semibold leading-4 text-[var(--app-muted)]">{checkinMenuDescription(item.type)}</span>
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
