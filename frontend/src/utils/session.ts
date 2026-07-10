import type { TimerSessionInput } from "@/types/session";
import type { TodoItem } from "@/types/todo";
import { localDateTime } from "@/utils/date";

export function noTimerCompletion(todo: TodoItem, completedAt = new Date()): TimerSessionInput {
  const timestamp = localDateTime(completedAt);
  return {
    taskId: todo.id,
    collectionId: todo.collectionId,
    taskTitle: todo.title,
    mode: "focus",
    timerType: "none",
    category: todo.category,
    plannedMinutes: 0,
    actualMinutes: 0,
    actualSeconds: 0,
    startedAt: timestamp,
    endedAt: timestamp,
    completed: true,
    interrupted: false,
    countToStats: false,
    note: todo.note
  };
}
