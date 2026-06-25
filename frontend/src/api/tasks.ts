import { http, useMockApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { Task, TaskInput, TaskStatus } from "@/types/task";

export const tasksApi = {
  list: () => (useMockApi ? mockClient.getTasks() : http.get<never, Task[]>("/tasks")),
  create: (payload: TaskInput) => (useMockApi ? mockClient.createTask(payload) : http.post<never, Task>("/tasks", payload)),
  update: (id: string, payload: Partial<TaskInput>) =>
    useMockApi ? mockClient.updateTask(id, payload) : http.put<never, Task>(`/tasks/${id}`, payload),
  updateStatus: (id: string, status: TaskStatus) =>
    useMockApi
      ? mockClient.updateTaskStatus(id, status)
      : http.patch<never, Task>(`/tasks/${id}/status`, { status }),
  select: (id: string) => (useMockApi ? mockClient.selectTask(id) : http.patch<never, Task>(`/tasks/${id}/select`)),
  remove: (id: string) => (useMockApi ? mockClient.deleteTask(id) : http.delete<never, void>(`/tasks/${id}`))
};
