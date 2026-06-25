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
      completedReason: state.completedReason
    })
  );
}

export async function restoreTimerState() {
  const raw = await storageService.get(TIMER_STATE_KEY);
  if (raw) {
    try {
      useTimerStore.getState().hydrateSnapshot(JSON.parse(raw));
    } catch {
      // Corrupt snapshots should not block app resume.
    }
  }
  useTimerStore.getState().tick();
}
