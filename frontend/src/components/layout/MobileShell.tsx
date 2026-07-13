import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { GuestPreviewBanner } from "@/components/common/GuestPreviewBanner";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/utils/cn";

interface MobileShellProps {
  children: ReactNode;
  withNav?: boolean;
  className?: string;
}

export function MobileShell({ children, withNav = true, className }: MobileShellProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const showGuestBanner = withNav && !isAuthenticated;

  return (
    <div className="h-dvh w-full overflow-hidden">
      <main
        className={cn(
          "app-screen-bg app-scroll mx-auto h-dvh w-full max-w-[430px] overflow-x-hidden overflow-y-auto px-4 pt-[calc(var(--safe-top)+0.75rem)]",
          withNav
            ? showGuestBanner
              ? "pb-[calc(var(--safe-bottom)+176px)]"
              : "pb-[calc(var(--safe-bottom)+112px)]"
            : "pb-[calc(var(--safe-bottom)+1.5rem)]",
          className
        )}
      >
        <div className="app-page-content">{children}</div>
      </main>
      {showGuestBanner ? <GuestPreviewBanner /> : null}
      {withNav ? <BottomNav /> : null}
    </div>
  );
}
