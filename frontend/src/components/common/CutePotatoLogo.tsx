import { motion } from "motion/react";
import { cn } from "@/utils/cn";

interface CutePotatoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28"
};

export function CutePotatoLogo({ size = "md", className }: CutePotatoLogoProps) {
  return (
    <motion.div
      animate={{ y: [0, -3, 0], rotate: [-1.5, 1.5, -1.5] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      className={cn("relative mx-auto", sizes[size], className)}
      aria-label="土豆时钟 Logo"
    >
      <img className="h-full w-full rounded-[24%] object-cover drop-shadow-[0_12px_24px_rgba(139,83,55,0.18)]" src="/icons/app-icon-256.png" alt="" aria-hidden="true" />
    </motion.div>
  );
}
