import { http, shouldUsePreviewApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { FuturePlan, FuturePlanInput } from "@/types/futurePlan";

export const futurePlansApi = {
  list: () => (shouldUsePreviewApi() ? mockClient.getFuturePlans() : http.get<never, FuturePlan[]>("/future-plans")),
  create: (payload: FuturePlanInput) =>
    shouldUsePreviewApi() ? mockClient.createFuturePlan(payload) : http.post<never, FuturePlan>("/future-plans", payload),
  update: (id: string | number, payload: Partial<FuturePlanInput>) =>
    shouldUsePreviewApi() ? mockClient.updateFuturePlan(id, payload) : http.put<never, FuturePlan>(`/future-plans/${id}`, payload),
  remove: (id: string | number) => (shouldUsePreviewApi() ? mockClient.deleteFuturePlan(id) : http.delete<never, void>(`/future-plans/${id}`))
};
