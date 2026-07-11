import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { sessionsApi } from "@/api/sessions";
import { statsApi } from "@/api/stats";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import { buildFocusTimeRange, clockTimeFromDateTime, clockTimeParts } from "@/components/stats/focusTimeRange";
import { formatDuration, formatMinutes, timeText } from "@/components/stats/statsFormat";
import { useDeleteCheckinMutation, useDeleteTimerSessionMutation, useUpdateCheckinMutation, useUpdateTimerSessionMutation } from "@/hooks/useApiQueries";
import { useUiStore } from "@/stores/uiStore";
import type { CheckinRecordItem } from "@/types/stats";
import type { TimerSession } from "@/types/session";
import { checkinBusinessDate } from "@/services/checkinService";
import { addLocalDays } from "@/utils/date";
import { formatSeconds } from "@/utils/format";

type HistoryRecord =
  | { kind: "focus"; id: number; date: string; time: string; session: TimerSession }
  | { kind: "checkin"; id: number; date: string; time: string; checkin: CheckinRecordItem };

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

const timerTypeText = {
  countdown: "倒计时",
  countup: "正计时",
  none: "不计时"
};

const categoryText = {
  normal: "普通待办",
  habit: "习惯",
  goal: "目标"
};

const checkinText = {
  wakeup: "起床打卡",
  focus_today: "今日专注打卡",
  sleep: "睡眠打卡"
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function monthText(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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

function monthRange(month: string) {
  return {
    startDate: `${month}-01`,
    endDate: `${month}-${pad(daysInMonth(month))}`
  };
}

function dateTitle(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" });
}

function recordTime(value: string) {
  return timeText(value);
}

function localDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

function checkinDateTime(record: Extract<HistoryRecord, { kind: "checkin" }>, time: string) {
  const date = record.checkin.type === "sleep" && time < "02:00" ? addLocalDays(record.date, 1) : record.date;
  return localDateTime(date, time);
}

function checkinWindowText(record: HistoryRecord | null) {
  if (record?.kind !== "checkin") return "";
  if (record.checkin.type === "wakeup") return "可选时间：05:00 到 12:00 前";
  if (record.checkin.type === "sleep") return "可选时间：20:00 到次日 02:00 前";
  return "可选时间：当天任意时间";
}

function isCheckinTimeAllowed(record: Extract<HistoryRecord, { kind: "checkin" }>, time: string) {
  if (record.checkin.type === "wakeup") return time >= "05:00" && time < "12:00";
  if (record.checkin.type === "sleep") return time >= "20:00" || time < "02:00";
  return true;
}

function fullDateTime(value?: string | null) {
  if (!value) return "未记录";
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function focusStatusText(session: TimerSession) {
  if (session.completed && !session.interrupted) return "已完成";
  if (session.interrupted) return "已放弃";
  return "未完成";
}

function focusMinutesText(session: TimerSession) {
  if (session.timerType === "none") return "完成记录";
  const seconds = session.actualSeconds ?? session.actualMinutes * 60;
  return seconds < 60 ? formatSeconds(seconds) : formatMinutes(Math.floor(seconds / 60));
}

function recordNoteText(value?: string | null) {
  return value?.trim() || "未填写";
}

function sortRecords(a: HistoryRecord, b: HistoryRecord) {
  return a.time.localeCompare(b.time);
}

function toRecords(sessions: TimerSession[], checkins: CheckinRecordItem[]): HistoryRecord[] {
  return [
    ...sessions.map((session) => ({
      kind: "focus" as const,
      id: session.id,
      date: dateKey(new Date(session.startedAt)),
      time: recordTime(session.startedAt),
      session
    })),
    ...checkins.map((checkin) => ({
      kind: "checkin" as const,
      id: checkin.id,
      date: checkinBusinessDate(checkin.type, new Date(checkin.checkinTime)),
      time: recordTime(checkin.checkinTime),
      checkin
    }))
  ].sort(sortRecords);
}

function RecordBadge({ record }: { record: HistoryRecord }) {
  if (record.kind === "checkin") {
    return <Badge className="border-[#D7E7F7] bg-[#EEF7FF] text-[#3574A8]">打卡</Badge>;
  }
  return (
    <Badge className={record.session.completed ? "border-[#CFEED8] bg-[#EAF8EF] text-[#31935A]" : "border-[#FAD0D5] bg-[#FFE8EA] text-[var(--app-danger)]"}>
      {record.session.completed ? "完成" : "放弃"}
    </Badge>
  );
}

function RecordCard({ record, onOpen }: { record: HistoryRecord; onOpen: (record: HistoryRecord) => void }) {
  return (
    <article className="relative w-full rounded-[18px] bg-[var(--app-card-soft)] p-3 pr-12 text-left">
      <button className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-card)] text-[var(--app-muted)]" onClick={() => onOpen(record)} type="button" aria-label="记录操作">
        <MoreHorizontal size={17} />
      </button>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate pr-1 text-sm font-black">{record.kind === "focus" ? record.session.taskTitle || "未命名待办" : checkinText[record.checkin.type]}</p>
        <RecordBadge record={record} />
      </div>
      {record.kind === "focus" ? (
        <div className="mt-2 space-y-2 text-xs font-semibold text-[var(--app-muted)]">
          <p>
            {timerTypeText[record.session.timerType]} · {recordTime(record.session.startedAt)}-{recordTime(record.session.endedAt)} · {focusMinutesText(record.session)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <span className="rounded-xl bg-white/70 px-2 py-1">状态：{focusStatusText(record.session)}</span>
            <span className="rounded-xl bg-white/70 px-2 py-1">事项：{categoryText[record.session.category ?? "normal"]}</span>
            <span className="rounded-xl bg-white/70 px-2 py-1">开始：{fullDateTime(record.session.startedAt)}</span>
            <span className="rounded-xl bg-white/70 px-2 py-1">结束：{fullDateTime(record.session.endedAt)}</span>
          </div>
          {record.session.note ? <p className="rounded-xl bg-white/70 px-2 py-1 leading-5">专注备注：{record.session.note}</p> : null}
          {record.session.interrupted || !record.session.completed ? (
            <p className="rounded-xl bg-[#FFF0F2] px-2 py-1 leading-5 text-[var(--app-danger)]">放弃备注：{recordNoteText(record.session.interruptReason)}</p>
          ) : null}
        </div>
      ) : (
        <div className="mt-2 space-y-2 text-xs font-semibold text-[var(--app-muted)]">
          <p>{recordTime(record.checkin.checkinTime)}</p>
          <p className="rounded-xl bg-white/70 px-2 py-1 leading-5">打卡备注：{recordNoteText(record.checkin.note)}</p>
          {record.checkin.updatedAt ? <p className="rounded-xl bg-white/70 px-2 py-1">最近修改：{fullDateTime(record.checkin.updatedAt)}</p> : null}
        </div>
      )}
    </article>
  );
}

type FocusHistoryScreen =
  | { kind: "calendar" }
  | { kind: "actions"; record: HistoryRecord }
  | { kind: "delete"; record: HistoryRecord }
  | { kind: "edit-focus"; record: Extract<HistoryRecord, { kind: "focus" }>; startTime: string; endTime: string; submitError: string }
  | { kind: "edit-checkin"; record: Extract<HistoryRecord, { kind: "checkin" }>; time: string; submitError: string };

const hourOptions = Array.from({ length: 24 }, (_, index) => pad(index));
const minuteOptions = Array.from({ length: 60 }, (_, index) => pad(index));

function TimePartSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <span className="relative min-w-0 flex-1">
      <select
        aria-label={label}
        className="h-[52px] w-full appearance-none rounded-[18px] border border-[var(--app-border)] bg-[var(--app-card)] px-3 text-center text-lg font-black text-[var(--app-text)] outline-none focus:border-[var(--app-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--app-primary)_16%,transparent)]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--app-muted)]" size={15} />
    </span>
  );
}

function TimeSelectField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const parts = clockTimeParts(value);
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-xs font-black text-[var(--app-muted)]">{label}</legend>
      <div className="flex min-w-0 items-center gap-2">
        <TimePartSelect label={`${label}小时`} value={parts.hours} options={hourOptions} onChange={(hours) => onChange(`${hours}:${parts.minutes}`)} />
        <span aria-hidden="true" className="text-xl font-black text-[var(--app-muted)]">
          :
        </span>
        <TimePartSelect label={`${label}分钟`} value={parts.minutes} options={minuteOptions} onChange={(minutes) => onChange(`${parts.hours}:${minutes}`)} />
      </div>
    </fieldset>
  );
}

function RecordIdentity({ record }: { record: HistoryRecord }) {
  return (
    <div className="rounded-[20px] bg-[var(--app-card-soft)] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm font-black">{record.kind === "focus" ? record.session.taskTitle || "未命名待办" : checkinText[record.checkin.type]}</p>
        <RecordBadge record={record} />
      </div>
      <p className="mt-1 text-xs font-semibold text-[var(--app-muted)]">
        {dateTitle(record.date)} · {record.kind === "focus" ? `${recordTime(record.session.startedAt)}-${recordTime(record.session.endedAt)}` : recordTime(record.checkin.checkinTime)}
      </p>
    </div>
  );
}

interface FocusHistoryDrawerProps {
  open: boolean;
  collectionId?: number | null;
  todoId?: number | null;
  includeCheckins?: boolean;
  onClose: () => void;
}

export function FocusHistoryDrawer({ open, collectionId = null, todoId = null, includeCheckins = true, onClose }: FocusHistoryDrawerProps) {
  const toast = useUiStore((state) => state.toast);
  const updateSession = useUpdateTimerSessionMutation();
  const updateCheckin = useUpdateCheckinMutation();
  const deleteSession = useDeleteTimerSessionMutation();
  const deleteCheckin = useDeleteCheckinMutation();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [screen, setScreen] = useState<FocusHistoryScreen>({ kind: "calendar" });
  const month = monthText(monthDate);
  const range = monthRange(month);

  useEffect(() => {
    if (selectedDate.slice(0, 7) !== month) setSelectedDate(`${month}-01`);
  }, [month, selectedDate]);

  useEffect(() => {
    if (!open) setScreen({ kind: "calendar" });
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ["history-records", month, collectionId, todoId, includeCheckins],
    queryFn: async () => {
      const [sessions, checkins] = await Promise.all([
        sessionsApi.month(month, { collectionId, todoId }),
        includeCheckins ? statsApi.checkins(range.startDate, range.endDate) : Promise.resolve([])
      ]);
      return { sessions, checkins };
    },
    enabled: open,
    staleTime: 10_000
  });

  const records = useMemo(() => toRecords(data?.sessions ?? [], data?.checkins ?? []), [data]);
  const recordsByDate = useMemo(
    () =>
      records.reduce<Record<string, HistoryRecord[]>>((acc, record) => {
        acc[record.date] = [...(acc[record.date] ?? []), record];
        return acc;
      }, {}),
    [records]
  );
  const selectedRecords = recordsByDate[selectedDate] ?? [];
  const selectedSummary = useMemo(() => {
    const focusRecords = selectedRecords.filter((record) => record.kind === "focus");
    const completed = focusRecords.filter(
      (record) => record.session.completed && !record.session.interrupted && record.session.timerType !== "none" && record.session.countToStats !== false
    );
    const seconds = completed.reduce((sum, record) => sum + (record.session.actualSeconds ?? record.session.actualMinutes * 60), 0);
    return {
      focusCount: completed.length,
      focusSeconds: seconds,
      abandonedCount: focusRecords.filter((record) => record.session.interrupted || !record.session.completed).length,
      checkinCount: selectedRecords.filter((record) => record.kind === "checkin").length
    };
  }, [selectedRecords]);
  const calendarCells = useMemo(() => {
    const blanks = Array.from({ length: monthStartOffset(month) }, () => null);
    const days = Array.from({ length: daysInMonth(month) }, (_, index) => `${month}-${pad(index + 1)}`);
    return [...blanks, ...days];
  }, [month]);

  const showEditor = (record: HistoryRecord) => {
    if (record.kind === "focus") {
      setScreen({
        kind: "edit-focus",
        record,
        startTime: clockTimeFromDateTime(record.session.startedAt),
        endTime: clockTimeFromDateTime(record.session.endedAt),
        submitError: ""
      });
      return;
    }
    setScreen({ kind: "edit-checkin", record, time: clockTimeFromDateTime(record.checkin.checkinTime), submitError: "" });
  };

  const removeRecord = async () => {
    if (screen.kind !== "delete") return;
    const record = screen.record;
    try {
      if (record.kind === "focus") await deleteSession.mutateAsync(record.id);
      else await deleteCheckin.mutateAsync(record.id);
      toast({ title: "记录已删除", tone: "success" });
      setScreen({ kind: "calendar" });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "删除失败", tone: "error" });
    }
  };

  const saveFocusEdit = async () => {
    if (screen.kind !== "edit-focus") return;
    const result = buildFocusTimeRange(screen.record.date, screen.startTime, screen.endTime);
    if (!result.valid) {
      setScreen({ ...screen, submitError: result.message });
      return;
    }
    try {
      await updateSession.mutateAsync({ id: screen.record.id, payload: { startedAt: result.startedAt, endedAt: result.endedAt } });
      toast({ title: "专注时间段已更新", description: `${result.startTime}-${result.endTime} · ${formatMinutes(result.durationMinutes)}`, tone: "success" });
      setScreen({ kind: "calendar" });
    } catch (error) {
      setScreen({ ...screen, submitError: error instanceof Error ? error.message : "修改失败，请稍后再试。" });
    }
  };

  const saveCheckinEdit = async () => {
    if (screen.kind !== "edit-checkin") return;
    if (!isCheckinTimeAllowed(screen.record, screen.time)) {
      setScreen({ ...screen, submitError: checkinWindowText(screen.record) });
      return;
    }
    try {
      await updateCheckin.mutateAsync({ id: screen.record.id, payload: { checkinTime: checkinDateTime(screen.record, screen.time) } });
      toast({ title: "打卡时间已更新", tone: "success" });
      setScreen({ kind: "calendar" });
    } catch (error) {
      setScreen({ ...screen, submitError: error instanceof Error ? error.message : "修改失败，请稍后再试。" });
    }
  };

  const goBack = () => {
    if (screen.kind === "calendar") {
      onClose();
      return;
    }
    if (screen.kind === "edit-focus" || screen.kind === "edit-checkin" || screen.kind === "delete") {
      setScreen({ kind: "actions", record: screen.record });
      return;
    }
    setScreen({ kind: "calendar" });
  };

  const focusEditRange = screen.kind === "edit-focus" ? buildFocusTimeRange(screen.record.date, screen.startTime, screen.endTime) : null;

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.22)] backdrop-blur-[2px]" />
        <Dialog.Content
          className="app-dialog-panel app-modal-scroll z-50 max-h-[calc(var(--visual-viewport-height)-var(--safe-top)-var(--safe-bottom)-1.5rem)] w-[calc(100%-28px)] max-w-[410px] overflow-x-hidden rounded-[28px] border-white/80 bg-white/92 p-5 pb-[max(1.25rem,var(--safe-bottom))] shadow-[0_18px_46px_rgba(120,70,90,0.18)] backdrop-blur-[20px]"
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            goBack();
          }}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          {screen.kind === "calendar" ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Dialog.Title className="flex items-center gap-2 text-lg font-black">
                    <CalendarDays size={18} />
                    历史记录
                  </Dialog.Title>
                  <p className="mt-1 text-xs font-bold text-[var(--app-muted)]">{month}</p>
                </div>
                <div className="flex gap-2 pr-11">
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => setMonthDate((date) => shiftMonth(date, -1))} type="button" aria-label="上个月">
                    <ChevronLeft size={17} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" onClick={() => setMonthDate((date) => shiftMonth(date, 1))} type="button" aria-label="下个月">
                    <ChevronRight size={17} />
                  </button>
                </div>
                <button className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-text)]" type="button" onClick={onClose} aria-label="关闭历史记录">
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-black text-[var(--app-muted)]">
                {weekDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
                {calendarCells.map((day, index) =>
                  day ? (
                    <button
                      key={day}
                      className={[
                        "relative flex aspect-square items-center justify-center rounded-2xl text-sm font-black transition",
                        day === selectedDate ? "bg-[var(--app-primary)] text-[var(--app-text)]" : "bg-[var(--app-card-soft)] text-[var(--app-text)]"
                      ].join(" ")}
                      onClick={() => setSelectedDate(day)}
                      type="button"
                    >
                      {Number(day.slice(-2))}
                      {recordsByDate[day]?.length ? <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-[var(--app-primary-strong)]" /> : null}
                    </button>
                  ) : (
                    <span key={`blank-${index}`} />
                  )
                )}
              </div>

              <section className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black">{dateTitle(selectedDate)}</p>
                  <p className="text-xs font-bold text-[var(--app-muted)]">{isFetching ? "同步中" : `${selectedRecords.length} 条记录`}</p>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  <div className="rounded-[16px] bg-[var(--app-card-soft)] px-2 py-2 text-center">
                    <p className="text-base font-black">{selectedSummary.focusCount}</p>
                    <p className="text-[10px] font-bold text-[var(--app-muted)]">完成</p>
                  </div>
                  <div className="rounded-[16px] bg-[var(--app-card-soft)] px-2 py-2 text-center">
                    <p className="text-sm font-black">{formatDuration(selectedSummary.focusSeconds)}</p>
                    <p className="text-[10px] font-bold text-[var(--app-muted)]">时长</p>
                  </div>
                  <div className="rounded-[16px] bg-[var(--app-card-soft)] px-2 py-2 text-center">
                    <p className="text-base font-black text-[var(--app-danger)]">{selectedSummary.abandonedCount}</p>
                    <p className="text-[10px] font-bold text-[var(--app-muted)]">放弃</p>
                  </div>
                  <div className="rounded-[16px] bg-[var(--app-card-soft)] px-2 py-2 text-center">
                    <p className="text-base font-black">{selectedSummary.checkinCount}</p>
                    <p className="text-[10px] font-bold text-[var(--app-muted)]">打卡</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {selectedRecords.length ? selectedRecords.map((record) => <RecordCard key={`${record.kind}-${record.id}`} record={record} onOpen={(nextRecord) => setScreen({ kind: "actions", record: nextRecord })} />) : <StatsEmptyState title="这一天还没有记录" description="换个日期看看。" />}
                </div>
              </section>
            </>
          ) : null}

          {screen.kind === "actions" ? (
            <>
              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" type="button" onClick={() => setScreen({ kind: "calendar" })} aria-label="返回历史记录">
                  <ChevronLeft size={18} />
                </button>
                <Dialog.Title className="text-lg font-black">{screen.record.kind === "focus" ? "专注记录" : "打卡记录"}</Dialog.Title>
              </div>
              <div className="mt-4">
                <RecordIdentity record={screen.record} />
              </div>
              <div className="mt-5 grid gap-3">
                <Button variant="secondary" onClick={() => showEditor(screen.record)}>
                  <Pencil size={16} />
                  {screen.record.kind === "focus" ? "修改时间段" : "修改打卡时间"}
                </Button>
                <Button variant="danger" onClick={() => setScreen({ kind: "delete", record: screen.record })}>
                  <Trash2 size={16} />
                  删除记录
                </Button>
              </div>
            </>
          ) : null}

          {screen.kind === "delete" ? (
            <>
              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" type="button" onClick={() => setScreen({ kind: "actions", record: screen.record })} aria-label="返回记录操作">
                  <ChevronLeft size={18} />
                </button>
                <Dialog.Title className="text-lg font-black">确认删除这条记录？</Dialog.Title>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">删除后统计会同步更新，且无法撤回。</p>
              <div className="mt-5 grid gap-3">
                <Button variant="danger" onClick={() => void removeRecord()} disabled={deleteSession.isPending || deleteCheckin.isPending}>
                  {deleteSession.isPending || deleteCheckin.isPending ? "删除中..." : "确认删除"}
                </Button>
                <Button variant="secondary" onClick={() => setScreen({ kind: "actions", record: screen.record })}>
                  取消
                </Button>
              </div>
            </>
          ) : null}

          {screen.kind === "edit-focus" ? (
            <>
              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" type="button" onClick={() => setScreen({ kind: "actions", record: screen.record })} aria-label="返回专注记录">
                  <ChevronLeft size={18} />
                </button>
                <Dialog.Title className="flex min-w-0 items-center gap-2 text-lg font-black">
                  <Clock3 size={18} />
                  修改专注时间段
                </Dialog.Title>
              </div>
              <div className="mt-4">
                <RecordIdentity record={screen.record} />
              </div>
              <div className="mt-4 space-y-4">
                <TimeSelectField label="开始时间" value={screen.startTime} onChange={(startTime) => setScreen({ ...screen, startTime, submitError: "" })} />
                <TimeSelectField label="结束时间" value={screen.endTime} onChange={(endTime) => setScreen({ ...screen, endTime, submitError: "" })} />
                <div className={["rounded-[18px] px-4 py-3", focusEditRange?.valid ? "bg-[var(--app-card-soft)]" : "bg-[#FFF0F2]"].join(" ")}>
                  {focusEditRange?.valid ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-black text-[var(--app-muted)]">修改后时长</span>
                        <strong className="text-base font-black text-[var(--app-text)]">{formatMinutes(focusEditRange.durationMinutes)}</strong>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-[var(--app-muted)]">{focusEditRange.crossesMidnight ? "结束时间按次日计算" : "开始和结束位于同一天"}</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-[var(--app-danger)]">{focusEditRange?.message ?? "请选择有效时间"}</p>
                  )}
                </div>
                {screen.submitError ? <p role="alert" className="rounded-[18px] bg-[#FFF0F2] px-4 py-3 text-sm font-bold text-[var(--app-danger)]">{screen.submitError}</p> : null}
              </div>
              <Button className="mt-5 w-full" onClick={() => void saveFocusEdit()} disabled={!focusEditRange?.valid || updateSession.isPending}>
                {updateSession.isPending ? "保存中..." : "保存时间段"}
              </Button>
            </>
          ) : null}

          {screen.kind === "edit-checkin" ? (
            <>
              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]" type="button" onClick={() => setScreen({ kind: "actions", record: screen.record })} aria-label="返回打卡记录">
                  <ChevronLeft size={18} />
                </button>
                <Dialog.Title className="flex min-w-0 items-center gap-2 text-lg font-black">
                  <Clock3 size={18} />
                  修改打卡时间
                </Dialog.Title>
              </div>
              <div className="mt-4">
                <RecordIdentity record={screen.record} />
              </div>
              <div className="mt-4 space-y-4">
                <TimeSelectField label="打卡时间" value={screen.time} onChange={(time) => setScreen({ ...screen, time, submitError: "" })} />
                <p className="rounded-[18px] bg-[var(--app-card-soft)] px-4 py-3 text-xs font-bold leading-5 text-[var(--app-muted)]">{checkinWindowText(screen.record)}</p>
                {screen.submitError ? <p role="alert" className="rounded-[18px] bg-[#FFF0F2] px-4 py-3 text-sm font-bold text-[var(--app-danger)]">{screen.submitError}</p> : null}
              </div>
              <Button className="mt-5 w-full" onClick={() => void saveCheckinEdit()} disabled={updateCheckin.isPending}>
                {updateCheckin.isPending ? "保存中..." : "保存打卡时间"}
              </Button>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
