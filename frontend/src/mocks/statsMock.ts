import type {
  CalendarStatsItem,
  CheckinDistributionItem,
  CheckinLineItem,
  FocusDurationDistributionItem,
  InterruptionReasonItem,
  MonthCheckinItem,
  PeriodDistributionItem,
  RecentSession,
  StatsBundle,
  TaskStatsItem,
  WeeklySummary,
  YearStats
} from "@/types/stats";

export const mockFocusDurationDistribution: FocusDurationDistributionItem[] = [
  { key: "english", label: "背英语单词", focusCount: 18, focusMinutes: 460, focusSeconds: 27600, abandonedCount: 2, percent: 39 },
  { key: "coding", label: "写代码", focusCount: 12, focusMinutes: 520, focusSeconds: 31200, abandonedCount: 1, percent: 44 },
  { key: "reading", label: "阅读", focusCount: 9, focusMinutes: 210, focusSeconds: 12600, abandonedCount: 0, percent: 17 }
];

export const mockTrend = [
  { label: "周三", focusCount: 3, focusMinutes: 80, focusSeconds: 4800 },
  { label: "周四", focusCount: 2, focusMinutes: 50, focusSeconds: 3000 },
  { label: "周五", focusCount: 4, focusMinutes: 110, focusSeconds: 6600 },
  { label: "周六", focusCount: 1, focusMinutes: 25, focusSeconds: 1500 },
  { label: "周日", focusCount: 2, focusMinutes: 60, focusSeconds: 3600 },
  { label: "周一", focusCount: 4, focusMinutes: 95, focusSeconds: 5700 },
  { label: "今天", focusCount: 0, focusMinutes: 0, focusSeconds: 0 }
];

export const mockPeriodDistribution: PeriodDistributionItem[] = [
  { label: "00:00", hour: 0, focusCount: 0, focusMinutes: 0, focusSeconds: 0 },
  { label: "03:00", hour: 3, focusCount: 0, focusMinutes: 0, focusSeconds: 0 },
  { label: "06:00", hour: 6, focusCount: 1, focusMinutes: 20, focusSeconds: 1200 },
  { label: "09:00", hour: 9, focusCount: 3, focusMinutes: 80, focusSeconds: 4800 },
  { label: "12:00", hour: 12, focusCount: 1, focusMinutes: 25, focusSeconds: 1500 },
  { label: "15:00", hour: 15, focusCount: 2, focusMinutes: 50, focusSeconds: 3000 },
  { label: "18:00", hour: 18, focusCount: 1, focusMinutes: 20, focusSeconds: 1200 },
  { label: "21:00", hour: 21, focusCount: 2, focusMinutes: 60, focusSeconds: 3600 }
];

export const mockCalendar: CalendarStatsItem[] = Array.from({ length: 30 }).map((_, index) => {
  const focusMinutes = index % 5 === 0 ? 0 : [20, 55, 120, 210][index % 4];
  return {
    date: `2026-06-${String(index + 1).padStart(2, "0")}`,
    focusCount: focusMinutes ? (index % 4) + 1 : 0,
    focusMinutes,
    focusSeconds: focusMinutes * 60,
    abandonedCount: index % 9 === 0 ? 1 : 0
  };
});

export const mockRecentSessions: RecentSession[] = [
  {
    id: 1,
    taskId: 1,
    todoId: 1,
    taskTitle: "背英语单词",
    timerType: "countdown",
    actualMinutes: 25,
    actualSeconds: 1500,
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    endedAt: new Date(Date.now() - 5700000).toISOString(),
    completed: true,
    interrupted: false
  },
  {
    id: 2,
    taskId: 2,
    todoId: 2,
    taskTitle: "写代码",
    timerType: "countup",
    actualMinutes: 42,
    actualSeconds: 2520,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    endedAt: new Date(Date.now() - 1080000).toISOString(),
    completed: false,
    interrupted: true,
    interruptReason: "被打断"
  },
  {
    id: 3,
    taskId: 3,
    todoId: 3,
    taskTitle: "阅读",
    timerType: "none",
    actualMinutes: 18,
    actualSeconds: 1080,
    startedAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    endedAt: new Date(Date.now() - 27.7 * 3600000).toISOString(),
    completed: true,
    interrupted: false
  }
];

export const mockTaskRanking: TaskStatsItem[] = [
  { taskId: 2, todoId: 2, taskTitle: "写代码", focusCount: 12, focusMinutes: 520, focusSeconds: 31200, abandonedCount: 1 },
  { taskId: 1, todoId: 1, taskTitle: "背英语单词", focusCount: 18, focusMinutes: 460, focusSeconds: 27600, abandonedCount: 2 },
  { taskId: 3, todoId: 3, taskTitle: "阅读", focusCount: 9, focusMinutes: 210, focusSeconds: 12600, abandonedCount: 0 }
];

export const mockInterruptionReasons: InterruptionReasonItem[] = [
  { reason: "interrupted", reasonText: "被打断", count: 3, percent: 38 },
  { reason: "plan_changed", reasonText: "计划有变", count: 2, percent: 25 },
  { reason: "tired", reasonText: "太累了", count: 2, percent: 25 },
  { reason: "other", reasonText: "其他", count: 1, percent: 12 }
];

export const mockWakeupLine: CheckinLineItem[] = [
  { date: "2026-06-01", time: "07:30", minutesOfDay: 450 },
  { date: "2026-06-02", time: "07:10", minutesOfDay: 430 },
  { date: "2026-06-03", time: "08:00", minutesOfDay: 480 },
  { date: "2026-06-04", time: "07:45", minutesOfDay: 465 },
  { date: "2026-06-05", time: "07:20", minutesOfDay: 440 },
  { date: "2026-06-06", time: "08:20", minutesOfDay: 500 },
  { date: "2026-06-07", time: "07:35", minutesOfDay: 455 }
];

export const mockSleepLine: CheckinLineItem[] = [
  { date: "2026-06-01", time: "23:30", minutesOfDay: 1410 },
  { date: "2026-06-02", time: "00:10", minutesOfDay: 1450 },
  { date: "2026-06-03", time: "23:50", minutesOfDay: 1430 },
  { date: "2026-06-04", time: "00:30", minutesOfDay: 1470 },
  { date: "2026-06-05", time: "23:20", minutesOfDay: 1400 },
  { date: "2026-06-06", time: "01:00", minutesOfDay: 1500 },
  { date: "2026-06-07", time: "23:45", minutesOfDay: 1425 }
];

export const mockWakeupDistribution: CheckinDistributionItem[] = mockWakeupLine
  .filter((item) => item.time)
  .map((item) => ({ label: item.time!, count: 1 }));
export const mockSleepDistribution: CheckinDistributionItem[] = mockSleepLine
  .filter((item) => item.time)
  .map((item) => ({ label: item.time!, count: 1 }));

export const mockMonthCheckins: MonthCheckinItem[] = Array.from({ length: 30 }).map((_, index) => ({
  date: `2026-06-${String(index + 1).padStart(2, "0")}`,
  wakeupChecked: index % 4 !== 0,
  sleepChecked: index % 5 !== 0
}));

export const mockYearly: YearStats = {
  year: 2026,
  focusCount: 286,
  focusMinutes: 8450,
  focusSeconds: 507000,
  abandonedCount: 42,
  activeDays: 96,
  longestStreakDays: 18,
  completionRate: 86,
  monthlyTrend: Array.from({ length: 12 }).map((_, index) => {
    const focusMinutes = [1200, 2160, 1080, 2600, 1890, 980, 1420, 1660, 2100, 2350, 1980, 3000][index];
    return {
      month: `2026-${String(index + 1).padStart(2, "0")}`,
      label: `${index + 1}月`,
      focusMinutes,
      focusSeconds: focusMinutes * 60,
      focusCount: Math.round(focusMinutes / 35),
      abandonedCount: index % 3
    };
  })
};

export const mockWeeklySummary: WeeklySummary = {
  startDate: "2026-06-17",
  endDate: "2026-06-23",
  totalFocusCount: 14,
  totalFocusMinutes: 390,
  totalFocusSeconds: 23400,
  abandonedCount: 3,
  bestDay: "周三",
  bestPeriod: "上午",
  topTasks: mockTaskRanking.slice(0, 3),
  trend: mockTrend,
  summaryText: "这周你的专注节奏比较稳定，上午状态最好。"
};

export const statsMock: StatsBundle = {
  today: {
    todayFocusCount: 0,
    todayFocusMinutes: 0,
    todayFocusSeconds: 0,
    todayAbandonedCount: 0
  },
  summary: {
    totalFocusCount: 69,
    totalFocusMinutes: 4039,
    totalFocusSeconds: 242340,
    averageDailyFocusMinutes: 224,
    averageDailyFocusSeconds: 13440,
    totalAbandonedCount: 7
  },
  focusDurationDistribution: mockFocusDurationDistribution,
  distribution: mockTrend,
  periodDistribution: mockPeriodDistribution,
  trend: mockWeeklySummary.trend,
  timePeriods: mockPeriodDistribution,
  calendar: mockCalendar,
  recentSessions: mockRecentSessions,
  historySessions: mockRecentSessions,
  taskRanking: mockTaskRanking,
  interruptionReasons: mockInterruptionReasons,
  weeklySummary: mockWeeklySummary,
  wakeupDistribution: mockWakeupDistribution,
  sleepDistribution: mockSleepDistribution,
  wakeupLine: mockWakeupLine,
  sleepLine: mockSleepLine,
  monthCheckins: mockMonthCheckins,
  yearly: mockYearly,
  monthly: {
    month: "2026-06",
    focusCount: 28,
    focusMinutes: 980,
    focusSeconds: 58800,
    abandonedCount: 4,
    completionRate: 88,
    activeDays: 18
  }
};
