/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { LocalNotifications } from "@capacitor/local-notifications";
import { toast } from "sonner";
import { isNativeApp, platform } from "@/lib/capacitor";
import { storageService } from "./storageService";
import { syncTimerActivity } from "./timerActivityService";

const FOCUS_NOTIFICATION_BASE_ID = 420000;
const FUTURE_PLAN_NOTIFICATION_BASE_ID = 520000;
const webNotificationTimers = new Map<string, number>();

function focusNotificationKey(todoId: number) {
  return `focus-${todoId}`;
}

function focusNotificationId(todoId: number) {
  return FOCUS_NOTIFICATION_BASE_ID + todoId;
}

function futurePlanNotificationKey(planId: string | number) {
  return `future-plan-${planId}`;
}

function futurePlanNotificationId(planId: string | number) {
  const raw = String(planId);
  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) % 99999;
  }
  return FUTURE_PLAN_NOTIFICATION_BASE_ID + hash;
}

function clearWebNotification(key: string) {
  const timer = webNotificationTimers.get(key);
  if (timer != null) {
    window.clearTimeout(timer);
    webNotificationTimers.delete(key);
  }
}

function canUseWebNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function showWebNotification(title: string, body: string) {
  if (!canUseWebNotifications() || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      tag: "potato-focus",
      silent: false
    });
  } catch {
    // Browser notification failures should not interrupt the focus flow.
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNativeApp) {
    if (!canUseWebNotifications()) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") {
      toast.warning("请在浏览器设置中开启通知，才能收到提醒");
      return false;
    }
    const permission = await Notification.requestPermission();
    const granted = permission === "granted";
    await storageService.set("notificationPermissionRequested", "true");
    if (!granted) toast.warning("请在浏览器设置中开启通知，才能收到提醒");
    return granted;
  }
  try {
    const permission = await LocalNotifications.requestPermissions();
    const granted = permission.display === "granted";
    await storageService.set("notificationPermissionRequested", "true");
    if (!granted) toast.warning("请在系统设置中开启通知，才能收到锁屏提醒");
    return granted;
  } catch {
    toast.warning("请在系统设置中开启通知，才能收到锁屏提醒");
    return false;
  }
}

export async function checkNotificationPermission(): Promise<boolean> {
  if (!isNativeApp) return canUseWebNotifications() && Notification.permission === "granted";
  try {
    const permission = await LocalNotifications.checkPermissions();
    return permission.display === "granted";
  } catch {
    return false;
  }
}

export async function scheduleFocusEndNotification(params: { todoId: number; todoTitle: string; endAt: string }): Promise<void> {
  const allowed = (await checkNotificationPermission()) || (await requestNotificationPermission());
  if (!allowed) return;
  const at = new Date(params.endAt);
  if (at.getTime() <= Date.now()) return;
  if (platform === "android") {
    await syncTimerActivity(true);
  }
  const key = focusNotificationKey(params.todoId);
  if (!isNativeApp) {
    await cancelFocusNotification(params.todoId);
    const timeoutMs = at.getTime() - Date.now();
    const timer = window.setTimeout(() => {
      webNotificationTimers.delete(key);
      showWebNotification("专注完成了", `「${params.todoTitle}」已到点`);
    }, timeoutMs);
    webNotificationTimers.set(key, timer);
    return;
  }
  await LocalNotifications.schedule({
    notifications: [
      {
        id: focusNotificationId(params.todoId),
        title: "专注完成了",
        body: `「${params.todoTitle}」已到点，回来确认完成吧`,
        schedule: { at },
        sound: "default"
      }
    ]
  });
}

export async function cancelFocusNotification(todoId: number): Promise<void> {
  clearWebNotification(focusNotificationKey(todoId));
  if (!isNativeApp) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: focusNotificationId(todoId) }] });
  } catch {
    // Notification may not exist; no user-facing action needed.
  }
}

export async function rescheduleFocusNotification(params: { todoId: number; todoTitle: string; endAt?: string | number }): Promise<void> {
  await cancelFocusNotification(params.todoId);
  if (!params.endAt) return;
  const endAt = typeof params.endAt === "number" ? new Date(params.endAt).toISOString() : params.endAt;
  await scheduleFocusEndNotification({ todoId: params.todoId, todoTitle: params.todoTitle, endAt });
}

function planNotifyAt(targetDate: string) {
  return new Date(`${targetDate}T09:00:00`);
}

export async function scheduleFuturePlanNotification(params: { planId: string | number; title: string; targetDate: string }): Promise<void> {
  const allowed = (await checkNotificationPermission()) || (await requestNotificationPermission());
  if (!allowed) return;
  const at = planNotifyAt(params.targetDate);
  if (Number.isNaN(at.getTime()) || at.getTime() <= Date.now()) return;
  const key = futurePlanNotificationKey(params.planId);
  if (!isNativeApp) {
    await cancelFuturePlanNotification(params.planId);
    const timer = window.setTimeout(() => {
      webNotificationTimers.delete(key);
      showWebNotification("今天的计划到了", `「${params.title}」就在今天`);
    }, at.getTime() - Date.now());
    webNotificationTimers.set(key, timer);
    return;
  }
  await LocalNotifications.schedule({
    notifications: [
      {
        id: futurePlanNotificationId(params.planId),
        title: "今天的计划到了",
        body: `「${params.title}」就在今天`,
        schedule: { at },
        sound: "default"
      }
    ]
  });
}

export async function cancelFuturePlanNotification(planId: string | number): Promise<void> {
  clearWebNotification(futurePlanNotificationKey(planId));
  if (!isNativeApp) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: futurePlanNotificationId(planId) }] });
  } catch {
    // Notification may not exist; no user-facing action needed.
  }
}
