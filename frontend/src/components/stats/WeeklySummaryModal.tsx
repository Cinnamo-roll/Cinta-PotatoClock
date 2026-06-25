import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Clock3, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { sessionsApi } from "@/api/sessions";
import { statsApi } from "@/api/stats";
import { chartAnimation } from "@/components/stats/chartAnimation";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { DistributionItem, TaskStatsItem, WeeklySummary } from "@/types/stats";
import type { TimerSession } from "@/types/session";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function weekRange(anchor: Date) {
  const end = new Date(anchor);
  const start = addDays(end, -6);
  return { startDate: toDateInput(start), endDate: toDateInput(end) };
}

function shortDate(date: string) {
  const [, month, day] = date.split("-");
  return `${month}-${day}`;
}

function sessionSeconds(session: TimerSession) {
  return session.actualSeconds ?? session.actualMinutes * 60;
}

function bestPeriod(sessions: TimerSession[]) {
  const buckets = new Map<number, number>();
  sessions
    .filter((session) => session.completed && !session.interrupted)
    .forEach((session) => {
      const hour = new Date(session.startedAt).getHours();
      buckets.set(hour, (buckets.get(hour) ?? 0) + sessionSeconds(session));
    });
  const best = [...buckets.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] <= 0) return null;
  return `${pad(best[0])}:00-${pad(Math.min(best[0] + 1, 24))}:00`;
}

function summaryFromSessions(startDate: string, endDate: string, sessions: TimerSession[]): WeeklySummary {
  const days: DistributionItem[] = [];
  for (let cursor = new Date(`${startDate}T00:00:00`); toDateInput(cursor) <= endDate; cursor = addDays(cursor, 1)) {
    const date = toDateInput(cursor);
    const daySessions = sessions.filter((session) => session.startedAt.slice(0, 10) === date);
    const completed = daySessions.filter((session) => session.completed && !session.interrupted);
    const seconds = completed.reduce((sum, session) => sum + sessionSeconds(session), 0);
    days.push({
      label: shortDate(date),
      focusCount: completed.length,
      focusMinutes: Math.floor(seconds / 60),
      focusSeconds: seconds,
      abandonedCount: daySessions.filter((session) => session.interrupted).length
    });
  }

  const completed = sessions.filter((session) => session.completed && !session.interrupted);
  const totalSeconds = completed.reduce((sum, session) => sum + sessionSeconds(session), 0);
  const abandonedCount = sessions.filter((session) => session.interrupted).length;
  const best = days.reduce((max, item) => ((item.focusSeconds ?? 0) > (max.focusSeconds ?? 0) ? item : max), days[0] ?? { label: "", focusCount: 0, focusMinutes: 0, focusSeconds: 0 });
  const taskMap = new Map<number, TaskStatsItem>();
  completed.forEach((session) => {
    const taskId = session.taskId ?? 0;
    const current = taskMap.get(taskId) ?? {
      taskId,
      todoId: taskId,
      taskTitle: session.taskTitle || "未命名待办",
      focusCount: 0,
      focusMinutes: 0,
      focusSeconds: 0,
      abandonedCount: 0
    };
    current.focusCount += 1;
    current.focusSeconds = (current.focusSeconds ?? 0) + sessionSeconds(session);
    current.focusMinutes = Math.floor((current.focusSeconds ?? 0) / 60);
    taskMap.set(taskId, current);
  });

  return {
    startDate,
    endDate,
    totalFocusCount: completed.length,
    totalFocusMinutes: Math.floor(totalSeconds / 60),
    totalFocusSeconds: totalSeconds,
    abandonedCount,
    bestDay: best.focusMinutes > 0 ? best.label : undefined,
    bestPeriod: bestPeriod(sessions) ?? undefined,
    topTasks: [...taskMap.values()].sort((a, b) => (b.focusSeconds ?? 0) - (a.focusSeconds ?? 0)).slice(0, 3),
    trend: days,
    summaryText: totalSeconds ? `这周最专注的一天是 ${best.label}，一共专注 ${formatMinutes(best.focusMinutes)}。` : "这周还没有专注记录，先从一个小目标开始吧。"
  };
}

function humanSummary(summary: WeeklySummary) {
  if (!summary.totalFocusMinutes && !summary.totalFocusCount) return "这周还没有专注记录，先从一个小目标开始吧。";
  const best = summary.bestDay ? `最稳的一天是 ${summary.bestDay}` : "这周有专注记录";
  const period = summary.bestPeriod ? `，高效时段在 ${summary.bestPeriod}` : "";
  return `${best}${period}。`;
}

interface WeeklySummaryModalProps {
  open: boolean;
  collectionId?: number | null;
  todoId?: number | null;
  onClose: () => void;
}

export function WeeklySummaryModal({ open, collectionId = null, todoId = null, onClose }: WeeklySummaryModalProps) {
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const range = useMemo(() => weekRange(anchorDate), [anchorDate]);
  const { data: current, isFetching } = useQuery({
    queryKey: ["stats-week-summary", range.startDate, range.endDate, collectionId, todoId],
    queryFn: async () => {
      if (todoId != null) {
        const sessions = await sessionsApi.range(range.startDate, range.endDate, { todoId, collectionId });
        return summaryFromSessions(range.startDate, range.endDate, sessions);
      }
      return statsApi.weekSummary(range, { collectionId });
    },
    enabled: open,
    staleTime: 10_000
  });

  const hasData = Boolean(current && (current.totalFocusMinutes > 0 || current.totalFocusCount > 0 || current.abandonedCount > 0));
  const bestTrend = current?.trend.reduce<DistributionItem | null>((best, item) => (!best || (item.focusSeconds ?? 0) > (best.focusSeconds ?? 0) ? item : best), null);

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
        <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 max-h-[82vh] w-[calc(100%-28px)] max-w-[410px] rounded-[28px] border-white/80 bg-white/90 p-5 shadow-[0_18px_46px_rgba(120,70,90,0.18)] backdrop-blur-[20px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-lg font-black">
                <Sparkles size={18} />
                一周总结
              </Dialog.Title>
              <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">
                {range.startDate} 至 {range.endDate}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => setAnchorDate((date) => addDays(date, -7))} type="button" aria-label="上一周">
                <ChevronLeft size={17} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => setAnchorDate((date) => addDays(date, 7))} type="button" aria-label="下一周">
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {isFetching && !current ? (
            <div className="mt-4 rounded-[18px] bg-[var(--app-card-soft)] p-5 text-center text-sm font-bold text-[var(--app-muted)]">正在同步这一周的数据...</div>
          ) : null}

          {current && hasData ? (
            <>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
                  <p className="text-xs font-bold text-[var(--app-muted)]">总时长</p>
                  <p className="mt-1 text-sm font-black">{formatMinutes(current.totalFocusMinutes)}</p>
                </div>
                <div className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
                  <p className="text-xs font-bold text-[var(--app-muted)]">专注次数</p>
                  <p className="mt-1 text-lg font-black">{current.totalFocusCount}</p>
                </div>
                <div className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
                  <p className="text-xs font-bold text-[var(--app-muted)]">放弃次数</p>
                  <p className="mt-1 text-lg font-black">{current.abandonedCount}</p>
                </div>
              </div>

              <div className="mt-4 h-[170px] rounded-[20px] bg-[var(--app-card-soft)] p-2">
                <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 1, height: 1 }}>
                  <ComposedChart data={current.trend} margin={{ left: -18, right: 4, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(120,80,100,0.08)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "var(--app-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--app-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ border: "1px solid rgba(255,255,255,.78)", borderRadius: 16, background: "rgba(255,255,255,.9)", backdropFilter: "blur(18px)" }} />
                    <Bar dataKey="abandonedCount" name="放弃次数" fill="rgba(230,90,110,0.28)" radius={[8, 8, 3, 3]} {...chartAnimation} />
                    <Area type="monotone" dataKey="focusMinutes" name="专注分钟" stroke="var(--app-primary)" strokeWidth={3} fill="var(--app-primary-soft)" {...chartAnimation} animationBegin={180} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-[18px] bg-white px-4 py-3">
                <p className="text-xs font-bold text-[var(--app-muted)]">本周节奏</p>
                <p className="mt-1 text-base font-black text-[var(--app-text)]">{bestTrend?.focusMinutes ? `${bestTrend.label} · ${formatMinutes(bestTrend.focusMinutes)}` : "暂无最高日"}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-[var(--app-muted)]">{humanSummary(current)}</p>
              </div>

              {current.topTasks.length ? (
                <div className="mt-3 rounded-[18px] bg-[var(--app-card-soft)] px-4 py-3">
                  <p className="text-xs font-bold text-[var(--app-muted)]">高频事项</p>
                  <div className="mt-2 space-y-2">
                    {current.topTasks.slice(0, 3).map((task) => (
                      <div key={`${task.taskId}-${task.taskTitle}`} className="flex items-center justify-between gap-3 text-sm font-bold">
                        <span className="min-w-0 truncate">{task.taskTitle}</span>
                        <span className="shrink-0 text-[var(--app-muted)]">{formatMinutes(task.focusMinutes)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {current.bestPeriod ? (
                <div className="mt-3 flex items-center gap-2 rounded-[18px] bg-[var(--app-card-soft)] px-4 py-3 text-sm font-bold text-[var(--app-muted)]">
                  <Clock3 size={16} className="text-[var(--app-primary-strong)]" />
                  高效时段：{current.bestPeriod}
                </div>
              ) : null}
            </>
          ) : null}

          {current && !hasData ? <StatsEmptyState title="这一周还没有记录" description="换一周看看，或者先完成一次专注。" /> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
