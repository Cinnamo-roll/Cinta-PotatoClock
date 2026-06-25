import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Pencil, Trash2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { sessionsApi } from "@/api/sessions";
import { statsApi } from "@/api/stats";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { StatsEmptyState } from "@/components/stats/StatsEmptyState";
import { formatMinutes, timeText } from "@/components/stats/statsFormat";
import { useDeleteCheckinMutation, useDeleteTimerSessionMutation, useUpdateCheckinMutation, useUpdateTimerSessionMutation } from "@/hooks/useApiQueries";
import { useUiStore } from "@/stores/uiStore";
import type { CheckinRecordItem } from "@/types/stats";
import type { TimerSession } from "@/types/session";

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

function inputTime(value: string) {
  return value.slice(11, 16);
}

function localDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

function minutesBetween(date: string, startTime: string, endTime: string) {
  const startedAt = new Date(localDateTime(date, startTime));
  const endedAt = new Date(localDateTime(date, endTime));
  return Math.floor((endedAt.getTime() - startedAt.getTime()) / 60000);
}

function checkinWindowText(record: HistoryRecord | null) {
  if (record?.kind !== "checkin") return "";
  if (record.checkin.type === "wakeup") return "可选时间：05:00 到 12:00 前";
  if (record.checkin.type === "sleep") return "可选时间：20:00 到次日 02:00 前";
  return "可选时间：当天任意时间";
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
  return formatMinutes(Math.floor((session.actualSeconds ?? session.actualMinutes * 60) / 60));
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
      date: session.startedAt.slice(0, 10),
      time: session.startedAt.slice(11, 16),
      session
    })),
    ...checkins.map((checkin) => ({
      kind: "checkin" as const,
      id: checkin.id,
      date: checkin.checkinTime.slice(0, 10),
      time: checkin.checkinTime.slice(11, 16),
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

function RecordCard({ record, onLongPress }: { record: HistoryRecord; onLongPress: (record: HistoryRecord) => void }) {
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  return (
    <button
      className="w-full rounded-[18px] bg-[var(--app-card-soft)] p-3 text-left transition active:scale-[0.99]"
      onPointerDown={() => {
        clearTimer();
        timerRef.current = window.setTimeout(() => onLongPress(record), 520);
      }}
      onPointerLeave={clearTimer}
      onPointerUp={clearTimer}
      onPointerCancel={clearTimer}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm font-black">{record.kind === "focus" ? record.session.taskTitle || "未命名待办" : checkinText[record.checkin.type]}</p>
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
    </button>
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
  const [activeRecord, setActiveRecord] = useState<HistoryRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HistoryRecord | null>(null);
  const [startTimeText, setStartTimeText] = useState("");
  const [endTimeText, setEndTimeText] = useState("");
  const [checkinTimeText, setCheckinTimeText] = useState("");
  const month = monthText(monthDate);
  const range = monthRange(month);

  useEffect(() => {
    if (selectedDate.slice(0, 7) !== month) setSelectedDate(`${month}-01`);
  }, [month, selectedDate]);

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
    const completed = focusRecords.filter((record) => record.session.completed && !record.session.interrupted);
    const seconds = completed.reduce((sum, record) => sum + (record.session.actualSeconds ?? record.session.actualMinutes * 60), 0);
    return {
      focusCount: completed.length,
      focusMinutes: Math.floor(seconds / 60),
      abandonedCount: focusRecords.filter((record) => record.session.interrupted || !record.session.completed).length,
      checkinCount: selectedRecords.filter((record) => record.kind === "checkin").length
    };
  }, [selectedRecords]);
  const calendarCells = useMemo(() => {
    const blanks = Array.from({ length: monthStartOffset(month) }, () => null);
    const days = Array.from({ length: daysInMonth(month) }, (_, index) => `${month}-${pad(index + 1)}`);
    return [...blanks, ...days];
  }, [month]);

  const openEdit = () => {
    if (!activeRecord) return;
    if (activeRecord.kind === "focus") {
      setStartTimeText(inputTime(activeRecord.session.startedAt));
      setEndTimeText(inputTime(activeRecord.session.endedAt));
    } else {
      setCheckinTimeText(inputTime(activeRecord.checkin.checkinTime));
    }
    setEditingRecord(activeRecord);
    setActiveRecord(null);
  };

  const removeRecord = async () => {
    if (!activeRecord) return;
    try {
      if (activeRecord.kind === "focus") await deleteSession.mutateAsync(activeRecord.id);
      else await deleteCheckin.mutateAsync(activeRecord.id);
      toast({ title: "记录已删除", tone: "success" });
      setActiveRecord(null);
      setConfirmDelete(false);
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "删除失败", tone: "error" });
    }
  };

  const saveEdit = async () => {
    if (!editingRecord) return;
    if (editingRecord.kind === "focus") {
      const actualMinutes = minutesBetween(editingRecord.date, startTimeText, endTimeText);
      if (!startTimeText || !endTimeText || actualMinutes < 1 || actualMinutes > 1440) {
        toast({ title: "请选择有效的开始和结束时间", description: "结束时间需要晚于开始时间，最长 24 小时。", tone: "error" });
        return;
      }
      try {
        await updateSession.mutateAsync({
          id: editingRecord.id,
          payload: {
            startedAt: localDateTime(editingRecord.date, startTimeText),
            endedAt: localDateTime(editingRecord.date, endTimeText)
          }
        });
        toast({ title: "专注时间段已更新", tone: "success" });
        setEditingRecord(null);
      } catch (error) {
        toast({ title: error instanceof Error ? error.message : "修改失败", tone: "error" });
      }
      return;
    }

    if (!checkinTimeText) {
      toast({ title: "请选择打卡时间", tone: "error" });
      return;
    }
    try {
      await updateCheckin.mutateAsync({ id: editingRecord.id, payload: { checkinTime: localDateTime(editingRecord.date, checkinTimeText) } });
      toast({ title: "打卡时间已更新", tone: "success" });
      setEditingRecord(null);
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "修改失败", tone: "error" });
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
          <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 max-h-[82vh] w-[calc(100%-28px)] max-w-[410px] rounded-[28px] border-white/80 bg-white/90 p-5 shadow-[0_18px_46px_rgba(120,70,90,0.18)] backdrop-blur-[20px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="flex items-center gap-2 text-lg font-black">
                  <CalendarDays size={18} />
                  历史记录
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
                  <p className="text-sm font-black">{formatMinutes(selectedSummary.focusMinutes)}</p>
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
                {selectedRecords.length ? selectedRecords.map((record) => <RecordCard key={`${record.kind}-${record.id}`} record={record} onLongPress={(nextRecord) => setActiveRecord(nextRecord)} />) : <StatsEmptyState title="这一天还没有记录" description="换个日期看看。" />}
              </div>
            </section>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={activeRecord !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setActiveRecord(null);
            setConfirmDelete(false);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-[rgba(38,35,42,0.18)]" />
          <Dialog.Content className="app-dialog-panel app-modal-scroll z-[70] max-h-[90vh] w-[calc(100%-48px)] max-w-[360px] rounded-[28px] border-white/80 bg-white p-5 shadow-[0_18px_46px_rgba(120,70,90,0.18)]">
            <Dialog.Close className="absolute right-4 top-4 rounded-full bg-[var(--app-primary-soft)] p-2 text-[var(--app-text)]" aria-label="关闭">
              <X size={16} />
            </Dialog.Close>
            <Dialog.Title className="text-lg font-black">{confirmDelete ? "确认删除这条记录？" : activeRecord?.kind === "focus" ? "专注记录" : "打卡记录"}</Dialog.Title>
            <p className="mt-1 text-sm text-[var(--app-muted)]">{confirmDelete ? "删除后统计会同步更新，无法撤回。" : "选择要对这条记录做什么。"}</p>
            {confirmDelete ? (
              <div className="mt-5 grid gap-3">
                <Button variant="danger" onClick={() => void removeRecord()} disabled={deleteSession.isPending || deleteCheckin.isPending}>
                  删除
                </Button>
                <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                  取消
                </Button>
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {activeRecord?.kind === "focus" ? (
                  <Button variant="secondary" onClick={openEdit}>
                    <Pencil size={16} />
                    修改时间段
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={openEdit}>
                    <Pencil size={16} />
                    修改打卡时间
                  </Button>
                )}
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={16} />
                  删除记录
                </Button>
                <Button variant="ghost" onClick={() => setActiveRecord(null)}>
                  关闭
                </Button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={editingRecord !== null} onOpenChange={(nextOpen) => !nextOpen && setEditingRecord(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-[rgba(38,35,42,0.18)]" />
          <Dialog.Content className="app-dialog-panel app-modal-scroll z-[70] max-h-[90vh] w-[calc(100%-56px)] max-w-[340px] rounded-[28px] p-5">
            <Dialog.Close className="absolute right-4 top-4 rounded-full bg-[var(--app-primary-soft)] p-2 text-[var(--app-text)]" aria-label="关闭">
              <X size={16} />
            </Dialog.Close>
            <Dialog.Title className="flex items-center gap-2 text-lg font-black">
              <Clock3 size={17} />
              {editingRecord?.kind === "focus" ? "修改专注时间段" : "修改打卡时间"}
            </Dialog.Title>
            {editingRecord?.kind === "focus" ? (
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-black text-[var(--app-muted)]">开始时间</span>
                  <Input className="mt-1" type="time" step={300} value={startTimeText} onChange={(event) => setStartTimeText(event.target.value)} />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-[var(--app-muted)]">结束时间</span>
                  <Input className="mt-1" type="time" step={300} value={endTimeText} onChange={(event) => setEndTimeText(event.target.value)} />
                </label>
                <p className="rounded-2xl bg-[var(--app-card-soft)] px-3 py-2 text-xs font-bold text-[var(--app-muted)]">
                  当前时长：{formatMinutes(Math.max(0, minutesBetween(editingRecord.date, startTimeText, endTimeText)))} · 时间刻度 5分钟
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-black text-[var(--app-muted)]">打卡时间</span>
                  <Input className="mt-1" type="time" step={300} value={checkinTimeText} onChange={(event) => setCheckinTimeText(event.target.value)} />
                </label>
                <p className="rounded-2xl bg-[var(--app-card-soft)] px-3 py-2 text-xs font-bold text-[var(--app-muted)]">
                  {checkinWindowText(editingRecord)} · 时间刻度 5分钟
                </p>
              </div>
            )}
            <Button className="mt-4 w-full" onClick={() => void saveEdit()} disabled={updateSession.isPending || updateCheckin.isPending}>
              {updateSession.isPending || updateCheckin.isPending ? "保存中..." : "保存"}
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
