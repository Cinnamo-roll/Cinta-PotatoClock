import type { TimerType } from "./todo";

export type StatsRange = "day" | "week" | "month" | "custom";

export interface StatsDateRange {
  startDate?: string;
  endDate?: string;
}

export interface StatsSummary {
  totalFocusCount: number;
  totalFocusMinutes: number;
  totalFocusSeconds?: number;
  averageDailyFocusMinutes: number;
  averageDailyFocusSeconds?: number;
  totalAbandonedCount: number;
}

export interface TodayStats {
  todayFocusCount: number;
  todayFocusMinutes: number;
  todayFocusSeconds?: number;
  todayAbandonedCount: number;
}

export interface FocusDurationDistributionItem {
  key: string;
  label: string;
  focusCount: number;
  focusMinutes: number;
  focusSeconds: number;
  abandonedCount?: number;
  percent: number;
}

export interface DistributionItem {
  label: string;
  focusCount: number;
  focusMinutes: number;
  focusSeconds?: number;
  abandonedCount?: number;
}

export interface PeriodDistributionItem {
  label: string;
  hour: number;
  focusCount: number;
  focusMinutes: number;
  focusSeconds: number;
}

export interface CalendarStatsItem {
  date: string;
  focusCount: number;
  focusMinutes: number;
  focusSeconds: number;
  abandonedCount: number;
}

export interface RecentSession {
  id: number;
  taskId?: number | null;
  todoId?: number | null;
  taskTitle?: string;
  collectionId?: number | null;
  collectionName?: string | null;
  timerType: TimerType;
  actualMinutes: number;
  actualSeconds?: number;
  startedAt: string;
  endedAt: string;
  completed: boolean;
  interrupted: boolean;
  interruptReason?: string | null;
}

export interface TaskStatsItem {
  taskId: number;
  todoId?: number;
  taskTitle: string;
  focusCount: number;
  focusMinutes: number;
  focusSeconds?: number;
  abandonedCount: number;
}

export interface InterruptionReasonItem {
  reason: string;
  reasonText?: string;
  count: number;
  percent: number;
}

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  totalFocusCount: number;
  totalFocusMinutes: number;
  totalFocusSeconds: number;
  abandonedCount: number;
  bestDay?: string;
  bestPeriod?: string;
  topTasks: TaskStatsItem[];
  trend: DistributionItem[];
  summaryText: string;
}

export interface MonthlyStats {
  month: string;
  focusCount: number;
  focusMinutes: number;
  focusSeconds?: number;
  abandonedCount: number;
  completionRate: number;
  activeDays: number;
}

export type MonthStats = MonthlyStats;

export interface CheckinDistributionItem {
  label: string;
  count: number;
}

export interface CheckinLineItem {
  date: string;
  time?: string | null;
  minutesOfDay: number | null;
}

export interface CheckinRecordItem {
  id: number;
  type: "wakeup" | "focus_today" | "sleep";
  checkinTime: string;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonthCheckinItem {
  date: string;
  wakeupChecked: boolean;
  sleepChecked: boolean;
}

export interface YearMonthlyTrendItem {
  month: string;
  label?: string;
  focusMinutes: number;
  focusSeconds: number;
  focusCount: number;
  abandonedCount: number;
}

export interface YearStats {
  year: number;
  focusCount: number;
  focusMinutes: number;
  focusSeconds: number;
  abandonedCount: number;
  activeDays: number;
  longestStreakDays: number;
  completionRate: number;
  monthlyTrend: YearMonthlyTrendItem[];
}

export interface StatsBundle {
  today: TodayStats;
  summary: StatsSummary;
  focusDurationDistribution: FocusDurationDistributionItem[];
  distribution: DistributionItem[];
  periodDistribution: PeriodDistributionItem[];
  trend: DistributionItem[];
  timePeriods: DistributionItem[];
  calendar: CalendarStatsItem[];
  recentSessions: RecentSession[];
  historySessions: RecentSession[];
  taskRanking: TaskStatsItem[];
  monthly: MonthlyStats;
  interruptionReasons: InterruptionReasonItem[];
  weeklySummary: WeeklySummary;
  wakeupDistribution: CheckinDistributionItem[];
  sleepDistribution: CheckinDistributionItem[];
  wakeupLine: CheckinLineItem[];
  sleepLine: CheckinLineItem[];
  monthCheckins: MonthCheckinItem[];
  yearly: YearStats;
}

export interface StatsQueryOptions {
  month?: string;
  year?: number;
  collectionId?: number | null;
  todoId?: number | null;
}
