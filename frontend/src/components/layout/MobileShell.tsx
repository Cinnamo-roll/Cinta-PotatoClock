import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BottomNav } from "./BottomNav";
import { cn } from "@/utils/cn";

interface MobileShellProps {
  children: ReactNode;
  withNav?: boolean;
  className?: string;
}

export function MobileShell({ children, withNav = true, className }: MobileShellProps) {
  return (
    <div className="h-dvh w-full overflow-hidden">
      <main
        className={cn(
          "app-screen-bg app-scroll mx-auto h-dvh w-full max-w-[430px] overflow-x-hidden overflow-y-auto px-4 pt-[calc(var(--safe-top)+0.75rem)]",
          withNav ? "pb-[calc(var(--safe-bottom)+112px)]" : "pb-6",
          className
        )}
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      </main>
      {withNav ? <BottomNav /> : null}
    </div>
  );
}
