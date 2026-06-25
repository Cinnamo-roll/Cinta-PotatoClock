import { CalendarSearch, Flame, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";

interface StatsRecordMenuProps {
  open: boolean;
  anchorRect?: DOMRect | null;
  onOpenHistory: () => void;
  onOpenHeatmap: () => void;
  onOpenWeekly: () => void;
  onClose?: () => void;
}

export function StatsRecordMenu({ open, anchorRect, onOpenHistory, onOpenHeatmap, onOpenWeekly, onClose }: StatsRecordMenuProps) {
  const reduceMotion = useReducedMotion();
  const items = [
    { label: "查看历史记录", icon: CalendarSearch, action: onOpenHistory },
    { label: "查看热力图", icon: Flame, action: onOpenHeatmap },
    { label: "查看一周总结", icon: Sparkles, action: onOpenWeekly }
  ];

  const handleAction = (action: () => void) => {
    onClose?.();
    action();
  };

  const menuWidth = Math.min(300, Math.max(240, anchorRect?.width ?? 300));
  const menuHeight = 210;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const anchorLeft = anchorRect ? anchorRect.left + anchorRect.width / 2 - menuWidth / 2 : viewportWidth / 2 - menuWidth / 2;
  const left = Math.min(Math.max(14, anchorLeft), viewportWidth - menuWidth - 14);
  const belowTop = (anchorRect?.bottom ?? viewportHeight / 2) + 8;
  const aboveTop = (anchorRect?.top ?? viewportHeight / 2) - menuHeight - 8;
  const preferredTop = belowTop + menuHeight <= viewportHeight - 14 ? belowTop : aboveTop;
  const top = Math.min(Math.max(14, preferredTop), viewportHeight - menuHeight - 14);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="关闭专注记录菜单"
            className="fixed inset-0 z-[70] cursor-default bg-[rgba(38,35,42,0.08)]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: reduceMotion ? 0 : 0.14 }}
            type="button"
          />
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="app-quick-menu fixed z-[80] rounded-[22px] p-2"
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.985, y: reduceMotion ? 0 : -4 }}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.985, y: reduceMotion ? 0 : -4 }}
            style={{ left, top, width: menuWidth, transformOrigin: "top center" }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
          >
            <div className="mb-1 flex items-center gap-2 px-3 py-2 text-xs font-black text-[var(--app-muted)]">
              <CalendarSearch size={14} />
              记录视图
            </div>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  animate={{ opacity: 1 }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-[var(--app-text)] transition hover:bg-[var(--app-primary-soft)] active:bg-[var(--app-primary-soft)]"
                  initial={{ opacity: 0 }}
                  key={item.label}
                  onClick={() => handleAction(item.action)}
                  transition={{ duration: reduceMotion ? 0 : 0.12 }}
                  type="button"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]">
                    <Icon size={16} />
                  </span>
                  {item.label}
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
