import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { sessionsApi } from "@/api/sessions";
import { statsApi } from "@/api/stats";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { CalendarStatsItem } from "@/types/stats";
import type { TimerSession } from "@/types/session";

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function monthText(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function shiftMonth(date: Date, step: -1 | 1) {
  return new Date(date.getFullYear(), date.getMonth() + step, 1);
}

function daysInMonth(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, monthIndex, 0).getDate();
}

function monthStartOffset(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  const day = new Date(year, monthIndex - 1, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function dateTitle(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" });
}

function intensityColor(minutes: number, maxMinutes: number) {
  if (minutes <= 0) return "var(--app-card)";
  const level = heatLevel(minutes, maxMinutes);
  const colors = [
    "var(--app-card)",
    "color-mix(in srgb, var(--app-primary) 12%, var(--app-card))",
    "color-mix(in srgb, var(--app-primary) 24%, var(--app-card))",
    "color-mix(in srgb, var(--app-primary) 38%, var(--app-card))",
    "color-mix(in srgb, var(--app-primary-strong) 56%, var(--app-card))"
  ];
  return colors[level];
}

function heatLevel(minutes: number, maxMinutes: number) {
  if (minutes <= 0) return 0;
  const ratio = Math.min(1, minutes / Math.max(120, maxMinutes));
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function sessionSeconds(session: TimerSession) {
  return session.actualSeconds ?? session.actualMinutes * 60;
}

function calendarFromSessions(month: string, sessions: TimerSession[]): CalendarStatsItem[] {
  const byDate = new Map<string, CalendarStatsItem>();
  for (let day = 1; day <= daysInMonth(month); day += 1) {
    const date = `${month}-${pad(day)}`;
    byDate.set(date, { date, focusCount: 0, focusMinutes: 0, focusSeconds: 0, abandonedCount: 0 });
  }
  sessions.forEach((session) => {
    const date = session.startedAt.slice(0, 10);
    const current = byDate.get(date);
    if (!current) return;
    if (session.completed && !session.interrupted) {
      current.focusCount += 1;
      current.focusSeconds += sessionSeconds(session);
      current.focusMinutes = Math.floor(current.focusSeconds / 60);
    }
    if (session.interrupted) current.abandonedCount += 1;
  });
  return [...byDate.values()];
}

interface FocusHeatmapDrawerProps {
  open: boolean;
  collectionId?: number | null;
  todoId?: number | null;
  onClose: () => void;
}

export function FocusHeatmapDrawer({ open, collectionId = null, todoId = null, onClose }: FocusHeatmapDrawerProps) {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const month = monthText(monthDate);

  const { data: rawCalendar = [], isFetching } = useQuery({
    queryKey: ["stats-heatmap", month, collectionId, todoId],
    queryFn: async () => {
      if (todoId != null) {
        const sessions = await sessionsApi.month(month, { todoId, collectionId });
        return calendarFromSessions(month, sessions);
      }
      return statsApi.calendar(month, { collectionId });
    },
    enabled: open,
    staleTime: 10_000
  });

  const monthCalendar = useMemo(() => {
    const byDate = new Map(rawCalendar.map((item) => [item.date, item]));
    return Array.from({ length: daysInMonth(month) }, (_, index) => {
      const date = `${month}-${pad(index + 1)}`;
      return byDate.get(date) ?? { date, focusCount: 0, focusMinutes: 0, focusSeconds: 0, abandonedCount: 0 };
    });
  }, [month, rawCalendar]);

  const calendarCells = useMemo(() => {
    const blanks = Array.from({ length: monthStartOffset(month) }, () => null);
    const days = Array.from({ length: daysInMonth(month) }, (_, index) => {
      const date = `${month}-${pad(index + 1)}`;
      return monthCalendar[index] ?? { date, focusCount: 0, focusMinutes: 0, focusSeconds: 0, abandonedCount: 0 };
    });
    return [...blanks, ...days];
  }, [month, monthCalendar]);

  const hasData = monthCalendar.some((item) => item.focusMinutes > 0 || item.abandonedCount > 0);
  const selected = monthCalendar.find((item) => item.date === selectedDate) ?? monthCalendar.find((item) => item.focusMinutes > 0 || item.abandonedCount > 0);
  const totalMinutes = monthCalendar.reduce((sum, item) => sum + item.focusMinutes, 0);
  const totalCount = monthCalendar.reduce((sum, item) => sum + item.focusCount, 0);
  const abandonedCount = monthCalendar.reduce((sum, item) => sum + item.abandonedCount, 0);
  const activeDays = monthCalendar.filter((item) => item.focusMinutes > 0).length;
  const bestDay = monthCalendar.reduce<CalendarStatsItem | null>((best, item) => (!best || item.focusSeconds > best.focusSeconds ? item : best), null);
  const maxMinutes = Math.max(...monthCalendar.map((item) => item.focusMinutes), 0);
  const averageActiveMinutes = activeDays ? Math.round(totalMinutes / activeDays) : 0;
  const completionRate = totalCount + abandonedCount ? Math.round((totalCount / (totalCount + abandonedCount)) * 100) : 0;
  const intenseDays = monthCalendar.filter((item) => item.focusMinutes >= 90).length;
  const quietDays = monthCalendar.filter((item) => item.focusMinutes === 0 && item.abandonedCount === 0).length;
  const selectedHeatRatio = selected ? Math.min(100, Math.round((selected.focusMinutes / Math.max(120, maxMinutes)) * 100)) : 0;
  const bestDayText = bestDay && bestDay.focusMinutes > 0 ? `本月最高：${dateTitle(bestDay.date)} ${formatMinutes(bestDay.focusMinutes)}` : "";

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
        <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 max-h-[82vh] w-[calc(100%-28px)] max-w-[410px] rounded-[28px] border-white/80 bg-white/90 p-5 shadow-[0_18px_46px_rgba(120,70,90,0.18)] backdrop-blur-[20px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="flex items-center gap-2 text-lg font-black">
                <CalendarDays size={18} />
                热力图
              </Dialog.Title>
              <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{month}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => setMonthDate((date) => shiftMonth(date, -1))} type="button" aria-label="上个月">
                <ChevronLeft size={17} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => setMonthDate((date) => shiftMonth(date, 1))} type="button" aria-label="下个月">
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
              <p className="text-xs font-bold text-[var(--app-muted)]">总时长</p>
              <p className="mt-1 text-sm font-black">{formatMinutes(totalMinutes)}</p>
            </div>
            <div className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
              <p className="text-xs font-bold text-[var(--app-muted)]">次数</p>
              <p className="mt-1 text-lg font-black">{totalCount}</p>
            </div>
            <div className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
              <p className="text-xs font-bold text-[var(--app-muted)]">活跃</p>
              <p className="mt-1 text-lg font-black">{activeDays}</p>
            </div>
            <div className="rounded-[18px] bg-[var(--app-card-soft)] p-3">
              <p className="text-xs font-bold text-[var(--app-muted)]">放弃</p>
              <p className="mt-1 text-lg font-black">{abandonedCount}</p>
            </div>
          </div>

          {isFetching || bestDayText ? <p className="mt-3 text-sm font-bold text-[var(--app-muted)]">{isFetching ? "同步中..." : bestDayText}</p> : null}

          {hasData || isFetching ? (
            <>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-[18px] bg-[var(--app-card-soft)] px-3 py-2">
                  <p className="text-xs font-bold text-[var(--app-muted)]">活跃日均</p>
                  <p className="mt-1 text-sm font-black">{formatMinutes(averageActiveMinutes)}</p>
                </div>
                <div className="rounded-[18px] bg-[var(--app-card-soft)] px-3 py-2">
                  <p className="text-xs font-bold text-[var(--app-muted)]">完成率</p>
                  <p className="mt-1 text-sm font-black">{completionRate}%</p>
                </div>
                <div className="rounded-[18px] bg-[var(--app-card-soft)] px-3 py-2">
                  <p className="text-xs font-bold text-[var(--app-muted)]">高热天数</p>
                  <p className="mt-1 text-sm font-black">{intenseDays} 天</p>
                </div>
                <div className="rounded-[18px] bg-[var(--app-card-soft)] px-3 py-2">
                  <p className="text-xs font-bold text-[var(--app-muted)]">空白天数</p>
                  <p className="mt-1 text-sm font-black">{quietDays} 天</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[11px] font-black text-[var(--app-muted)]">
                {weekDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
                {calendarCells.map((item, index) =>
                  item ? (
                    <button
                      key={item.date}
                      className={`relative flex aspect-square items-center justify-center rounded-xl border border-[var(--app-border)] text-[10px] font-black text-[var(--app-text)] ${selected?.date === item.date ? "ring-2 ring-[var(--app-primary)]" : ""}`}
                      onClick={() => setSelectedDate(item.date)}
                      style={{ backgroundColor: intensityColor(item.focusMinutes, maxMinutes) }}
                      type="button"
                    >
                      {Number(item.date.slice(-2))}
                      {item.abandonedCount > 0 ? <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[var(--app-danger)]" /> : null}
                    </button>
                  ) : (
                    <span key={`blank-${index}`} />
                  )
                )}
              </div>
              {selected ? (
                <div className="mt-4 rounded-[20px] bg-[var(--app-card-soft)] p-3">
                  <p className="text-sm font-black">{dateTitle(selected.date)}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="flex min-h-[58px] flex-col items-center justify-center rounded-[16px] bg-white/70 px-2 py-2">
                      <p className="text-base font-black leading-5">{selected.focusCount}</p>
                      <p className="text-xs font-bold text-[var(--app-muted)]">专注次数</p>
                    </div>
                    <div className="flex min-h-[58px] flex-col items-center justify-center rounded-[16px] bg-white/70 px-2 py-2">
                      <p className="text-base font-black leading-5">{formatMinutes(selected.focusMinutes)}</p>
                      <p className="text-xs font-bold text-[var(--app-muted)]">专注时长</p>
                    </div>
                    <div className="flex min-h-[58px] flex-col items-center justify-center rounded-[16px] bg-white/70 px-2 py-2">
                      <p className="text-base font-black leading-5">{selected.abandonedCount}</p>
                      <p className="text-xs font-bold text-[var(--app-muted)]">放弃次数</p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-white/70 pt-3">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold text-[var(--app-muted)]">
                      <span>热度等级</span>
                      <span>{selected.focusMinutes >= 180 ? "很高" : selected.focusMinutes >= 90 ? "较高" : selected.focusMinutes >= 30 ? "中等" : selected.focusMinutes > 0 ? "轻量" : "空白"}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
                      <div className="h-full rounded-full bg-[var(--app-primary-strong)]" style={{ width: `${selectedHeatRatio}%` }} />
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <StatsEmptyState title="暂无数据" description="完成一次专注后，这里会出现你的月度热力图。" />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
