import { motion } from "motion/react";
import { Button } from "./Button";
import { CutePotatoLogo } from "./CutePotatoLogo";

interface CuteEmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function CuteEmptyState({ title, description, actionLabel, onAction }: CuteEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-dashed border-[var(--app-border)] bg-[var(--app-card)] p-6 text-center shadow-[0_8px_24px_rgba(80,40,60,0.04)]"
    >
      <CutePotatoLogo size="sm" />
      <h3 className="mt-3 text-base font-bold text-[var(--app-text)]">{title}</h3>
      {description ? <p className="mt-1 text-sm text-[var(--app-muted)]">{description}</p> : null}
      {actionLabel ? (
        <Button className="mt-4" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </motion.div>
  );
}
