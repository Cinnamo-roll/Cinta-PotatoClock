import { http, useMockApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { CheckinPayload } from "@/services/checkinService";
import type {
  CalendarStatsItem,
  CheckinRecordItem,
  CheckinDistributionItem,
  CheckinLineItem,
  DistributionItem,
  FocusDurationDistributionItem,
  InterruptionReasonItem,
  MonthCheckinItem,
  MonthlyStats,
  PeriodDistributionItem,
  RecentSession,
  StatsBundle,
  StatsDateRange,
  StatsRange,
  StatsSummary,
  TaskStatsItem,
  TodayStats,
  WeeklySummary,
  YearStats,
  StatsQueryOptions
} from "@/types/stats";

export interface CheckinUpdateInput {
  checkinTime?: string;
  note?: string;
}

function rangeParams(range: StatsRange = "day", dateRange?: StatsDateRange) {
  const params = new URLSearchParams({ range });
  if (dateRange?.startDate) params.set("startDate", dateRange.startDate);
  if (dateRange?.endDate) params.set("endDate", dateRange.endDate);
  if (range === "day" && dateRange?.startDate) params.set("date", dateRange.startDate);
  if (range === "month" && dateRange?.startDate) params.set("month", dateRange.startDate.slice(0, 7));
  return params.toString();
}

function scopedParams(query: string, collectionId?: number | null, todoId?: number | null) {
  const params = new URLSearchParams(query);
  if (collectionId != null) params.set("collectionId", String(collectionId));
  if (todoId != null) params.set("taskId", String(todoId));
  return params.toString();
}

function queryPath(path: string, query: string) {
  return query ? `${path}?${query}` : path;
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function currentWeekRange(): StatsDateRange {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10)
  };
}

interface PageResponse<T> {
  content: T[];
}

function pageContent<T>(value: T[] | PageResponse<T>) {
  return Array.isArray(value) ? value : value.content;
}

function completedSessions(sessions: RecentSession[]) {
  return sessions.filter((session) => session.completed && !session.interrupted);
}

function sessionSeconds(session: RecentSession) {
  return session.actualSeconds ?? session.actualMinutes * 60;
}

function completionRate(completed: number, abandoned: number) {
  const total = completed + abandoned;
  return total ? Math.round((completed * 10000) / total) / 100 : 0;
}

function activeDays(sessions: RecentSession[]) {
  return new Set(sessions.map((session) => session.startedAt.slice(0, 10))).size;
}

function inRange(session: RecentSession, startDate?: string, endDate?: string) {
  const date = session.startedAt.slice(0, 10);
  return (!startDate || date >= startDate) && (!endDate || date <= endDate);
}

function todoScopedBundle(base: StatsBundle, sessions: RecentSession[], dateRange: StatsDateRange | undefined, month: string, year: number): StatsBundle {
  const sorted = [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const completed = completedSessions(sorted);
  const abandoned = sorted.filter((session) => session.interrupted);
  const totalSeconds = completed.reduce((sum, session) => sum + sessionSeconds(session), 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySessions = sorted.filter((session) => session.startedAt.startsWith(todayKey));
  const todayCompleted = completedSessions(todaySessions);
  const todaySeconds = todayCompleted.reduce((sum, session) => sum + sessionSeconds(session), 0);
  const rangeSessions = sorted.filter((session) => inRange(session, dateRange?.startDate, dateRange?.endDate));
  const rangeCompleted = completedSessions(rangeSessions);
  const rangeSeconds = rangeCompleted.reduce((sum, session) => sum + sessionSeconds(session), 0);
  const monthSessions = sorted.filter((session) => session.startedAt.startsWith(month));
  const monthCompleted = completedSessions(monthSessions);
  const monthAbandoned = monthSessions.filter((session) => session.interrupted);
  const monthSeconds = monthCompleted.reduce((sum, session) => sum + sessionSeconds(session), 0);
  const label = sorted.find((session) => session.taskTitle)?.taskTitle ?? "当前待办";
  const yearlySessions = sorted.filter((session) => session.startedAt.startsWith(String(year)));
  const yearlyCompleted = completedSessions(yearlySessions);
  const yearlyAbandoned = yearlySessions.filter((session) => session.interrupted);
  const yearlySeconds = yearlyCompleted.reduce((sum, session) => sum + sessionSeconds(session), 0);
  const monthlyTrend = Array.from({ length: 12 }, (_, index) => {
    const monthKey = `${year}-${String(index + 1).padStart(2, "0")}`;
    const items = yearlyCompleted.filter((session) => session.startedAt.startsWith(monthKey));
    const seconds = items.reduce((sum, session) => sum + sessionSeconds(session), 0);
    return {
      month: monthKey,
      label: `${index + 1}月`,
      focusMinutes: Math.floor(seconds / 60),
      focusSeconds: seconds,
      focusCount: items.length,
      abandonedCount: yearlyAbandoned.filter((session) => session.startedAt.startsWith(monthKey)).length
    };
  });

  const interruptionGroups = monthAbandoned.reduce<Record<string, number>>((acc, session) => {
    const reason = session.interruptReason || "其他";
    acc[reason] = (acc[reason] ?? 0) + 1;
    return acc;
  }, {});

  return {
    ...base,
    today: {
      todayFocusCount: todayCompleted.length,
      todayFocusMinutes: Math.floor(todaySeconds / 60),
      todayFocusSeconds: todaySeconds,
      todayAbandonedCount: todaySessions.filter((session) => session.interrupted).length
    },
    summary: {
      totalFocusCount: completed.length,
      totalFocusMinutes: Math.floor(totalSeconds / 60),
      totalFocusSeconds: totalSeconds,
      averageDailyFocusMinutes: activeDays(completed) ? Math.floor(totalSeconds / 60 / activeDays(completed)) : 0,
      averageDailyFocusSeconds: activeDays(completed) ? Math.floor(totalSeconds / activeDays(completed)) : 0,
      totalAbandonedCount: abandoned.length
    },
    focusDurationDistribution: rangeSeconds
      ? [
          {
            key: String(sorted[0]?.todoId ?? sorted[0]?.taskId ?? "todo"),
            label,
            focusCount: rangeCompleted.length,
            focusMinutes: Math.floor(rangeSeconds / 60),
            focusSeconds: rangeSeconds,
            abandonedCount: rangeSessions.filter((session) => session.interrupted).length,
            percent: 100
          }
        ]
      : [],
    recentSessions: sorted.slice(0, 20),
    historySessions: rangeSessions,
    taskRanking: rangeSeconds
      ? [
          {
            taskId: sorted[0]?.taskId ?? sorted[0]?.todoId ?? 0,
            todoId: sorted[0]?.todoId ?? sorted[0]?.taskId ?? 0,
            taskTitle: label,
            focusCount: rangeCompleted.length,
            focusMinutes: Math.floor(rangeSeconds / 60),
            focusSeconds: rangeSeconds,
            abandonedCount: rangeSessions.filter((session) => session.interrupted).length
          }
        ]
      : [],
    monthly: {
      month,
      focusCount: monthCompleted.length,
      focusMinutes: Math.floor(monthSeconds / 60),
      focusSeconds: monthSeconds,
      abandonedCount: monthAbandoned.length,
      completionRate: completionRate(monthCompleted.length, monthAbandoned.length),
      activeDays: activeDays(monthCompleted)
    },
    interruptionReasons: Object.entries(interruptionGroups).map(([reason, count]) => ({
      reason,
      reasonText: reason,
      count,
      percent: completionRate(count, monthAbandoned.length - count)
    })),
    yearly: {
      year,
      focusCount: yearlyCompleted.length,
      focusMinutes: Math.floor(yearlySeconds / 60),
      focusSeconds: yearlySeconds,
      abandonedCount: yearlyAbandoned.length,
      activeDays: activeDays(yearlyCompleted),
      longestStreakDays: base.yearly.longestStreakDays,
      completionRate: completionRate(yearlyCompleted.length, yearlyAbandoned.length),
      monthlyTrend
    }
  };
}

async function requestStatsBundle(range: StatsRange = "day", dateRange?: StatsDateRange, options: StatsQueryOptions = {}): Promise<StatsBundle> {
  const month = options.month ?? dateRange?.startDate?.slice(0, 7) ?? currentMonth();
  const year = options.year ?? Number(month.slice(0, 4));
  const weekRange = range === "custom" && dateRange?.startDate ? dateRange : currentWeekRange();
  const query = scopedParams(rangeParams(range, dateRange), options.collectionId, options.todoId);
  const monthQuery = scopedParams(`month=${month}`, options.collectionId, options.todoId);
  const yearQuery = scopedParams(`year=${year}`, options.collectionId, options.todoId);
  const taskParams = new URLSearchParams();
  if (dateRange?.startDate) taskParams.set("startDate", dateRange.startDate);
  if (dateRange?.endDate) taskParams.set("endDate", dateRange.endDate);
  const taskQuery = scopedParams(taskParams.toString(), options.collectionId, options.todoId);
  const collectionQuery = options.collectionId != null ? `&collectionId=${options.collectionId}` : "";
  const todoQuery = options.todoId != null ? `taskId=${options.todoId}&page=0&size=500` : "";
  const weekQuery = new URLSearchParams();
  if (weekRange.startDate) weekQuery.set("startDate", weekRange.startDate);
  if (weekRange.endDate) weekQuery.set("endDate", weekRange.endDate);
  if (options.collectionId != null) weekQuery.set("collectionId", String(options.collectionId));
  if (options.todoId != null) weekQuery.set("taskId", String(options.todoId));

  const [
    today,
    summary,
    focusDurationDistribution,
    distribution,
    periodDistribution,
    calendar,
    monthly,
    recentSessions,
    historyPage,
    taskRanking,
    interruptionReasons,
    weeklySummary,
    wakeupDistribution,
    sleepDistribution,
    wakeupLine,
    sleepLine,
    monthCheckins,
    yearly
  ] = await Promise.all([
    http.get<never, TodayStats>(queryPath("/stats/today", scopedParams("", options.collectionId))),
    http.get<never, StatsSummary>(queryPath("/stats/summary", scopedParams("", options.collectionId))),
    http.get<never, FocusDurationDistributionItem[]>(`/stats/distribution?${query}&groupBy=todo`),
    http.get<never, DistributionItem[]>(`/stats/distribution?${query}`),
    http.get<never, PeriodDistributionItem[]>(`/stats/period-distribution?${monthQuery}`),
    http.get<never, CalendarStatsItem[]>(`/stats/calendar?${monthQuery}`),
    http.get<never, MonthlyStats>(`/stats/month?${monthQuery}`),
    http.get<never, RecentSession[]>(`/potato/sessions/recent?limit=20${collectionQuery}`),
    http.get<never, PageResponse<RecentSession> | RecentSession[]>(`/potato/sessions?${query}&page=0&size=100`),
    http.get<never, TaskStatsItem[]>(queryPath("/stats/tasks", taskQuery)),
    http.get<never, InterruptionReasonItem[]>(`/stats/interruption-reasons?${monthQuery}`),
    http.get<never, WeeklySummary>(`/stats/week-summary?${weekQuery.toString()}`),
    http.get<never, CheckinDistributionItem[]>(`/stats/checkins/wakeup-distribution?month=${month}`),
    http.get<never, CheckinDistributionItem[]>(`/stats/checkins/sleep-distribution?month=${month}`),
    http.get<never, CheckinLineItem[]>(`/stats/checkins/wakeup-line?month=${month}`),
    http.get<never, CheckinLineItem[]>(`/stats/checkins/sleep-line?month=${month}`),
    http.get<never, MonthCheckinItem[]>(`/stats/checkins/month?month=${month}`),
    http.get<never, YearStats>(`/stats/year?${yearQuery}`)
  ]);

  const historySessions = pageContent(historyPage);
  const bundle = {
    today,
    summary,
    focusDurationDistribution,
    distribution,
    periodDistribution,
    trend: distribution,
    timePeriods: periodDistribution.map((item) => ({
      label: item.label,
      focusCount: item.focusCount,
      focusMinutes: item.focusMinutes,
      focusSeconds: item.focusSeconds
    })),
    calendar,
    monthly,
    recentSessions,
    historySessions,
    taskRanking,
    interruptionReasons,
    weeklySummary,
    wakeupDistribution,
    sleepDistribution,
    wakeupLine,
    sleepLine,
    monthCheckins,
    yearly
  };
  if (options.todoId != null) {
    const todoHistoryPage = await http.get<never, PageResponse<RecentSession> | RecentSession[]>(`/potato/sessions?${todoQuery}`);
    return todoScopedBundle(bundle, pageContent(todoHistoryPage), dateRange, month, year);
  }
  return bundle;
}

async function requestOrMock<T>(request: () => Promise<T>, fallback: () => Promise<T>) {
  if (useMockApi) return fallback();
  return request();
}

export const statsApi = {
  bundle: (range: StatsRange = "day", dateRange?: StatsDateRange, options: StatsQueryOptions = {}) =>
    requestOrMock(() => requestStatsBundle(range, dateRange, options), () => mockClient.getStats(range, dateRange, options)),
  today: () => requestOrMock(() => http.get<never, TodayStats>("/stats/today"), () => mockClient.getStats().then((stats) => stats.today)),
  summary: () => requestOrMock(() => http.get<never, StatsSummary>("/stats/summary"), () => mockClient.getStats().then((stats) => stats.summary)),
  distribution: (range: StatsRange = "day", dateRange?: StatsDateRange) =>
    requestOrMock(() => http.get<never, DistributionItem[]>(`/stats/distribution?${rangeParams(range, dateRange)}`), () => mockClient.getStats(range, dateRange).then((stats) => stats.distribution)),
  focusDurationDistribution: (range: StatsRange = "day", dateRange?: StatsDateRange) =>
    requestOrMock(() => http.get<never, FocusDurationDistributionItem[]>(`/stats/distribution?${rangeParams(range, dateRange)}&groupBy=todo`), () => mockClient.getStats(range, dateRange).then((stats) => stats.focusDurationDistribution)),
  periodDistribution: (month: string = currentMonth()) =>
    requestOrMock(() => http.get<never, PeriodDistributionItem[]>(`/stats/period-distribution?month=${month}`), () => mockClient.getStats("month", undefined, { month }).then((stats) => stats.periodDistribution)),
  trend: (range: StatsRange = "day", dateRange?: StatsDateRange) =>
    requestOrMock(() => http.get<never, DistributionItem[]>(`/stats/distribution?${rangeParams(range, dateRange)}`), () => mockClient.getStats(range, dateRange).then((stats) => stats.trend)),
  calendar: (month: string = currentMonth(), options: { collectionId?: number | null } = {}) => {
    const params = new URLSearchParams({ month });
    if (options.collectionId != null) params.set("collectionId", String(options.collectionId));
    return requestOrMock(() => http.get<never, CalendarStatsItem[]>(`/stats/calendar?${params.toString()}`), () => mockClient.getStats("month", undefined, { month, collectionId: options.collectionId }).then((stats) => stats.calendar));
  },
  weekSummary: (dateRange?: StatsDateRange, options: { collectionId?: number | null } = {}) => {
    const weekRange = dateRange ?? currentWeekRange();
    const params = new URLSearchParams();
    if (weekRange.startDate) params.set("startDate", weekRange.startDate);
    if (weekRange.endDate) params.set("endDate", weekRange.endDate);
    if (options.collectionId != null) params.set("collectionId", String(options.collectionId));
    return requestOrMock(() => http.get<never, WeeklySummary>(`/stats/week-summary?${params.toString()}`), () => mockClient.getStats("custom", weekRange, { collectionId: options.collectionId }).then((stats) => stats.weeklySummary));
  },
  interruptionReasons: (month: string = currentMonth()) =>
    requestOrMock(() => http.get<never, InterruptionReasonItem[]>(`/stats/interruption-reasons?month=${month}`), () => mockClient.getStats("month", undefined, { month }).then((stats) => stats.interruptionReasons)),
  sessions: (range: StatsRange = "custom", dateRange?: StatsDateRange) =>
    requestOrMock(() => http.get<never, PageResponse<RecentSession> | RecentSession[]>(`/potato/sessions?${rangeParams(range, dateRange)}&page=0&size=50`).then(pageContent), () => mockClient.getStats(range, dateRange).then((stats) => stats.historySessions)),
  tasks: () => requestOrMock(() => http.get<never, TaskStatsItem[]>("/stats/tasks"), () => mockClient.getStats().then((stats) => stats.taskRanking)),
  wakeupDistribution: () =>
    requestOrMock(() => http.get<never, CheckinDistributionItem[]>("/stats/checkins/wakeup-distribution"), () => mockClient.getStats("month", undefined, { month: currentMonth() }).then((stats) => stats.wakeupDistribution)),
  sleepDistribution: () =>
    requestOrMock(() => http.get<never, CheckinDistributionItem[]>("/stats/checkins/sleep-distribution"), () => mockClient.getStats("month", undefined, { month: currentMonth() }).then((stats) => stats.sleepDistribution)),
  monthCheckins: (month: string = currentMonth()) =>
    requestOrMock(() => http.get<never, MonthCheckinItem[]>(`/stats/checkins/month?month=${month}`), () => mockClient.getStats("month", undefined, { month }).then((stats) => stats.monthCheckins)),
  wakeupLine: (month: string = currentMonth()) =>
    requestOrMock(() => http.get<never, CheckinLineItem[]>(`/stats/checkins/wakeup-line?month=${month}`), () => mockClient.getStats("month", undefined, { month }).then((stats) => stats.wakeupLine)),
  sleepLine: (month: string = currentMonth()) =>
    requestOrMock(() => http.get<never, CheckinLineItem[]>(`/stats/checkins/sleep-line?month=${month}`), () => mockClient.getStats("month", undefined, { month }).then((stats) => stats.sleepLine)),
  checkins: (startDate: string, endDate: string) =>
    requestOrMock(
      () => http.get<never, { content: CheckinRecordItem[] } | CheckinRecordItem[]>(`/checkins?startDate=${startDate}&endDate=${endDate}&page=0&size=500`).then(pageContent),
      () => mockClient.getCheckins(startDate, endDate)
    ),
  updateCheckin: (id: number, payload: CheckinUpdateInput) =>
    requestOrMock(() => http.patch<typeof payload, CheckinRecordItem>(`/checkins/${id}`, payload), () => mockClient.updateCheckin(id, payload)),
  deleteCheckin: (id: number) => requestOrMock(() => http.delete<never, void>(`/checkins/${id}`), () => mockClient.deleteCheckin(id)),
  yearly: (year: string = new Date().getFullYear().toString()) =>
    requestOrMock(() => http.get<never, YearStats>(`/stats/year?year=${year}`), () => mockClient.getStats("month", undefined, { year: Number(year) }).then((stats) => stats.yearly)),
  createCheckin: (payload: CheckinPayload) =>
    requestOrMock(() => http.post<typeof payload, { ok: boolean }>("/checkins", payload), () => mockClient.createCheckin(payload))
};
