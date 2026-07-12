/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import type { PluginListenerHandle } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { toast } from "sonner";
import { isNativeApp } from "@/lib/capacitor";
import { restoreTimerState, saveTimerState } from "./timerPersistenceService";
import { syncTimerActivity } from "./timerActivityService";

let pendingSave: Promise<void> = Promise.resolve();

function saveActiveTimerForBackground() {
  pendingSave = saveTimerState().catch(() => undefined);
}

function restoreActiveTimer() {
  void pendingSave
    .then(() => restoreTimerState())
    .then(() => syncTimerActivity());
}

export function initAppLifecycle() {
  restoreActiveTimer();

  if (!isNativeApp) {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") saveActiveTimerForBackground();
      if (document.visibilityState === "visible") restoreActiveTimer();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }

  const handles: PluginListenerHandle[] = [];
  void CapacitorApp.addListener("appStateChange", ({ isActive }) => {
    if (isActive) restoreActiveTimer();
    else saveActiveTimerForBackground();
  }).then((handle) => handles.push(handle));
  void CapacitorApp.addListener("resume", () => {
    restoreActiveTimer();
  }).then((handle) => handles.push(handle));
  void CapacitorApp.addListener("pause", () => {
    saveActiveTimerForBackground();
  }).then((handle) => handles.push(handle));
  void Network.addListener("networkStatusChange", (status) => {
    if (!status.connected) toast.warning("当前网络不可用，部分同步可能延迟");
  }).then((handle) => handles.push(handle));

  return () => {
    handles.forEach((handle) => void handle.remove());
  };
}
