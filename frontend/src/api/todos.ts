import { http, shouldUsePreviewApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { Task } from "@/types/task";
import type { TodoInput, TodoItem, TodoStatus } from "@/types/todo";

function taskToTodo(task: Task): TodoItem {
  const id = Number(task.id);
  const timerType = task.timerType ?? "countdown";
  const durationMinutes = timerType === "none" ? 0 : task.durationMinutes ?? Math.max(1, (task.estimatedPotatoes ?? 1) * 25);
  const countToStats = task.countToStats ?? true;
  const recurrence = task.habitFrequency === "weekly" ? "每周" : task.habitFrequency === "monthly" ? "每月" : task.habitFrequency === "daily" ? "每天" : undefined;
  return {
    id: Number.isFinite(id) ? id : Date.now(),
    title: task.title,
    durationMinutes,
    timerType,
    category: task.category ?? "normal",
    collectionId: task.collectionId ?? null,
    status: task.status === "doing" ? "running" : task.status,
    backgroundStyle: task.backgroundStyle || "bg-gradient-to-br from-[#fffaf0] to-[#f3e1a7]",
    includeInStats: countToStats,
    countToStats,
    sortOrder: task.sortOrder ?? 0,
    recurrence,
    targetAmount: task.targetAmount,
    targetUnit: timerType === "none" ? "次" : task.targetUnit === "次" ? "次" : task.targetUnit === "分钟" ? "分钟" : undefined,
    deadline: task.targetDeadline,
    note: task.description,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

function todoToTaskPayload(payload: Partial<TodoInput>) {
  const habitFrequency =
    payload.recurrence === "每周" ? "weekly" : payload.recurrence === "每月" ? "monthly" : payload.recurrence === "每天" ? "daily" : undefined;
  return {
    title: payload.title,
    description: payload.note,
    collectionId: payload.collectionId,
    clearCollection: payload.clearCollection,
    durationMinutes: payload.durationMinutes,
    timerType: payload.timerType,
    category: payload.category,
    backgroundStyle: payload.backgroundStyle,
    countToStats: payload.countToStats ?? payload.includeInStats,
    habitFrequency,
    targetAmount: payload.targetAmount,
    targetUnit: payload.targetUnit,
    targetDeadline: payload.deadline || undefined,
    priority: "medium",
    sortOrder: payload.sortOrder
  };
}

export const todosApi = {
  list: () =>
    (shouldUsePreviewApi() ? mockClient.getTodos() : http.get<never, Task[]>("/tasks").then((tasks) => tasks.map(taskToTodo))).then((todos) =>
      [...todos].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || b.createdAt.localeCompare(a.createdAt))
    ),
  get: (id: number) => (shouldUsePreviewApi() ? mockClient.getTodo(id) : http.get<never, Task>(`/tasks/${id}`).then(taskToTodo)),
  create: (payload: TodoInput) =>
    shouldUsePreviewApi()
      ? mockClient.createTodo(payload)
      : http.post<never, Task>("/tasks", todoToTaskPayload(payload)).then(taskToTodo),
  update: (id: number, payload: Partial<TodoInput>) =>
    shouldUsePreviewApi()
      ? mockClient.updateTodo(id, payload)
      : http.put<never, Task>(`/tasks/${id}`, todoToTaskPayload(payload)).then(taskToTodo),
  updateStatus: (id: number, status: TodoStatus) =>
    shouldUsePreviewApi() ? mockClient.updateTodoStatus(id, status) : http.patch<never, Task>(`/tasks/${id}/status`, { status }).then(taskToTodo),
  updateSort: (id: number, sortOrder: number) =>
    shouldUsePreviewApi() ? mockClient.updateTodoSort(id, sortOrder) : http.patch<never, Task>(`/tasks/${id}/sort`, { sortOrder }).then(taskToTodo),
  remove: (id: number) => (shouldUsePreviewApi() ? mockClient.deleteTodo(id) : http.delete<never, void>(`/tasks/${id}`))
};
