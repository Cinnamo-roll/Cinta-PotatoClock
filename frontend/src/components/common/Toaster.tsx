import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/utils/cn";

const SWIPE_DISMISS_DISTANCE = 42;
const SWIPE_DISMISS_VELOCITY = 520;

export function Toaster() {
  const toasts = useUiStore((state) => state.toasts);
  const dismiss = useUiStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(var(--safe-top)+0.75rem)] z-50 mx-auto flex w-full max-w-[430px] flex-col gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? XCircle : Info;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -28, scale: 0.98 }}
              drag="y"
              dragConstraints={{ top: -96, bottom: 8 }}
              dragElastic={{ top: 0.22, bottom: 0.04 }}
              onDragEnd={(_, info) => {
                if (info.offset.y <= -SWIPE_DISMISS_DISTANCE || info.velocity.y <= -SWIPE_DISMISS_VELOCITY) {
                  dismiss(toast.id);
                }
              }}
              className={cn(
                "pointer-events-auto touch-none rounded-3xl border bg-[var(--app-card)] p-4 shadow-[0_8px_24px_rgba(80,40,60,0.08)] active:cursor-grabbing",
                toast.tone === "error" ? "border-[color-mix(in_srgb,var(--app-danger)_28%,white)]" : "border-[var(--app-border)]"
              )}
            >
              <div className="flex gap-3">
                <Icon className={toast.tone === "error" ? "text-[var(--app-danger)]" : "text-[var(--app-primary-strong)]"} size={20} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[var(--app-text)]">{toast.title}</p>
                  {toast.description ? <p className="mt-0.5 text-sm text-[var(--app-muted)]">{toast.description}</p> : null}
                </div>
                <button className="text-[var(--app-muted)]" onClick={() => dismiss(toast.id)} aria-label="关闭提示">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
