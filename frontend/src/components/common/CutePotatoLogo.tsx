import { useId } from "react";
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
  const id = useId().replace(/:/g, "");
  const bodyGradient = `potatoBody${id}`;

  return (
    <motion.div
      animate={{ y: [0, -3, 0], rotate: [-1.5, 1.5, -1.5] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      className={cn("relative mx-auto", sizes[size], className)}
      aria-label="土豆时钟 Logo"
    >
      <svg className="h-full w-full drop-shadow-[0_12px_24px_rgba(139,83,55,0.18)]" viewBox="0 0 128 128" role="img" aria-hidden="true">
        <defs>
          <radialGradient id={bodyGradient} cx="38%" cy="26%" r="72%">
            <stop offset="0%" stopColor="#FFE9B8" />
            <stop offset="52%" stopColor="#EFC16F" />
            <stop offset="100%" stopColor="#C98745" />
          </radialGradient>
        </defs>

        <path
          d="M65 18C90 17 108 37 110 63c2 29-18 50-46 51-28 1-48-19-48-47 0-28 21-48 49-49Z"
          fill={`url(#${bodyGradient})`}
          stroke="#8E5A2F"
          strokeOpacity="0.16"
          strokeWidth="3"
        />
        <ellipse cx="50" cy="38" rx="17" ry="7" fill="#FFF3C8" opacity="0.28" transform="rotate(-13 50 38)" />
        <ellipse cx="43" cy="52" rx="4.5" ry="3.5" fill="#9B6536" opacity="0.24" />
        <ellipse cx="88" cy="47" rx="4" ry="3.2" fill="#9B6536" opacity="0.2" />
        <ellipse cx="73" cy="82" rx="5" ry="3.6" fill="#9B6536" opacity="0.22" />
        <ellipse cx="52" cy="96" rx="3.8" ry="2.8" fill="#9B6536" opacity="0.18" />
        <ellipse cx="93" cy="72" rx="3.2" ry="2.5" fill="#9B6536" opacity="0.16" />
      </svg>
    </motion.div>
  );
}
