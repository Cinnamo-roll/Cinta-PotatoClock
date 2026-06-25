import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/api/settings";
import { statsApi } from "@/api/stats";
import type { CheckinUpdateInput } from "@/api/stats";
import { tasksApi } from "@/api/tasks";
import { potatoApi } from "@/api/potato";
import { collectionsApi } from "@/api/collections";
import { futurePlansApi } from "@/api/futurePlans";
import { sessionsApi } from "@/api/sessions";
import type { TimerSessionUpdateInput } from "@/api/sessions";
import { todosApi } from "@/api/todos";
import type { CheckinPayload } from "@/services/checkinService";
import type { TaskInput, TaskStatus } from "@/types/task";
import type { PotatoSession } from "@/types/timer";
import type { UserSettings } from "@/types/settings";
import type { TimerSessionInput } from "@/types/session";
import type { StatsDateRange, StatsQueryOptions, StatsRange } from "@/types/stats";
import type { TodoCollectionInput, TodoInput, TodoStatus } from "@/types/todo";
import type { FuturePlanInput } from "@/types/futurePlan";

export function useSettingsQuery() {
  return useQuery({ queryKey: ["settings"], queryFn: settingsApi.getSettings });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<UserSettings>) => settingsApi.updateSettings(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] })
  });
}

export function useTasksQuery() {
  return useQuery({ queryKey: ["tasks"], queryFn: tasksApi.list });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskInput) => tasksApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TaskInput> }) => tasksApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => tasksApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });
}

export function useSelectTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.select(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
  });
}

export function useStatsQuery(range: StatsRange = "day", dateRange?: StatsDateRange, options: StatsQueryOptions = {}) {
  return useQuery({
    queryKey: ["stats", range, dateRange, options],
    queryFn: () => statsApi.bundle(range, dateRange, options),
    placeholderData: keepPreviousData,
    staleTime: 20_000
  });
}

export function useCreateSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<PotatoSession, "id">) => potatoApi.createSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  });
}

export function useTodosQuery() {
  return useQuery({ queryKey: ["todos"], queryFn: todosApi.list });
}

export function useTodoQuery(id: number) {
  return useQuery({ queryKey: ["todos", id], queryFn: () => todosApi.get(id), enabled: Number.isFinite(id) });
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TodoInput) => todosApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] })
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TodoInput> }) => todosApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] })
  });
}

export function useUpdateTodoSortMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, sortOrder }: { id: number; sortOrder: number }) => todosApi.updateSort(id, sortOrder),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] })
  });
}

export function useCreateCheckinMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckinPayload) => statsApi.createCheckin(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stats"] })
  });
}

export function useUpdateTodoStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TodoStatus }) => todosApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] })
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => todosApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] })
  });
}

export function useCollectionsQuery() {
  return useQuery({ queryKey: ["collections"], queryFn: collectionsApi.list });
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TodoCollectionInput) => collectionsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] })
  });
}

export function useUpdateCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TodoCollectionInput> }) => collectionsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] })
  });
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => collectionsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections"] })
  });
}

export function useCreateTimerSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TimerSessionInput) => sessionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["timer-sessions"] });
    }
  });
}

export function useUpdateTimerSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TimerSessionUpdateInput }) => sessionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["history-records"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["timer-sessions"] });
    }
  });
}

export function useDeleteTimerSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sessionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["history-records"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["timer-sessions"] });
    }
  });
}

export function useTimerSessionsRangeQuery(startDate: string, endDate: string, options: { todoId?: number | null; collectionId?: number | null } = {}, enabled = true) {
  return useQuery({
    queryKey: ["timer-sessions", startDate, endDate, options],
    queryFn: () => sessionsApi.range(startDate, endDate, options),
    enabled,
    staleTime: 15_000
  });
}

export function useDeleteCheckinMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => statsApi.deleteCheckin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["history-records"] });
    }
  });
}

export function useFuturePlansQuery() {
  return useQuery({ queryKey: ["future-plans"], queryFn: futurePlansApi.list });
}

export function useCreateFuturePlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FuturePlanInput) => futurePlansApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["future-plans"] })
  });
}

export function useUpdateFuturePlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string | number; payload: Partial<FuturePlanInput> }) => futurePlansApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["future-plans"] })
  });
}

export function useDeleteFuturePlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => futurePlansApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["future-plans"] })
  });
}

export function useUpdateCheckinMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CheckinUpdateInput }) => statsApi.updateCheckin(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["history-records"] });
    }
  });
}
