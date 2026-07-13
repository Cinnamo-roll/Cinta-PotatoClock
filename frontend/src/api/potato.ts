import { http, shouldUsePreviewApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { PotatoSession } from "@/types/timer";
import type { TimerSessionInput } from "@/types/session";

export const potatoApi = {
  createSession: (payload: Omit<PotatoSession, "id">) =>
    shouldUsePreviewApi() ? mockClient.createSession(payload) : http.post<never, PotatoSession>("/potato/sessions", payload),
  listSessions: () => (shouldUsePreviewApi() ? mockClient.getStats().then((stats) => stats.recentSessions) : http.get<never, PotatoSession[]>("/potato/sessions")),
  todaySessions: () => (shouldUsePreviewApi() ? mockClient.getStats().then((stats) => stats.recentSessions) : http.get<never, PotatoSession[]>("/potato/sessions/today")),
  recentSessions: () => (shouldUsePreviewApi() ? mockClient.getStats().then((stats) => stats.recentSessions) : http.get<never, PotatoSession[]>("/potato/sessions/recent"))
};

export const sessionsCompatApi = {
  create: (payload: TimerSessionInput) =>
    shouldUsePreviewApi() ? mockClient.createTimerSession(payload) : http.post<never, PotatoSession>("/potato/sessions", payload)
};
