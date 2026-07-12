/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { useTimerStore } from "@/stores/timerStore";
import { storageService } from "./storageService";

const TIMER_STATE_KEY = "lastTimerState";

export async function saveTimerState() {
  const state = useTimerStore.getState();
  await storageService.set(
    TIMER_STATE_KEY,
    JSON.stringify({
      todo: state.todo,
      timerType: state.timerType,
      state: state.state,
      durationSeconds: state.durationSeconds,
      remainingSeconds: state.remainingSeconds,
      elapsedSeconds: state.elapsedSeconds,
      startedAt: state.startedAt,
      expectedEndAt: state.expectedEndAt,
      pausedAt: state.pausedAt,
      pausedTotalSeconds: state.pausedTotalSeconds,
      pausedRemainingSeconds: state.pausedRemainingSeconds,
      pausedElapsedSeconds: state.pausedElapsedSeconds,
      finishedAt: state.finishedAt,
      completedReason: state.completedReason,
      recordedSessionKey: state.recordedSessionKey
    })
  );
}

export async function restoreTimerState() {
  const raw = await storageService.get(TIMER_STATE_KEY);
  if (raw) {
    try {
      const current = useTimerStore.getState();
      const snapshot = JSON.parse(raw);
      // WebView localStorage is the live source. Native Preferences is only a fallback
      // when localStorage has no timer, so an older background snapshot cannot revive it.
      if (!current.todo && snapshot?.todo) {
        current.hydrateSnapshot(snapshot);
      }
    } catch {
      // Corrupt snapshots should not block app resume.
    }
  }
  useTimerStore.getState().tick();
}
