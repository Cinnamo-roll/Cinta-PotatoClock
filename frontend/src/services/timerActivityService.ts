/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { registerPlugin } from "@capacitor/core";
import { isNativeApp, isPluginAvailable } from "@/lib/capacitor";
import { useTimerStore } from "@/stores/timerStore";

type NativeTimerState = "idle" | "running" | "paused" | "completed" | "abandoned";

interface TimerActivityPayload {
  todoId?: number;
  title?: string;
  timerType: "countdown" | "countup" | "none";
  state: NativeTimerState;
  startedAt?: number;
  endAt?: number;
  displaySeconds?: number;
}

interface TimerActivityPlugin {
  sync(options: TimerActivityPayload): Promise<void>;
}

const TimerActivity = registerPlugin<TimerActivityPlugin>("TimerActivity");
let lastSignature = "";
let syncQueue: Promise<void> = Promise.resolve();

function currentPayload(): TimerActivityPayload {
  const timer = useTimerStore.getState();
  const displaySeconds =
    timer.timerType === "countdown" ? timer.remainingSeconds : timer.elapsedSeconds;
  const activityStartedAt =
    timer.timerType === "countup" && timer.startedAt
      ? timer.startedAt + timer.pausedTotalSeconds * 1000
      : timer.startedAt;

  return {
    todoId: timer.todo?.id,
    title: timer.todo?.title,
    timerType: timer.timerType,
    state:
      timer.state === "running" ||
      timer.state === "paused" ||
      timer.state === "completed" ||
      timer.state === "abandoned"
        ? timer.state
        : "idle",
    startedAt: activityStartedAt,
    endAt: timer.expectedEndAt,
    displaySeconds
  };
}

function payloadSignature(payload: TimerActivityPayload) {
  return JSON.stringify({
    ...payload,
    displaySeconds: payload.state === "running" ? undefined : payload.displaySeconds
  });
}

export async function syncTimerActivity(force = false): Promise<void> {
  if (!isNativeApp || !isPluginAvailable("TimerActivity")) return;
  const payload = currentPayload();
  const signature = payloadSignature(payload);
  if (!force && signature === lastSignature) return;
  lastSignature = signature;
  syncQueue = syncQueue
    .catch(() => undefined)
    .then(() => TimerActivity.sync(payload))
    .catch(() => {
      lastSignature = "";
    });
  await syncQueue;
}

export function initTimerActivitySync() {
  void syncTimerActivity(true);
  return useTimerStore.subscribe(() => {
    void syncTimerActivity();
  });
}
