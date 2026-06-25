import { http, useMockApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { PotatoSession } from "@/types/timer";
import type { TimerSessionInput } from "@/types/session";

export const potatoApi = {
  createSession: (payload: Omit<PotatoSession, "id">) =>
    useMockApi ? mockClient.createSession(payload) : http.post<never, PotatoSession>("/potato/sessions", payload),
  listSessions: () => (useMockApi ? mockClient.getStats().then((stats) => stats.recentSessions) : http.get<never, PotatoSession[]>("/potato/sessions")),
  todaySessions: () => (useMockApi ? mockClient.getStats().then((stats) => stats.recentSessions) : http.get<never, PotatoSession[]>("/potato/sessions/today")),
  recentSessions: () => (useMockApi ? mockClient.getStats().then((stats) => stats.recentSessions) : http.get<never, PotatoSession[]>("/potato/sessions/recent"))
};

export const sessionsCompatApi = {
  create: (payload: TimerSessionInput) =>
    useMockApi ? mockClient.createTimerSession(payload) : http.post<never, PotatoSession>("/potato/sessions", payload)
};
