import { http, useMockApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { TimerSession, TimerSessionInput } from "@/types/session";

interface PageResponse<T> {
  content: T[];
}

function pageContent<T>(value: T[] | PageResponse<T>) {
  return Array.isArray(value) ? value : value.content;
}

export interface TimerSessionUpdateInput {
  actualMinutes?: number;
  startedAt?: string;
  endedAt?: string;
  note?: string;
}

export const sessionsApi = {
  create: (payload: TimerSessionInput) =>
    useMockApi ? mockClient.createTimerSession(payload) : http.post<never, TimerSession>("/potato/sessions", payload),
  list: () => (useMockApi ? mockClient.getTimerSessions() : http.get<never, TimerSession[]>("/potato/sessions")),
  recent: () => (useMockApi ? mockClient.getTimerSessions() : http.get<never, TimerSession[]>("/potato/sessions/recent")),
  month: (month: string, options: { todoId?: number | null; collectionId?: number | null } = {}) => {
    const params = new URLSearchParams({ month, page: "0", size: "500" });
    if (options.todoId != null) params.set("taskId", String(options.todoId));
    if (options.collectionId != null) params.set("collectionId", String(options.collectionId));
    return useMockApi
      ? mockClient.getTimerSessions({ month, todoId: options.todoId, collectionId: options.collectionId })
      : http.get<never, TimerSession[] | PageResponse<TimerSession>>(`/potato/sessions?${params.toString()}`).then(pageContent);
  },
  range: (startDate: string, endDate: string, options: { todoId?: number | null; collectionId?: number | null } = {}) => {
    const params = new URLSearchParams({ startDate, endDate, page: "0", size: "500" });
    if (options.todoId != null) params.set("taskId", String(options.todoId));
    if (options.collectionId != null) params.set("collectionId", String(options.collectionId));
    return useMockApi
      ? mockClient.getTimerSessions({ startDate, endDate, todoId: options.todoId, collectionId: options.collectionId })
      : http.get<never, TimerSession[] | PageResponse<TimerSession>>(`/potato/sessions?${params.toString()}`).then(pageContent);
  },
  update: (id: number, payload: TimerSessionUpdateInput) =>
    useMockApi ? mockClient.updateTimerSession(id, payload) : http.patch<typeof payload, TimerSession>(`/potato/sessions/${id}`, payload),
  remove: (id: number) => (useMockApi ? mockClient.deleteTimerSession(id) : http.delete<never, void>(`/potato/sessions/${id}`))
};
