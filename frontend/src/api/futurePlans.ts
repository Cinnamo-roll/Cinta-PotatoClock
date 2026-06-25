import { http, useMockApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { FuturePlan, FuturePlanInput } from "@/types/futurePlan";

export const futurePlansApi = {
  list: () => (useMockApi ? mockClient.getFuturePlans() : http.get<never, FuturePlan[]>("/future-plans")),
  create: (payload: FuturePlanInput) =>
    useMockApi ? mockClient.createFuturePlan(payload) : http.post<never, FuturePlan>("/future-plans", payload),
  update: (id: string | number, payload: Partial<FuturePlanInput>) =>
    useMockApi ? mockClient.updateFuturePlan(id, payload) : http.put<never, FuturePlan>(`/future-plans/${id}`, payload),
  remove: (id: string | number) => (useMockApi ? mockClient.deleteFuturePlan(id) : http.delete<never, void>(`/future-plans/${id}`))
};
