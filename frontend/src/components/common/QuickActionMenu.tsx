import { CheckCheck, CheckCircle2, Moon, Sunrise } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";

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
    { label: "起床打卡", description: "记录今天醒来的时间", icon: Sunrise, action: onWakeup },
    { label: "今日专注打卡", description: "给今天的专注留个标记", icon: CheckCircle2, action: onFocusCheckin },
    { label: "睡眠打卡", description: "记录准备休息的时间", icon: Moon, action: onSleep }
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
            className="app-quick-menu fixed top-[4rem] z-[80] w-60 max-w-[calc(100vw-2rem)] rounded-[22px] p-2"
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
                  key={item.label}
                  onClick={() => {
                    item.action();
                    onOpenChange(false);
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.12 }}
                  type="button"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-black">{item.label}</span>
                    <span className="mt-0.5 block truncate text-xs font-semibold text-[var(--app-muted)]">{item.description}</span>
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
