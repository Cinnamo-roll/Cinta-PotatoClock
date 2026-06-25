import type { Task } from "./task";

export type TimerMode = "focus" | "short_break" | "long_break";
export type TimerState = "idle" | "running" | "paused" | "completed" | "abandoned" | "skipped";

export interface TimerSnapshot {
  mode: TimerMode;
  state: TimerState;
  remainingSeconds: number;
  durationSeconds: number;
  startedAt?: number;
  expectedEndAt?: number;
  pausedRemainingSeconds?: number;
  currentTask?: Task;
}

export interface PotatoSession {
  id: string;
  taskId?: string;
  taskTitle?: string;
  mode: TimerMode;
  startedAt: string;
  endedAt: string;
  plannedMinutes: number;
  actualMinutes: number;
  completed: boolean;
}
