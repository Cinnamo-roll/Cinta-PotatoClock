/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { LogIn, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/utils/cn";

export function GuestPreviewBanner({ withNav = true }: { withNav?: boolean }) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) return null;

  return (
    <aside
      className={cn(
        "fixed left-1/2 z-40 flex w-[calc(100%-32px)] max-w-[398px] -translate-x-1/2 items-center gap-3 rounded-[22px] border border-[color-mix(in_srgb,var(--app-accent)_38%,var(--app-border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary-soft)_90%,var(--app-card)),color-mix(in_srgb,var(--app-accent)_18%,var(--app-card)))] px-3 py-2.5 shadow-[0_12px_28px_rgba(75,58,30,0.16)]",
        withNav ? "bottom-[calc(var(--safe-bottom)+78px)]" : "bottom-[calc(var(--safe-bottom)+14px)]"
      )}
      aria-label="访客预览提示"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-card)] text-[var(--app-accent)] shadow-sm">
        <Sparkles size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm font-black text-[var(--app-text)]">功能预览</strong>
        <span className="block whitespace-nowrap text-[11px] font-bold text-[var(--app-muted)]">演示内容仅供查看</span>
      </span>
      <Link
        className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-xl bg-[var(--app-primary-strong)] px-3 text-xs font-black text-white shadow-sm transition active:scale-[0.97]"
        to="/login"
        state={{ from: location.pathname }}
      >
        <LogIn size={14} />
        去登录
      </Link>
    </aside>
  );
}
