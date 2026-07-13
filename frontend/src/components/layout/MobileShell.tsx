import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { GuestPreviewBanner } from "@/components/common/GuestPreviewBanner";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/utils/cn";

interface MobileShellProps {
  children: ReactNode;
  withNav?: boolean;
  className?: string;
  statusBarTone?: "card" | "background";
}

export function MobileShell({ children, withNav = true, className, statusBarTone = "card" }: MobileShellProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const showGuestBanner = withNav && !isAuthenticated;
  const bottomPadding = withNav ? (showGuestBanner ? "calc(var(--safe-bottom) + 176px)" : "calc(var(--safe-bottom) + 112px)") : "calc(var(--safe-bottom) + 1.5rem)";

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div
        aria-hidden="true"
        className={cn("app-status-surface", statusBarTone === "card" ? "app-status-surface-card" : "app-status-surface-background")}
      />
      <main
        className={cn(
          "app-screen-bg app-scroll mx-auto h-dvh w-full max-w-[430px] overflow-x-hidden overflow-y-auto px-4",
          className
        )}
        style={{ paddingTop: "calc(var(--safe-top) + 0.75rem)", paddingBottom: bottomPadding }}
      >
        <div className="app-page-content">{children}</div>
      </main>
      {showGuestBanner ? <GuestPreviewBanner /> : null}
      {withNav ? <BottomNav /> : null}
    </div>
  );
}
