/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { useEffect, useState } from "react";
import { Toaster } from "@/components/common/Toaster";
import { AppToast } from "@/components/common/AppToast";
import { AppUpdatePrompt } from "@/components/common/AppUpdatePrompt";
import { AppRouter } from "@/router/AppRouter";
import LandingPage from "@/pages/LandingPage";
import { initAppLifecycle } from "@/services/appLifecycleService";
import { setupAppChrome } from "@/services/appChromeService";
import { initTimerActivitySync } from "@/services/timerActivityService";
import { useSettingsStore } from "@/stores/settingsStore";
import { useThemeStore } from "@/theme/themeStore";
import { isLandingTarget } from "@/utils/env";
import { isNativeApp } from "@/lib/capacitor";

export default function App() {
  const applyTheme = useSettingsStore((state) => state.applyTheme);
  const applyAppTheme = useThemeStore((state) => state.applyTheme);
  const [chromeReady, setChromeReady] = useState(!isNativeApp || isLandingTarget);

  useEffect(() => {
    if (isLandingTarget) return;
    applyTheme();
    applyAppTheme();
    let disposed = false;
    let cleanupChrome: (() => void) | undefined;
    void setupAppChrome().then((cleanup) => {
      if (disposed) cleanup();
      else {
        cleanupChrome = cleanup;
        setChromeReady(true);
      }
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

  if (!chromeReady) return <div className="h-dvh w-full bg-[var(--app-bg)]" aria-hidden="true" />;

  return (
    <>
      <AppRouter />
      <AppUpdatePrompt />
      <Toaster />
      <AppToast />
    </>
  );
}
