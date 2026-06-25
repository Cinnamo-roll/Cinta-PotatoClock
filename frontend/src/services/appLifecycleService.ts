import type { PluginListenerHandle } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { toast } from "sonner";
import { isNativeApp } from "@/lib/capacitor";
import { useTimerStore } from "@/stores/timerStore";
import { cancelFocusNotification } from "./notificationService";
import { restoreTimerState, saveTimerState } from "./timerPersistenceService";

function pauseActiveTimerForBackground() {
  const timer = useTimerStore.getState();
  if (timer.state === "running") {
    timer.pause();
    if (timer.todo) void cancelFocusNotification(timer.todo.id);
  }
  void saveTimerState();
}

function restoreActiveTimer() {
  void restoreTimerState();
}

export function initAppLifecycle() {
  if (!isNativeApp) {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") pauseActiveTimerForBackground();
      if (document.visibilityState === "visible") restoreActiveTimer();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }

  const handles: PluginListenerHandle[] = [];
  void CapacitorApp.addListener("appStateChange", ({ isActive }) => {
    if (isActive) restoreActiveTimer();
    else pauseActiveTimerForBackground();
  }).then((handle) => handles.push(handle));
  void CapacitorApp.addListener("resume", () => {
    restoreActiveTimer();
  }).then((handle) => handles.push(handle));
  void CapacitorApp.addListener("pause", () => {
    pauseActiveTimerForBackground();
  }).then((handle) => handles.push(handle));
  void Network.addListener("networkStatusChange", (status) => {
    if (!status.connected) toast.warning("当前网络不可用，部分同步可能延迟");
  }).then((handle) => handles.push(handle));

  return () => {
    handles.forEach((handle) => void handle.remove());
  };
}
