import type { TimerSession } from "@/types/session";
import type { TodoItem } from "@/types/todo";

const DAY_MS = 24 * 60 * 60 * 1000;

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function todayKey() {
  return dateKey(new Date());
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  next.setDate(next.getDate() - (day === 0 ? 6 : day - 1));
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function sessionInRange(session: TimerSession, start: Date, end: Date) {
  const key = session.startedAt.slice(0, 10);
  return key >= dateKey(start) && key <= dateKey(end);
}

export function scopedTodoSessions(todo: TodoItem, sessions: TimerSession[]) {
  const scoped = todoSessions(todo, sessions);
  if (todo.category !== "habit") return scoped;
  const now = new Date();
  if (todo.recurrence === "每周") return scoped.filter((session) => sessionInRange(session, startOfWeek(now), now));
  if (todo.recurrence === "每月") return scoped.filter((session) => sessionInRange(session, startOfMonth(now), now));
  return scoped.filter((session) => session.startedAt.slice(0, 10) === todayKey());
}

export function daysBetween(start: Date, end: Date) {
  return Math.max(0, Math.floor((startOfDay(end).getTime() - startOfDay(start).getTime()) / DAY_MS));
}

export function formatDateTime(value?: string) {
  if (!value) return "未记录";
  return new Date(value).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
}

export function sessionSeconds(session: TimerSession) {
  return session.actualSeconds ?? session.actualMinutes * 60;
}

export function completedSessions(sessions: TimerSession[]) {
  return sessions.filter((session) => session.completed && !session.interrupted);
}

export function todoSessions(todo: TodoItem, sessions: TimerSession[]) {
  return sessions.filter((session) => session.taskId === todo.id);
}

export function todayTodoMetrics(todo: TodoItem, sessions: TimerSession[]) {
  const key = todayKey();
  const scoped = todoSessions(todo, sessions).filter((session) => session.startedAt.slice(0, 10) === key);
  const completed = completedSessions(scoped);
  const focusSeconds = completed.reduce((sum, session) => sum + sessionSeconds(session), 0);
  return {
    completedCount: completed.length,
    focusSeconds,
    focusMinutes: Math.round(focusSeconds / 60),
    abandonedCount: scoped.filter((session) => session.interrupted).length
  };
}

export function totalTodoMetrics(todo: TodoItem, sessions: TimerSession[]) {
  const scoped = todoSessions(todo, sessions);
  const completed = completedSessions(scoped);
  const focusSeconds = completed.reduce((sum, session) => sum + sessionSeconds(session), 0);
  const activeDays = new Set(completed.map((session) => session.startedAt.slice(0, 10))).size;
  return {
    completedCount: completed.length,
    focusSeconds,
    focusMinutes: Math.round(focusSeconds / 60),
    abandonedCount: scoped.filter((session) => session.interrupted).length,
    activeDays
  };
}

export function targetProgress(todo: TodoItem, sessions: TimerSession[]) {
  const scoped = scopedTodoSessions(todo, sessions);
  const completed = completedSessions(scoped);
  const unit = todo.timerType === "none" ? "次" : todo.targetUnit ?? "分钟";
  const target = Math.max(1, todo.targetAmount ?? (unit === "次" ? 1 : todo.durationMinutes || 1));
  const current = unit === "次" ? completed.length : Math.floor(completed.reduce((sum, session) => sum + sessionSeconds(session), 0) / 60);
  return {
    current,
    target,
    unit,
    percent: Math.min(100, Math.round((current / target) * 100))
  };
}

export function targetPeriodText(todo: TodoItem) {
  if (todo.category === "habit") return todo.recurrence ?? "每天";
  if (todo.category === "goal") return "累计";
  return "今日";
}

export function isTodoCompleted(todo: TodoItem, sessions: TimerSession[]) {
  if (todo.category === "habit" || todo.category === "goal") {
    return targetProgress(todo, sessions).percent >= 100;
  }
  return todo.status === "done" || todayTodoMetrics(todo, sessions).completedCount > 0;
}

export function todoStreak(todo: TodoItem, sessions: TimerSession[]) {
  const activeDays = new Set(completedSessions(todoSessions(todo, sessions)).map((session) => session.startedAt.slice(0, 10)));
  let streak = 0;
  for (let date = startOfDay(new Date()); activeDays.has(dateKey(date)); date = new Date(date.getTime() - DAY_MS)) {
    streak += 1;
  }
  return streak;
}

export function todoTotalDays(todo: TodoItem) {
  return daysBetween(new Date(todo.createdAt), new Date()) + 1;
}

export function weekHeat(todo: TodoItem, sessions: TimerSession[]) {
  const activeDays = new Set(completedSessions(todoSessions(todo, sessions)).map((session) => session.startedAt.slice(0, 10)));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = dateKey(date);
    return {
      key,
      label: index === 6 ? "今" : date.toLocaleDateString("zh-CN", { weekday: "narrow" }),
      active: activeDays.has(key)
    };
  });
}

export function deadlineText(todo: TodoItem) {
  if (!todo.deadline) return null;
  const days = daysBetween(new Date(), new Date(todo.deadline));
  if (dateKey(new Date(todo.deadline)) < todayKey()) return `已过期 ${daysBetween(new Date(todo.deadline), new Date())} 天`;
  if (days === 0) return "今天到期";
  return `还剩 ${days} 天`;
}
