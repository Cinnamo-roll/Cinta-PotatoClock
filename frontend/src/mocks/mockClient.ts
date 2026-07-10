import {
  defaultSettings,
  initialCheckins,
  initialCollections,
  initialFuturePlans,
  initialSessions,
  initialTasks,
  initialTimerSessions,
  initialTodos,
  mockUser
} from "./mockData";
import { statsMock } from "./statsMock";
import { checkinBusinessDate, checkinLabel, checkinWindowError, type CheckinPayload } from "@/services/checkinService";
import type { LoginRequest, LoginResponse, RegisterRequest, User } from "@/types/auth";
import type { Task, TaskInput, TaskStatus } from "@/types/task";
import type { UserSettings } from "@/types/settings";
import type { PotatoSession } from "@/types/timer";
import type {
  CalendarStatsItem,
  CheckinRecordItem,
  DistributionItem,
  FocusDurationDistributionItem,
  InterruptionReasonItem,
  MonthCheckinItem,
  PeriodDistributionItem,
  RecentSession,
  StatsBundle,
  StatsDateRange,
  StatsQueryOptions,
  StatsRange,
  TaskStatsItem,
  WeeklySummary,
  YearStats
} from "@/types/stats";
import type { TimerSession, TimerSessionInput } from "@/types/session";
import type { FuturePlan, FuturePlanInput } from "@/types/futurePlan";
import type { TodoCollection, TodoCollectionInput, TodoInput, TodoItem, TodoStatus } from "@/types/todo";
import { isTodoCompleted } from "@/utils/todoMetrics";

const STORAGE_KEY = "potato-clock-mock";
const MOCK_DATA_VERSION = 4;

type MockCheckinType = "wakeup" | "focus_today" | "sleep";

interface MockCheckin {
  id: number;
  type: MockCheckinType;
  checkedAt: string;
  note?: string | null;
}

interface MockState {
  mockDataVersion?: number;
  user: User;
  tasks: Task[];
  settings: UserSettings;
  sessions: PotatoSession[];
  todos: TodoItem[];
  collections: TodoCollection[];
  futurePlans: FuturePlan[];
  timerSessions: TimerSession[];
  checkins: MockCheckin[];
}

function mergeById<T extends { id: number | string }>(current: T[] | undefined, seed: T[]) {
  const existing = current ?? [];
  const ids = new Set(existing.map((item) => item.id));
  return [...existing, ...seed.filter((item) => !ids.has(item.id))];
}

function normalizeState(state: MockState): MockState {
  if (state.mockDataVersion === MOCK_DATA_VERSION) return state;
  const todos = mergeById(state.todos, initialTodos)
    .map((todo) =>
      todo.timerType === "none" && (todo.targetUnit !== "次" || todo.targetAmount == null)
        ? {
            ...todo,
            durationMinutes: 0,
            targetUnit: todo.category === "normal" ? undefined : ("次" as const),
            targetAmount: todo.category === "normal" ? undefined : 1,
            countToStats: todo.countToStats ?? todo.includeInStats
          }
        : { ...todo, countToStats: todo.countToStats ?? todo.includeInStats }
    )
    .sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id));
  return {
    ...state,
    mockDataVersion: MOCK_DATA_VERSION,
    todos,
    collections: mergeById(state.collections, initialCollections),
    futurePlans: mergeById(state.futurePlans, initialFuturePlans).sort((a, b) => a.targetDate.localeCompare(b.targetDate)),
    timerSessions: mergeById(state.timerSessions, initialTimerSessions).sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    checkins: mergeById(state.checkins, initialCheckins).sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
  };
}

function loadState(): MockState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw) as Partial<MockState>;
    const state = normalizeState({
      mockDataVersion: parsed.mockDataVersion,
      user: parsed.user ?? mockUser,
      tasks: parsed.tasks ?? initialTasks,
      settings: parsed.settings ?? defaultSettings,
      sessions: parsed.sessions ?? initialSessions,
      todos: parsed.todos ?? initialTodos,
      collections: parsed.collections ?? initialCollections,
      futurePlans: parsed.futurePlans ?? initialFuturePlans,
      timerSessions: parsed.timerSessions ?? initialTimerSessions,
      checkins: parsed.checkins ?? initialCheckins
    });
    saveState(state);
    return state;
  }
  return {
    mockDataVersion: MOCK_DATA_VERSION,
    user: mockUser,
    tasks: initialTasks,
    settings: defaultSettings,
    sessions: initialSessions,
    todos: initialTodos,
    collections: initialCollections,
    futurePlans: initialFuturePlans,
    timerSessions: initialTimerSessions,
    checkins: initialCheckins
  };
}

function saveState(state: MockState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function delay<T>(value: T, ms = 260): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
}

function isSameDate(value: string, date: Date) {
  return new Date(value).toDateString() === date.toDateString();
}

function toDateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function toMonthKey(value: Date) {
  return toDateKey(value).slice(0, 7);
}

function toTimeText(value: Date) {
  return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

function minutesOfDay(value: Date, type: MockCheckinType) {
  let minutes = value.getHours() * 60 + value.getMinutes();
  if (type === "sleep" && value.getHours() < 12) minutes += 24 * 60;
  return minutes;
}

function monthDays(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex, 0).getDate();
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString("zh-CN", { weekday: "short" });
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function startOfMonth(month: string) {
  return parseDateKey(`${month}-01`);
}

function endOfMonth(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex, 0);
}

function dateRangeKeys(start: Date, end: Date) {
  return { startKey: toDateKey(start), endKey: toDateKey(end) };
}

function inDateRange(value: string, start: Date, end: Date) {
  const key = toDateKey(new Date(value));
  const { startKey, endKey } = dateRangeKeys(start, end);
  return key >= startKey && key <= endKey;
}

function eachDate(start: Date, end: Date) {
  const result: Date[] = [];
  for (let date = new Date(start); toDateKey(date) <= toDateKey(end); date = addDays(date, 1)) {
    result.push(new Date(date));
  }
  return result;
}

function resolveStatsRange(range: StatsRange = "day", dateRange?: StatsDateRange, options: StatsQueryOptions = {}) {
  const now = new Date();
  if (range === "month") {
    const month = options.month ?? dateRange?.startDate?.slice(0, 7) ?? toMonthKey(now);
    return { start: startOfMonth(month), end: endOfMonth(month), month };
  }
  if (range === "week") {
    const end = dateRange?.endDate ? parseDateKey(dateRange.endDate) : now;
    const start = dateRange?.startDate ? parseDateKey(dateRange.startDate) : addDays(end, -6);
    return { start, end, month: toMonthKey(end) };
  }
  if (range === "custom") {
    const end = dateRange?.endDate ? parseDateKey(dateRange.endDate) : now;
    const start = dateRange?.startDate ? parseDateKey(dateRange.startDate) : end;
    return { start, end, month: toMonthKey(end) };
  }
  const day = dateRange?.startDate ? parseDateKey(dateRange.startDate) : now;
  return { start: day, end: day, month: toMonthKey(day) };
}

function focusCompleted(sessions: TimerSession[]) {
  return sessions.filter((session) => session.completed && !session.interrupted && session.countToStats !== false);
}

function sessionFocusSeconds(session: TimerSession) {
  return session.actualSeconds ?? session.actualMinutes * 60;
}

function focusSeconds(sessions: TimerSession[]) {
  return sessions.reduce((sum, session) => sum + sessionFocusSeconds(session), 0);
}

function completionRate(completed: number, interrupted: number) {
  const total = completed + interrupted;
  return total ? Math.round((completed / total) * 100) : 0;
}

function toRecentSession(session: TimerSession): RecentSession {
  return {
    id: session.id,
    taskId: session.taskId,
    todoId: session.taskId,
    taskTitle: session.taskTitle,
    collectionId: session.collectionId ?? null,
    timerType: session.timerType,
    actualMinutes: session.actualMinutes,
    actualSeconds: sessionFocusSeconds(session),
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    completed: session.completed,
    interrupted: session.interrupted,
    interruptReason: session.interruptReason ?? null,
    countToStats: session.countToStats
  };
}

function buildCheckinLine(checkins: MockCheckin[], type: MockCheckinType, month: string) {
  return checkins
    .filter((item) => item.type === type && checkinBusinessDate(item.type, new Date(item.checkedAt)).startsWith(month))
    .map((item) => {
      const date = new Date(item.checkedAt);
      return {
        date: checkinBusinessDate(item.type, date),
        time: toTimeText(date),
        minutesOfDay: minutesOfDay(date, type)
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function buildCheckinDistribution(checkins: MockCheckin[], type: MockCheckinType, month: string) {
  const byHour = new Map<string, number>();
  checkins
    .filter((item) => item.type === type && checkinBusinessDate(item.type, new Date(item.checkedAt)).startsWith(month))
    .forEach((item) => {
      const date = new Date(item.checkedAt);
      const label = `${String(date.getHours()).padStart(2, "0")}:00`;
      byHour.set(label, (byHour.get(label) ?? 0) + 1);
    });
  return Array.from(byHour.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildMonthCheckins(checkins: MockCheckin[], month: string): MonthCheckinItem[] {
  const wakeupDays = new Set(checkins.filter((item) => item.type === "wakeup").map((item) => checkinBusinessDate(item.type, new Date(item.checkedAt))).filter((date) => date.startsWith(month)));
  const sleepDays = new Set(checkins.filter((item) => item.type === "sleep").map((item) => checkinBusinessDate(item.type, new Date(item.checkedAt))).filter((date) => date.startsWith(month)));
  return Array.from({ length: monthDays(month) }, (_, index) => {
    const date = `${month}-${String(index + 1).padStart(2, "0")}`;
    return {
      date,
      wakeupChecked: wakeupDays.has(date),
      sleepChecked: sleepDays.has(date)
    };
  });
}

function buildInterruptionReasons(sessions: TimerSession[]): InterruptionReasonItem[] {
  const interrupted = sessions.filter((session) => session.interrupted);
  if (!interrupted.length) return [];
  const reasonMap = new Map<string, number>();
  interrupted.forEach((session) => {
    const reason = session.interruptReason || "其他";
    reasonMap.set(reason, (reasonMap.get(reason) ?? 0) + 1);
  });
  return Array.from(reasonMap.entries())
    .map(([reason, count]) => ({
      reason,
      count,
      percent: Math.round((count / interrupted.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

function buildTaskStats(sessions: TimerSession[], limit = 5): TaskStatsItem[] {
  const taskMap = new Map<number, TaskStatsItem>();
  sessions.forEach((session) => {
    const current =
      taskMap.get(session.taskId) ??
      {
        taskId: session.taskId,
        todoId: session.taskId,
        taskTitle: session.taskTitle,
        focusCount: 0,
        focusMinutes: 0,
        focusSeconds: 0,
        abandonedCount: 0
    };
    if (session.completed && !session.interrupted) {
      current.focusCount += 1;
      current.focusMinutes += session.actualMinutes;
      current.focusSeconds = (current.focusSeconds ?? 0) + sessionFocusSeconds(session);
    }
    if (session.interrupted) current.abandonedCount += 1;
    taskMap.set(session.taskId, current);
  });
  return Array.from(taskMap.values())
    .sort((a, b) => (b.focusSeconds ?? 0) - (a.focusSeconds ?? 0))
    .slice(0, limit);
}

function buildFocusDurationDistribution(sessions: TimerSession[]): FocusDurationDistributionItem[] {
  const items = buildTaskStats(sessions, 100).filter((item) => item.focusMinutes > 0);
  const totalSeconds = items.reduce((sum, item) => sum + (item.focusSeconds ?? item.focusMinutes * 60), 0);
  return items.map((item) => {
    const seconds = item.focusSeconds ?? item.focusMinutes * 60;
    return {
      key: String(item.taskId),
      label: item.taskTitle,
      focusCount: item.focusCount,
      focusMinutes: item.focusMinutes,
      focusSeconds: seconds,
      abandonedCount: item.abandonedCount,
      percent: totalSeconds ? Math.round((seconds / totalSeconds) * 100) : 0
    };
  });
}

function dailyDistribution(sessions: TimerSession[], start: Date, end: Date, labelForDate: (date: Date) => string): DistributionItem[] {
  return eachDate(start, end).map((date) => {
    const daySessions = sessions.filter((session) => inDateRange(session.startedAt, date, date));
    const completed = focusCompleted(daySessions);
    const minutes = completed.reduce((sum, session) => sum + session.actualMinutes, 0);
    const seconds = focusSeconds(completed);
    return {
      label: labelForDate(date),
      focusCount: completed.length,
      focusMinutes: minutes,
      focusSeconds: seconds,
      abandonedCount: daySessions.filter((session) => session.interrupted).length
    };
  });
}

function buildDistribution(range: StatsRange, sessions: TimerSession[], start: Date, end: Date): DistributionItem[] {
  if (range === "day") {
    return Array.from({ length: 24 }, (_, hour) => {
      const hourSessions = sessions.filter((session) => new Date(session.startedAt).getHours() === hour);
      const completed = focusCompleted(hourSessions);
      const minutes = completed.reduce((sum, session) => sum + session.actualMinutes, 0);
      const seconds = focusSeconds(completed);
      return {
        label: `${String(hour).padStart(2, "0")}:00`,
        focusCount: completed.length,
        focusMinutes: minutes,
        focusSeconds: seconds,
        abandonedCount: hourSessions.filter((session) => session.interrupted).length
      };
    });
  }
  if (range === "month") {
    return dailyDistribution(sessions, start, end, (date) => String(date.getDate()).padStart(2, "0"));
  }
  return dailyDistribution(sessions, start, end, (date) => (toDateKey(date) === toDateKey(new Date()) ? "\u4eca\u5929" : formatWeekday(date)));
}

function buildPeriodDistribution(sessions: TimerSession[]): PeriodDistributionItem[] {
  return Array.from({ length: 24 }, (_, hour) => {
    const hourSessions = sessions.filter((session) => new Date(session.startedAt).getHours() === hour);
    const completed = focusCompleted(hourSessions);
    const minutes = completed.reduce((sum, session) => sum + session.actualMinutes, 0);
    const seconds = focusSeconds(completed);
    return {
      label: `${String(hour).padStart(2, "0")}:00`,
      hour,
      focusCount: completed.length,
      focusMinutes: minutes,
      focusSeconds: seconds
    };
  });
}

function buildCalendar(sessions: TimerSession[], month: string): CalendarStatsItem[] {
  return eachDate(startOfMonth(month), endOfMonth(month)).map((date) => {
    const daySessions = sessions.filter((session) => inDateRange(session.startedAt, date, date));
    const completed = focusCompleted(daySessions);
    const minutes = completed.reduce((sum, session) => sum + session.actualMinutes, 0);
    const seconds = focusSeconds(completed);
    return {
      date: toDateKey(date),
      focusCount: completed.length,
      focusMinutes: minutes,
      focusSeconds: seconds,
      abandonedCount: daySessions.filter((session) => session.interrupted).length
    };
  });
}

function longestStreakDays(sessions: TimerSession[], start: Date, end: Date) {
  const activeDays = new Set(focusCompleted(sessions).map((session) => toDateKey(new Date(session.startedAt))));
  let current = 0;
  let longest = 0;
  eachDate(start, end).forEach((date) => {
    if (activeDays.has(toDateKey(date))) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });
  return longest;
}

function buildYearStats(sessions: TimerSession[], year: number): YearStats {
  const start = parseDateKey(`${year}-01-01`);
  const end = parseDateKey(`${year}-12-31`);
  const yearSessions = sessions.filter((session) => inDateRange(session.startedAt, start, end));
  const completed = focusCompleted(yearSessions);
  const interrupted = yearSessions.filter((session) => session.interrupted);
  const activeDays = new Set(completed.map((session) => toDateKey(new Date(session.startedAt)))).size;
  const monthlyTrend = Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    const monthSessions = sessions.filter((session) => session.startedAt.startsWith(month));
    const monthCompleted = focusCompleted(monthSessions);
    const minutes = monthCompleted.reduce((sum, session) => sum + session.actualMinutes, 0);
    const seconds = focusSeconds(monthCompleted);
    return {
      month,
      label: `${index + 1}\u6708`,
      focusMinutes: minutes,
      focusSeconds: seconds,
      focusCount: monthCompleted.length,
      abandonedCount: monthSessions.filter((session) => session.interrupted).length
    };
  });
  const seconds = focusSeconds(completed);
  return {
    year,
    focusCount: completed.length,
    focusMinutes: seconds / 60,
    focusSeconds: seconds,
    abandonedCount: interrupted.length,
    activeDays,
    longestStreakDays: longestStreakDays(yearSessions, start, end),
    completionRate: completionRate(completed.length, interrupted.length),
    monthlyTrend
  };
}

function buildWeeklySummary(trend: DistributionItem[], taskRanking: TaskStatsItem[], interruptedCount: number, start: Date, end: Date): WeeklySummary {
  const fallbackBest: DistributionItem = { label: "\u4eca\u5929", focusCount: 0, focusMinutes: 0 };
  const best = trend.reduce((max, item) => (item.focusMinutes > max.focusMinutes ? item : max), trend[0] ?? fallbackBest);
  const totalFocusMinutes = trend.reduce((sum, item) => sum + item.focusMinutes, 0);
  const totalFocusCount = trend.reduce((sum, item) => sum + item.focusCount, 0);

  return {
    startDate: toDateKey(start),
    endDate: toDateKey(end),
    totalFocusCount,
    totalFocusMinutes,
    totalFocusSeconds: totalFocusMinutes * 60,
    abandonedCount: interruptedCount,
    bestDay: best.label,
    bestPeriod: statsMock.weeklySummary.bestPeriod,
    topTasks: taskRanking.slice(0, 3),
    trend,
    summaryText: totalFocusMinutes
      ? `\u8fd9\u5468\u7d2f\u8ba1\u4e13\u6ce8 ${totalFocusMinutes} \u5206\u949f\uff0c${best.label} \u7684\u72b6\u6001\u6700\u597d\u3002`
      : "\u8fd9\u5468\u8fd8\u6ca1\u6709\u65b0\u7684\u4e13\u6ce8\u8bb0\u5f55\uff0c\u5148\u4ece\u4e00\u4e2a\u5c0f\u756a\u8304\u5f00\u59cb\u3002"
  };
}

function buildStatsFromSessions(sessions: TimerSession[], checkins: MockCheckin[], range: StatsRange = "day", dateRange?: StatsDateRange, options: StatsQueryOptions = {}): StatsBundle {
  const now = new Date();
  const resolvedRange = resolveStatsRange(range, dateRange, options);
  const monthKey = options.month ?? resolvedRange.month;
  const year = options.year ?? Number(monthKey.slice(0, 4));
  const scopedSessions = sessions.filter((session) => {
    if (options.collectionId && session.collectionId !== options.collectionId) return false;
    if (options.todoId && session.taskId !== options.todoId) return false;
    return true;
  });
  const allCompleted = focusCompleted(scopedSessions);
  const allInterrupted = scopedSessions.filter((session) => session.interrupted);
  const todaySessions = scopedSessions.filter((session) => isSameDate(session.startedAt, now));
  const todayCompleted = focusCompleted(todaySessions);
  const rangeSessions = scopedSessions.filter((session) => inDateRange(session.startedAt, resolvedRange.start, resolvedRange.end));
  const monthSessions = scopedSessions.filter((session) => session.startedAt.startsWith(monthKey));
  const monthCompleted = focusCompleted(monthSessions);
  const monthInterrupted = monthSessions.filter((session) => session.interrupted);
  const rangeTrend = buildDistribution(range, rangeSessions, resolvedRange.start, resolvedRange.end);
  const rangeTaskRanking = buildTaskStats(rangeSessions);
  const allFocusSeconds = focusSeconds(allCompleted);
  const monthlyFocusSeconds = focusSeconds(monthCompleted);
  const activeDays = new Set(allCompleted.map((session) => toDateKey(new Date(session.startedAt)))).size;
  const monthActiveDays = new Set(monthCompleted.map((session) => toDateKey(new Date(session.startedAt)))).size;
  const wakeupLine = buildCheckinLine(checkins, "wakeup", monthKey);
  const sleepLine = buildCheckinLine(checkins, "sleep", monthKey);

  return {
    ...statsMock,
    today: {
      todayFocusCount: todayCompleted.length,
      todayFocusMinutes: focusSeconds(todayCompleted) / 60,
      todayFocusSeconds: focusSeconds(todayCompleted),
      todayAbandonedCount: todaySessions.filter((session) => session.interrupted).length
    },
    summary: {
      totalFocusCount: allCompleted.length,
      totalFocusMinutes: allFocusSeconds / 60,
      totalFocusSeconds: allFocusSeconds,
      averageDailyFocusMinutes: activeDays ? Math.round(allFocusSeconds / 60 / activeDays) : 0,
      averageDailyFocusSeconds: activeDays ? Math.round(allFocusSeconds / activeDays) : 0,
      totalAbandonedCount: allInterrupted.length
    },
    focusDurationDistribution: buildFocusDurationDistribution(rangeSessions),
    distribution: rangeTrend,
    trend: rangeTrend,
    timePeriods: buildPeriodDistribution(monthSessions),
    periodDistribution: buildPeriodDistribution(monthSessions),
    calendar: buildCalendar(scopedSessions, monthKey),
    recentSessions: [...scopedSessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 12).map(toRecentSession),
    historySessions: [...rangeSessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 50).map(toRecentSession),
    taskRanking: rangeTaskRanking,
    interruptionReasons: buildInterruptionReasons(monthSessions),
    weeklySummary: buildWeeklySummary(rangeTrend, rangeTaskRanking, rangeSessions.filter((session) => session.interrupted).length, resolvedRange.start, resolvedRange.end),
    wakeupDistribution: buildCheckinDistribution(checkins, "wakeup", monthKey),
    sleepDistribution: buildCheckinDistribution(checkins, "sleep", monthKey),
    wakeupLine,
    sleepLine,
    monthCheckins: buildMonthCheckins(checkins, monthKey),
    yearly: buildYearStats(scopedSessions, year),
    monthly: {
      month: monthKey,
      focusCount: monthCompleted.length,
      focusMinutes: monthlyFocusSeconds / 60,
      focusSeconds: monthlyFocusSeconds,
      abandonedCount: monthInterrupted.length,
      completionRate: completionRate(monthCompleted.length, monthInterrupted.length),
      activeDays: monthActiveDays
    }
  };
}

export const mockClient = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    if (!payload.username || !payload.password) throw new Error("登录失败啦，检查一下用户名或密码");
    const state = loadState();
    return delay({ accessToken: "mock-potato-token", tokenType: "Bearer", expiresIn: 86400, user: state.user });
  },
  async register(payload: RegisterRequest): Promise<LoginResponse> {
    if (!payload.username || payload.password.length < 6) throw new Error("账号信息还没填写完整");
    const state = loadState();
    state.user = {
      id: crypto.randomUUID(),
      username: payload.username,
      nickname: payload.nickname || payload.username,
      email: payload.email
    };
    saveState(state);
    return delay({ accessToken: "mock-potato-token", tokenType: "Bearer", expiresIn: 86400, user: state.user });
  },
  async me(): Promise<User> {
    return delay(loadState().user);
  },
  async updateProfile(payload: { nickname?: string; email?: string }): Promise<User> {
    const state = loadState();
    const nickname = payload.nickname?.trim();
    if (!nickname) throw new Error("昵称不能为空");
    if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new Error("邮箱格式不正确");
    state.user = {
      ...state.user,
      nickname,
      email: payload.email?.trim() || undefined
    };
    saveState(state);
    return delay(state.user);
  },
  async changePassword(payload: { oldPassword: string; newPassword: string; confirmPassword: string }): Promise<void> {
    if (!payload.oldPassword) throw new Error("请输入当前密码");
    if (payload.newPassword.length < 6) throw new Error("新密码至少 6 位");
    if (payload.newPassword !== payload.confirmPassword) throw new Error("两次输入的新密码不一致");
    return delay(undefined);
  },
  async logout(): Promise<void> {
    return delay(undefined);
  },
  async getSettings(): Promise<UserSettings> {
    return delay(loadState().settings);
  },
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const state = loadState();
    state.settings = { ...state.settings, ...settings };
    saveState(state);
    return delay(state.settings);
  },
  async getTasks(): Promise<Task[]> {
    return delay(loadState().tasks.sort((a, b) => a.sortOrder - b.sortOrder));
  },
  async createTask(input: TaskInput): Promise<Task> {
    const state = loadState();
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      ...input,
      status: "todo",
      completedPotatoes: 0,
      sortOrder: state.tasks.length + 1,
      createdAt: now,
      updatedAt: now
    };
    state.tasks.unshift(task);
    saveState(state);
    return delay(task);
  },
  async updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
    const state = loadState();
    const task = state.tasks.find((item) => item.id === id);
    if (!task) throw new Error("这个待办不存在");
    Object.assign(task, input, { updatedAt: new Date().toISOString() });
    saveState(state);
    return delay(task);
  },
  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    const state = loadState();
    const task = state.tasks.find((item) => item.id === id);
    if (!task) throw new Error("这个待办不存在");
    task.status = status;
    task.completedAt = status === "done" ? new Date().toISOString() : undefined;
    task.updatedAt = new Date().toISOString();
    saveState(state);
    return delay(task);
  },
  async selectTask(id: string): Promise<Task> {
    const state = loadState();
    let selected: Task | undefined;
    state.tasks = state.tasks.map((task) => {
      const isSelected = task.id === id;
      if (isSelected) selected = { ...task, selected: true };
      return { ...task, selected: isSelected };
    });
    saveState(state);
    if (!selected) throw new Error("这个待办不存在");
    return delay(selected);
  },
  async deleteTask(id: string): Promise<void> {
    const state = loadState();
    state.tasks = state.tasks.filter((task) => task.id !== id);
    saveState(state);
    return delay(undefined);
  },
  async createSession(session: Omit<PotatoSession, "id">): Promise<PotatoSession> {
    const state = loadState();
    const saved = { ...session, id: crypto.randomUUID() };
    state.sessions.unshift(saved);
    if (session.completed && session.mode === "focus" && session.taskId) {
      const task = state.tasks.find((item) => item.id === session.taskId);
      if (task) task.completedPotatoes = (task.completedPotatoes ?? 0) + 1;
    }
    saveState(state);
    return delay(saved);
  },
  async getStats(range: StatsRange = "day", dateRange?: StatsDateRange, options: StatsQueryOptions = {}): Promise<StatsBundle> {
    const state = loadState();
    return delay(buildStatsFromSessions(state.timerSessions, state.checkins, range, dateRange, options));
  },
  async getTodos(): Promise<TodoItem[]> {
    return delay(loadState().todos.filter((todo) => todo.status !== "archived").sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
  },
  async getTodo(id: number): Promise<TodoItem> {
    const todo = loadState().todos.find((item) => item.id === id);
    if (!todo) throw new Error("这个待办不存在");
    return delay(todo);
  },
  async createTodo(input: TodoInput): Promise<TodoItem> {
    const state = loadState();
    const now = new Date().toISOString();
    const todo: TodoItem = {
      id: Math.max(0, ...state.todos.map((item) => item.id)) + 1,
      ...input,
      countToStats: input.countToStats ?? input.includeInStats,
      status: "todo",
      sortOrder: input.sortOrder ?? state.todos.length + 1,
      createdAt: now,
      updatedAt: now
    };
    state.todos.unshift(todo);
    saveState(state);
    return delay(todo);
  },
  async updateTodo(id: number, input: Partial<TodoInput>): Promise<TodoItem> {
    const state = loadState();
    const todo = state.todos.find((item) => item.id === id);
    if (!todo) throw new Error("这个待办不存在");
    const { clearCollection, ...patch } = input;
    Object.assign(todo, patch, { updatedAt: new Date().toISOString() });
    if (clearCollection) todo.collectionId = null;
    todo.countToStats = input.countToStats ?? input.includeInStats ?? todo.countToStats;
    saveState(state);
    return delay(todo);
  },
  async updateTodoStatus(id: number, status: TodoStatus): Promise<TodoItem> {
    const state = loadState();
    const todo = state.todos.find((item) => item.id === id);
    if (!todo) throw new Error("这个待办不存在");
    todo.status = status;
    todo.updatedAt = new Date().toISOString();
    saveState(state);
    return delay(todo);
  },
  async updateTodoSort(id: number, sortOrder: number): Promise<TodoItem> {
    const state = loadState();
    const todo = state.todos.find((item) => item.id === id);
    if (!todo) throw new Error("这个待办不存在");
    todo.sortOrder = sortOrder;
    todo.updatedAt = new Date().toISOString();
    saveState(state);
    return delay(todo);
  },
  async deleteTodo(id: number): Promise<void> {
    const state = loadState();
    state.todos = state.todos.filter((todo) => todo.id !== id);
    saveState(state);
    return delay(undefined);
  },
  async getCollections(): Promise<TodoCollection[]> {
    return delay(loadState().collections);
  },
  async createCollection(input: TodoCollectionInput): Promise<TodoCollection> {
    const state = loadState();
    const now = new Date().toISOString();
    const collection: TodoCollection = {
      id: Math.max(0, ...state.collections.map((item) => item.id)) + 1,
      ...input,
      createdAt: now,
      updatedAt: now
    };
    state.collections.unshift(collection);
    saveState(state);
    return delay(collection);
  },
  async updateCollection(id: number, input: Partial<TodoCollectionInput>): Promise<TodoCollection> {
    const state = loadState();
    const collection = state.collections.find((item) => item.id === id);
    if (!collection) throw new Error("这个待办集不存在");
    Object.assign(collection, input, { updatedAt: new Date().toISOString() });
    saveState(state);
    return delay(collection);
  },
  async deleteCollection(id: number): Promise<void> {
    const state = loadState();
    state.collections = state.collections.filter((collection) => collection.id !== id);
    state.todos = state.todos.map((todo) => (todo.collectionId === id ? { ...todo, collectionId: null } : todo));
    saveState(state);
    return delay(undefined);
  },
  async getFuturePlans(): Promise<FuturePlan[]> {
    return delay([...loadState().futurePlans].sort((a, b) => a.targetDate.localeCompare(b.targetDate)));
  },
  async createFuturePlan(input: FuturePlanInput): Promise<FuturePlan> {
    const state = loadState();
    const now = new Date().toISOString();
    const plan: FuturePlan = {
      id: crypto.randomUUID(),
      title: input.title,
      note: input.note,
      targetDate: input.targetDate,
      createdAt: now,
      updatedAt: now
    };
    state.futurePlans.unshift(plan);
    saveState(state);
    return delay(plan);
  },
  async updateFuturePlan(id: string | number, input: Partial<FuturePlanInput>): Promise<FuturePlan> {
    const state = loadState();
    const plan = state.futurePlans.find((item) => item.id === id);
    if (!plan) throw new Error("未来计划不存在");
    Object.assign(plan, input, { updatedAt: new Date().toISOString() });
    saveState(state);
    return delay(plan);
  },
  async deleteFuturePlan(id: string | number): Promise<void> {
    const state = loadState();
    state.futurePlans = state.futurePlans.filter((plan) => plan.id !== id);
    saveState(state);
    return delay(undefined);
  },
  async createTimerSession(input: TimerSessionInput): Promise<TimerSession> {
    const state = loadState();
    const todo = state.todos.find((item) => item.id === input.taskId);
    const session: TimerSession = {
      ...input,
      countToStats: input.countToStats ?? todo?.countToStats ?? true,
      id: Math.max(0, ...state.timerSessions.map((item) => item.id)) + 1
    };
    state.timerSessions.unshift(session);
    if (todo) {
      todo.status = input.completed && isTodoCompleted(todo, state.timerSessions) ? "done" : "todo";
      todo.updatedAt = new Date().toISOString();
    }
    saveState(state);
    return delay(session);
  },
  async getTimerSessions(options: { month?: string; startDate?: string; endDate?: string; todoId?: number | null; collectionId?: number | null } = {}): Promise<TimerSession[]> {
    const sessions = loadState().timerSessions.filter((session) => {
      if (options.month && !session.startedAt.startsWith(options.month)) return false;
      const date = session.startedAt.slice(0, 10);
      if (options.startDate && date < options.startDate) return false;
      if (options.endDate && date > options.endDate) return false;
      if (options.todoId != null && session.taskId !== options.todoId) return false;
      if (options.collectionId != null && session.collectionId !== options.collectionId) return false;
      return true;
    });
    return delay([...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
  },
  async updateTimerSession(id: number, input: { actualMinutes?: number; startedAt?: string; endedAt?: string; note?: string }): Promise<TimerSession> {
    const state = loadState();
    const session = state.timerSessions.find((item) => item.id === id);
    if (!session) throw new Error("这条专注记录不存在");
    if (input.startedAt || input.endedAt) {
      const startedAt = input.startedAt ?? session.startedAt;
      const endedAt = input.endedAt ?? session.endedAt;
      const seconds = Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000);
      if (seconds < 5) throw new Error("结束时间要晚于开始时间");
      session.startedAt = startedAt;
      session.endedAt = endedAt;
      session.actualSeconds = seconds;
      session.actualMinutes = Math.floor(seconds / 60);
    } else if (input.actualMinutes != null) {
      session.actualMinutes = input.actualMinutes;
      session.actualSeconds = input.actualMinutes * 60;
      session.endedAt = new Date(new Date(session.startedAt).getTime() + input.actualMinutes * 60 * 1000).toISOString();
    }
    if (input.note != null) session.note = input.note.trim() || undefined;
    saveState(state);
    return delay(session);
  },
  async deleteTimerSession(id: number): Promise<void> {
    const state = loadState();
    state.timerSessions = state.timerSessions.filter((item) => item.id !== id);
    saveState(state);
    return delay(undefined);
  },
  async createCheckin(input: CheckinPayload): Promise<{ ok: boolean }> {
    const state = loadState();
    const checkedAt = input.checkinTime ?? new Date().toISOString();
    const checkedDate = new Date(checkedAt);
    const windowError = checkinWindowError(input.type, checkedDate);
    if (windowError) throw new Error(windowError);

    const dateKey = checkinBusinessDate(input.type, checkedDate);
    if (state.checkins.some((item) => item.type === input.type && checkinBusinessDate(item.type, new Date(item.checkedAt)) === dateKey)) {
      throw new Error(`${checkinLabel(input.type)}今天已经完成了`);
    }

    state.checkins.unshift({
      id: Math.max(0, ...state.checkins.map((item) => item.id)) + 1,
      type: input.type,
      checkedAt,
      note: input.note
    });
    saveState(state);
    return delay({ ok: true });
  },
  async getCheckins(startDate: string, endDate: string): Promise<CheckinRecordItem[]> {
    const checkins = loadState().checkins
      .filter((item) => {
        const date = checkinBusinessDate(item.type, new Date(item.checkedAt));
        return date >= startDate && date <= endDate;
      })
      .sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))
      .map((item) => ({
        id: item.id,
        type: item.type,
        checkinTime: item.checkedAt,
        note: item.note ?? null
      }));
    return delay(checkins);
  },
  async updateCheckin(id: number, input: { checkinTime?: string; note?: string }): Promise<CheckinRecordItem> {
    const state = loadState();
    const checkin = state.checkins.find((item) => item.id === id);
    if (!checkin) throw new Error("这条打卡记录不存在");
    if (input.checkinTime) {
      const checkedDate = new Date(input.checkinTime);
      const windowError = checkinWindowError(checkin.type, checkedDate);
      if (windowError) throw new Error(windowError);
      const dateKey = checkinBusinessDate(checkin.type, checkedDate);
      if (state.checkins.some((item) => item.id !== id && item.type === checkin.type && checkinBusinessDate(item.type, new Date(item.checkedAt)) === dateKey)) {
        throw new Error(`${checkinLabel(checkin.type)}今天已经完成了`);
      }
      checkin.checkedAt = input.checkinTime;
    }
    if (input.note != null) checkin.note = input.note.trim() || null;
    saveState(state);
    return delay({
      id: checkin.id,
      type: checkin.type,
      checkinTime: checkin.checkedAt,
      note: checkin.note ?? null
    });
  },
  async deleteCheckin(id: number): Promise<void> {
    const state = loadState();
    state.checkins = state.checkins.filter((item) => item.id !== id);
    saveState(state);
    return delay(undefined);
  }
};
