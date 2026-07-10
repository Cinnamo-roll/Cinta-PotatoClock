import { useEffect } from "react";
import { Toaster } from "@/components/common/Toaster";
import { AppToast } from "@/components/common/AppToast";
import { useScrollBoundaryGuard } from "@/hooks/useScrollBoundaryGuard";
import { AppRouter } from "@/router/AppRouter";
import LandingPage from "@/pages/LandingPage";
import { initAppLifecycle } from "@/services/appLifecycleService";
import { setupAppChrome } from "@/services/appChromeService";
import { initTimerActivitySync } from "@/services/timerActivityService";
import { useSettingsStore } from "@/stores/settingsStore";
import { useThemeStore } from "@/theme/themeStore";
import { isLandingTarget } from "@/utils/env";

export default function App() {
  const applyTheme = useSettingsStore((state) => state.applyTheme);
  const applyAppTheme = useThemeStore((state) => state.applyTheme);
  useScrollBoundaryGuard(undefined, !isLandingTarget);

  useEffect(() => {
    if (isLandingTarget) return;
    applyTheme();
    applyAppTheme();
    let disposed = false;
    let cleanupChrome: (() => void) | undefined;
    void setupAppChrome().then((cleanup) => {
      if (disposed) cleanup();
      else cleanupChrome = cleanup;
    });
    const cleanup = initAppLifecycle();
    const cleanupTimerActivity = initTimerActivitySync();
    return () => {
      disposed = true;
      void cleanup?.();
      cleanupTimerActivity();
      cleanupChrome?.();
    };
  }, [applyAppTheme, applyTheme]);

  if (isLandingTarget) return <LandingPage />;

  return (
    <>
      <AppRouter />
      <Toaster />
      <AppToast />
    </>
  );
}
