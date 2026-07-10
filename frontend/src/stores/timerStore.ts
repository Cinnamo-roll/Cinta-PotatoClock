import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimerType, TodoItem } from "@/types/todo";
import type { TimerState } from "@/types/timer";

interface TimerStoreState {
  todo?: TodoItem;
  timerType: TimerType;
  state: TimerState;
  durationSeconds: number;
  remainingSeconds: number;
  elapsedSeconds: number;
  startedAt?: number;
  expectedEndAt?: number;
  pausedAt?: number;
  pausedTotalSeconds: number;
  pausedRemainingSeconds?: number;
  pausedElapsedSeconds?: number;
  finishedAt?: number;
  completedReason?: "natural" | "manual";
  recordedSessionKey?: string;
  startTodo: (todo: TodoItem) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  complete: (reason?: "natural" | "manual") => void;
  abandon: () => void;
  reset: () => void;
  tick: () => void;
  markSessionRecorded: (key?: string) => void;
  hydrateSnapshot: (snapshot: Partial<TimerStoreState>) => void;
}

function durationFromTodo(todo: TodoItem) {
  return Math.max(1, todo.durationMinutes || 25) * 60;
}

function calculateElapsed(state: TimerStoreState, now = Date.now()) {
  if (!state.startedAt) return state.elapsedSeconds;
  if (state.state === "paused") return state.pausedElapsedSeconds ?? state.elapsedSeconds;
  return Math.max(0, Math.floor((now - state.startedAt) / 1000) - state.pausedTotalSeconds);
}

function calculateRemaining(state: TimerStoreState, now = Date.now()) {
  if (state.timerType !== "countdown") return 0;
  if (state.state === "paused") return state.pausedRemainingSeconds ?? state.remainingSeconds;
  if (!state.expectedEndAt) return state.remainingSeconds;
  return Math.max(0, Math.ceil((state.expectedEndAt - now) / 1000));
}

function liveSnapshot(state: TimerStoreState, now = Date.now()) {
  const elapsedSeconds = calculateElapsed(state, now);
  const remainingSeconds =
    state.timerType === "countdown" ? calculateRemaining(state, now) : 0;
  return {
    elapsedSeconds:
      state.timerType === "countdown" ? Math.min(state.durationSeconds, elapsedSeconds) : elapsedSeconds,
    remainingSeconds
  };
}

export const useTimerStore = create<TimerStoreState>()(
  persist(
    (set, get) => ({
      todo: undefined,
      timerType: "countdown",
      state: "idle",
      durationSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      elapsedSeconds: 0,
      pausedTotalSeconds: 0,
      startTodo: (todo) => {
        const durationSeconds = durationFromTodo(todo);
        set({
          todo,
          timerType: todo.timerType,
          state: "idle",
          durationSeconds,
          remainingSeconds: todo.timerType === "countdown" ? durationSeconds : 0,
          elapsedSeconds: 0,
          startedAt: undefined,
          expectedEndAt: undefined,
          pausedAt: undefined,
          pausedTotalSeconds: 0,
          pausedRemainingSeconds: undefined,
          pausedElapsedSeconds: undefined,
          finishedAt: undefined,
          completedReason: undefined,
          recordedSessionKey: undefined
        });
      },
      start: () => {
        const current = get();
        const now = Date.now();
        const durationSeconds = current.todo ? durationFromTodo(current.todo) : current.durationSeconds;
        const shouldRestart = current.state === "completed" || current.state === "abandoned" || !current.startedAt;
        set({
          state: "running",
          durationSeconds,
          remainingSeconds:
            current.timerType === "countdown"
              ? shouldRestart
                ? durationSeconds
                : current.remainingSeconds
              : 0,
          elapsedSeconds: shouldRestart ? 0 : current.elapsedSeconds,
          startedAt: shouldRestart ? now : current.startedAt ?? now,
          expectedEndAt:
            current.timerType === "countdown"
              ? now + (shouldRestart ? durationSeconds : (current.pausedRemainingSeconds ?? current.remainingSeconds) || durationSeconds) * 1000
              : undefined,
          pausedAt: undefined,
          pausedTotalSeconds: shouldRestart ? 0 : current.pausedTotalSeconds,
          pausedRemainingSeconds: undefined,
          pausedElapsedSeconds: undefined,
          finishedAt: undefined,
          completedReason: undefined,
          recordedSessionKey: undefined
        });
      },
      pause: () => {
        const current = get();
        if (current.state !== "running") return;
        const now = Date.now();
        const { elapsedSeconds, remainingSeconds } = liveSnapshot(current, now);
        set({
          state: "paused",
          elapsedSeconds,
          remainingSeconds,
          pausedRemainingSeconds: remainingSeconds,
          pausedElapsedSeconds: elapsedSeconds,
          pausedAt: now,
          expectedEndAt: undefined
        });
      },
      resume: () => {
        const current = get();
        if (current.state !== "paused") return;
        const now = Date.now();
        set({
          state: "running",
          startedAt: current.startedAt ?? now,
          expectedEndAt:
            current.timerType === "countdown"
              ? now + (current.pausedRemainingSeconds ?? current.remainingSeconds) * 1000
              : undefined,
          pausedTotalSeconds:
            current.pausedAt && current.pausedAt < now
              ? current.pausedTotalSeconds + Math.floor((now - current.pausedAt) / 1000)
              : current.pausedTotalSeconds,
          pausedAt: undefined,
          pausedRemainingSeconds: undefined,
          pausedElapsedSeconds: undefined
        });
      },
      complete: (reason = "manual") => {
        const current = get();
        const now = Date.now();
        const { elapsedSeconds, remainingSeconds } = liveSnapshot(current, now);
        set({
          state: "completed",
          elapsedSeconds: reason === "natural" && current.timerType === "countdown" ? current.durationSeconds : elapsedSeconds,
          remainingSeconds: reason === "natural" && current.timerType === "countdown" ? 0 : remainingSeconds,
          finishedAt: now,
          expectedEndAt: undefined,
          completedReason: reason
        });
      },
      abandon: () => {
        const current = get();
        const now = Date.now();
        const { elapsedSeconds, remainingSeconds } = liveSnapshot(current, now);
        set({
          state: "abandoned",
          elapsedSeconds,
          remainingSeconds,
          finishedAt: now,
          expectedEndAt: undefined,
          completedReason: undefined
        });
      },
      reset: () => {
        const current = get();
        set({
          state: "idle",
          remainingSeconds: current.timerType === "countdown" ? current.durationSeconds : 0,
          elapsedSeconds: 0,
          startedAt: undefined,
          expectedEndAt: undefined,
          pausedAt: undefined,
          pausedTotalSeconds: 0,
          pausedRemainingSeconds: undefined,
          pausedElapsedSeconds: undefined,
          finishedAt: undefined,
          completedReason: undefined,
          recordedSessionKey: undefined
        });
      },
      tick: () => {
        const current = get();
        if (current.state !== "running") return;
        const now = Date.now();
        if (current.timerType !== "countdown") {
          set(liveSnapshot(current, now));
          return;
        }
        const { elapsedSeconds, remainingSeconds } = liveSnapshot(current, now);
        if (remainingSeconds <= 0) {
          set({ remainingSeconds: 0, elapsedSeconds: current.durationSeconds });
          get().complete("natural");
          return;
        }
        set({ remainingSeconds, elapsedSeconds });
      },
      markSessionRecorded: (key) => set({ recordedSessionKey: key }),
      hydrateSnapshot: (snapshot) => {
        set({
          todo: snapshot.todo,
          timerType: snapshot.timerType ?? "countdown",
          state: snapshot.state ?? "idle",
          durationSeconds: snapshot.durationSeconds ?? 25 * 60,
          remainingSeconds: snapshot.remainingSeconds ?? 25 * 60,
          elapsedSeconds: snapshot.elapsedSeconds ?? 0,
          startedAt: snapshot.startedAt,
          expectedEndAt: snapshot.expectedEndAt,
          pausedAt: snapshot.pausedAt,
          pausedTotalSeconds: snapshot.pausedTotalSeconds ?? 0,
          pausedRemainingSeconds: snapshot.pausedRemainingSeconds,
          pausedElapsedSeconds: snapshot.pausedElapsedSeconds,
          finishedAt: snapshot.finishedAt,
          completedReason: snapshot.completedReason,
          recordedSessionKey: snapshot.recordedSessionKey
        });
      }
    }),
    {
      name: "potato-timer",
      partialize: (state) => ({
        todo: state.todo,
        timerType: state.timerType,
        state: state.state,
        durationSeconds: state.durationSeconds,
        remainingSeconds: state.remainingSeconds,
        elapsedSeconds: state.elapsedSeconds,
        startedAt: state.startedAt,
        expectedEndAt: state.expectedEndAt,
        pausedRemainingSeconds: state.pausedRemainingSeconds,
        pausedAt: state.pausedAt,
        pausedTotalSeconds: state.pausedTotalSeconds,
        pausedElapsedSeconds: state.pausedElapsedSeconds,
        finishedAt: state.finishedAt,
        completedReason: state.completedReason,
        recordedSessionKey: state.recordedSessionKey
      }),
      onRehydrateStorage: () => (state) => state?.tick()
    }
  )
);
