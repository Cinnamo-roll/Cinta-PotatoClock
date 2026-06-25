import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/utils/cn";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedList({ children, className, stagger = 0.045 }: AnimatedListProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: reduceMotion ? 0 : stagger } }
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedListItem({ children, className }: AnimatedListItemProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("min-w-0", className)}
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
      }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
