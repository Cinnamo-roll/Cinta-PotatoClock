import type { TimerType } from "./todo";

export interface TimerSession {
  id: number;
  taskId: number;
  collectionId?: number | null;
  taskTitle: string;
  mode: "focus";
  timerType: TimerType;
  category?: "normal" | "habit" | "goal";
  plannedMinutes: number;
  actualMinutes: number;
  actualSeconds?: number;
  startedAt: string;
  endedAt: string;
  completed: boolean;
  interrupted: boolean;
  interruptReason?: string | null;
  countToStats?: boolean;
  note?: string;
}

export type TimerSessionInput = Omit<TimerSession, "id">;
