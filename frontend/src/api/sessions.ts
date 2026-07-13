import { http, shouldUsePreviewApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { TimerSession, TimerSessionInput } from "@/types/session";

interface PageResponse<T> {
  content: T[];
  totalPages?: number;
}

async function allPages(params: URLSearchParams) {
  const items: TimerSession[] = [];
  let page = 0;
  let totalPages = 1;
  do {
    params.set("page", String(page));
    const response = await http.get<never, TimerSession[] | PageResponse<TimerSession>>(`/potato/sessions?${params.toString()}`);
    if (Array.isArray(response)) return response;
    items.push(...response.content);
    totalPages = Math.max(1, response.totalPages ?? 1);
    page += 1;
  } while (page < totalPages);
  return items;
}

export interface TimerSessionUpdateInput {
  actualMinutes?: number;
  startedAt?: string;
  endedAt?: string;
  note?: string;
}

export const sessionsApi = {
  create: (payload: TimerSessionInput) =>
    shouldUsePreviewApi() ? mockClient.createTimerSession(payload) : http.post<never, TimerSession>("/potato/sessions", payload),
  list: () => (shouldUsePreviewApi() ? mockClient.getTimerSessions() : http.get<never, TimerSession[]>("/potato/sessions")),
  recent: () => (shouldUsePreviewApi() ? mockClient.getTimerSessions() : http.get<never, TimerSession[]>("/potato/sessions/recent")),
  month: (month: string, options: { todoId?: number | null; collectionId?: number | null } = {}) => {
    const params = new URLSearchParams({ month, page: "0", size: "500" });
    if (options.todoId != null) params.set("taskId", String(options.todoId));
    if (options.collectionId != null) params.set("collectionId", String(options.collectionId));
    return shouldUsePreviewApi()
      ? mockClient.getTimerSessions({ month, todoId: options.todoId, collectionId: options.collectionId })
      : allPages(params);
  },
  range: (startDate: string, endDate: string, options: { todoId?: number | null; collectionId?: number | null } = {}) => {
    const params = new URLSearchParams({ startDate, endDate, page: "0", size: "500" });
    if (options.todoId != null) params.set("taskId", String(options.todoId));
    if (options.collectionId != null) params.set("collectionId", String(options.collectionId));
    return shouldUsePreviewApi()
      ? mockClient.getTimerSessions({ startDate, endDate, todoId: options.todoId, collectionId: options.collectionId })
      : allPages(params);
  },
  update: (id: number, payload: TimerSessionUpdateInput) =>
    shouldUsePreviewApi() ? mockClient.updateTimerSession(id, payload) : http.patch<typeof payload, TimerSession>(`/potato/sessions/${id}`, payload),
  remove: (id: number) => (shouldUsePreviewApi() ? mockClient.deleteTimerSession(id) : http.delete<never, void>(`/potato/sessions/${id}`))
};
