export type TimerType = "countdown" | "countup" | "none";
export type TodoCategory = "normal" | "habit" | "goal";
export type TodoStatus = "todo" | "running" | "paused" | "done" | "archived";

export interface TodoItem {
  id: number;
  title: string;
  description?: string;
  durationMinutes: number;
  timerType: TimerType;
  category: TodoCategory;
  collectionId?: number | null;
  status: TodoStatus;
  backgroundStyle: string;
  includeInStats: boolean;
  countToStats: boolean;
  sortOrder?: number;
  recurrence?: "每天" | "每周" | "每月";
  targetAmount?: number;
  targetUnit?: "分钟" | "次";
  deadline?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoInput {
  title: string;
  durationMinutes: number;
  timerType: TimerType;
  category: TodoCategory;
  collectionId?: number | null;
  clearCollection?: boolean;
  backgroundStyle: string;
  includeInStats: boolean;
  countToStats?: boolean;
  sortOrder?: number;
  recurrence?: "每天" | "每周" | "每月";
  targetAmount?: number;
  targetUnit?: "分钟" | "次";
  deadline?: string;
  note?: string;
}

export interface TodoCollection {
  id: number;
  name: string;
  description?: string;
  color: string;
  todoCount?: number;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TodoCollectionInput {
  name: string;
  description?: string;
  color: string;
  sortOrder?: number;
}
