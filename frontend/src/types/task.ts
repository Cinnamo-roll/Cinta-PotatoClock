import type { TodoCategory, TimerType } from "./todo";

export type TaskStatus = "todo" | "doing" | "running" | "paused" | "done" | "archived";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string | number;
  userId?: number;
  collectionId?: number | null;
  collectionName?: string | null;
  title: string;
  description?: string;
  durationMinutes?: number;
  timerType?: TimerType;
  category?: TodoCategory;
  status: TaskStatus;
  priority: TaskPriority;
  backgroundStyle?: string;
  countToStats?: boolean;
  estimatedPotatoes?: number;
  completedPotatoes?: number;
  sortOrder: number;
  habitFrequency?: string;
  targetAmount?: number;
  targetUnit?: string;
  targetDeadline?: string;
  selected?: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  estimatedPotatoes: number;
}
