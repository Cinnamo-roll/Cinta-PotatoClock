/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleStop,
  Clock3,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  XCircle
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CuteEmptyState } from "@/components/common/CuteEmptyState";
import { GuestPreviewBanner } from "@/components/common/GuestPreviewBanner";
import { useCreateTimerSessionMutation, useTimerSessionsRangeQuery, useTodoQuery, useUpdateTodoStatusMutation } from "@/hooks/useApiQueries";
import { useTodayKey } from "@/hooks/useTodayKey";
import { lightImpact, successFeedback, warningFeedback } from "@/services/hapticsService";
import { cancelFocusNotification, scheduleFocusEndNotification } from "@/services/notificationService";
import { playFocusDoneSound } from "@/services/soundService";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";
import { useTimerStore } from "@/stores/timerStore";
import { useUiStore } from "@/stores/uiStore";
import { formatSeconds } from "@/utils/format";
import { cn } from "@/utils/cn";
import { isTodoCompleted, targetProgress, todayTodoMetrics, todoStreak } from "@/utils/todoMetrics";
import { localDateTime } from "@/utils/date";
import { noTimerCompletion } from "@/utils/session";
import type { TimerState } from "@/types/timer";
import type { TimerType } from "@/types/todo";
import type { TimerSessionInput } from "@/types/session";

const abandonReasons = ["计划有变", "被打断", "太累了", "不想做了", "其他"];

const timerTypeMeta: Record<TimerType, { label: string; accent: string; timeLabel: string }> = {
  countdown: {
    label: "倒计时",
    accent: "var(--app-primary-strong)",
    timeLabel: "剩余"
  },
  countup: {
    label: "正计时",
    accent: "#22A06B",
    timeLabel: "已专注"
  },
  none: {
    label: "不计时",
    accent: "#7C6F64",
    timeLabel: "手动专注"
  }
};

const stateLabel: Record<TimerState, string> = {
  idle: "待开始",
  running: "专注中",
  paused: "已暂停",
  completed: "已完成",
  abandoned: "已放弃",
  skipped: "已跳过"
};

export default function FocusPage() {
  const navigate = useNavigate();
  const params = useParams();
  const todoId = Number(params.todoId);
  const { data: todo, error, isError, isLoading } = useTodoQuery(todoId);
  const today = useTodayKey();
  const { data: timerSessions = [] } = useTimerSessionsRangeQuery("1970-01-01", today, { todoId }, Number.isFinite(todoId));
  const updateStatus = useUpdateTodoStatusMutation();
  const createSession = useCreateTimerSessionMutation();
  const toast = useUiStore((state) => state.toast);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const activeTodo = useTimerStore((state) => state.todo);
  const timerType = useTimerStore((state) => state.timerType);
  const timerState = useTimerStore((state) => state.state);
  const durationSeconds = useTimerStore((state) => state.durationSeconds);
  const remainingSeconds = useTimerStore((state) => state.remainingSeconds);
  const elapsedSeconds = useTimerStore((state) => state.elapsedSeconds);
  const startedAt = useTimerStore((state) => state.startedAt);
  const expectedEndAt = useTimerStore((state) => state.expectedEndAt);
  const finishedAt = useTimerStore((state) => state.finishedAt);
  const completedReason = useTimerStore((state) => state.completedReason);
  const recordedSessionKey = useTimerStore((state) => state.recordedSessionKey);
  const startTodo = useTimerStore((state) => state.startTodo);
  const start = useTimerStore((state) => state.start);
  const pause = useTimerStore((state) => state.pause);
  const resume = useTimerStore((state) => state.resume);
  const complete = useTimerStore((state) => state.complete);
  const abandon = useTimerStore((state) => state.abandon);
  const reset = useTimerStore((state) => state.reset);
  const tick = useTimerStore((state) => state.tick);
  const markSessionRecorded = useTimerStore((state) => state.markSessionRecorded);
  const [reasonPickerOpen, setReasonPickerOpen] = useState(false);
  const [instantCompleteOpen, setInstantCompleteOpen] = useState(false);
  const [shortTip, setShortTip] = useState(false);
  const savedState = useRef<string | null>(null);
  const scheduledKey = useRef<string | null>(null);
  const abandonReason = useRef<string | null>(null);
  const mismatchToast = useRef<string | null>(null);
  const exitAfterAbandon = useRef(false);
  const abandonSubmitted = useRef(false);

  useEffect(() => {
    if (!todo) return;
    const isAnotherLockedTodo = activeTodo?.id !== todo.id && (timerState === "running" || timerState === "paused");
    if (isAnotherLockedTodo) return;
    if (activeTodo?.id !== todo.id) {
      startTodo(todo);
    }
  }, [activeTodo?.id, startTodo, timerState, todo]);

  useEffect(() => {
    if (!todo || !activeTodo || activeTodo.id === todo.id || (timerState !== "running" && timerState !== "paused")) return;
    const key = `${activeTodo.id}-${todo.id}`;
    if (mismatchToast.current !== key) {
      mismatchToast.current = key;
      toast({ title: "已有待办正在计时", description: `先处理「${activeTodo.title}」`, durationMs: 4200 });
    }
    navigate(`/focus/${activeTodo.id}`, { replace: true });
  }, [activeTodo, navigate, timerState, todo, toast]);

  useEffect(() => {
    if (!activeTodo || timerType !== "countdown" || timerState !== "running" || !expectedEndAt) return;
    const key = `${activeTodo.id}-${expectedEndAt}`;
    if (scheduledKey.current === key) return;
    scheduledKey.current = key;
    void scheduleFocusEndNotification({
      todoId: activeTodo.id,
      todoTitle: activeTodo.title,
      endAt: new Date(expectedEndAt).toISOString()
    });
  }, [activeTodo, expectedEndAt, timerState, timerType]);

  useEffect(() => {
    const interval = window.setInterval(() => tick(), 500);
    const onVisibility = () => tick();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [tick]);

  const displayTime = useMemo(() => {
    if (timerType === "countdown") return formatSeconds(remainingSeconds);
    return formatSeconds(elapsedSeconds);
  }, [elapsedSeconds, remainingSeconds, timerType]);

  useEffect(() => {
    document.title = timerState === "completed" ? "专注完成" : `${displayTime} · ${stateLabel[timerState]}`;
  }, [displayTime, timerState]);

  useEffect(() => {
    if ((timerState !== "completed" && timerState !== "abandoned") || !activeTodo || !startedAt) return;
    const saveKey = `${activeTodo.id}-${timerState}-${finishedAt ?? ""}`;
    if (savedState.current === saveKey) return;
    if (recordedSessionKey === saveKey) return;
    savedState.current = saveKey;

    const endedAt = new Date(finishedAt ?? Date.now());
    const actualSeconds = Math.max(0, elapsedSeconds);
    void cancelFocusNotification(activeTodo.id);

    if (actualSeconds < 5) {
      setShortTip(true);
      if (settings.vibrationEnabled) void warningFeedback();
      void updateStatus.mutateAsync({ id: activeTodo.id, status: "todo" });
      reset();
      window.setTimeout(() => setShortTip(false), 3200);
      return;
    }

    const sessionPayload: TimerSessionInput = {
        taskId: activeTodo.id,
        collectionId: activeTodo.collectionId,
        taskTitle: activeTodo.title,
        mode: "focus",
        timerType,
        category: activeTodo.category,
        plannedMinutes: activeTodo.durationMinutes,
        actualMinutes: Math.max(1, Math.round(actualSeconds / 60)),
        actualSeconds,
        startedAt: localDateTime(new Date(startedAt)),
        endedAt: localDateTime(endedAt),
        completed: timerState === "completed",
        interrupted: timerState === "abandoned",
        interruptReason: timerState === "abandoned" ? abandonReason.current : undefined,
        countToStats: activeTodo.countToStats,
        note: activeTodo.note
      };

    if (timerState === "completed") {
      if (settings.vibrationEnabled) void successFeedback();
      void playFocusDoneSound(settings.soundEnabled);
      confetti({ particleCount: 80, spread: 62, origin: { y: 0.78 }, colors: ["#D7AD4A", "#6F8655", "#FFF8E7"] });
    } else if (settings.vibrationEnabled) {
      void warningFeedback();
    }
    const nextSessions =
      timerState === "completed"
        ? [
            ...timerSessions,
            {
              id: -Date.now(),
              taskId: activeTodo.id,
              collectionId: activeTodo.collectionId,
              taskTitle: activeTodo.title,
              mode: "focus" as const,
              timerType,
              category: activeTodo.category,
              plannedMinutes: activeTodo.durationMinutes,
              actualMinutes: Math.max(1, Math.round(actualSeconds / 60)),
              actualSeconds,
              startedAt: localDateTime(new Date(startedAt)),
              endedAt: localDateTime(endedAt),
              completed: true,
              interrupted: false,
              countToStats: activeTodo.countToStats,
              note: activeTodo.note
            }
          ]
        : timerSessions;
    const nextStatus = timerState === "completed" && isTodoCompleted(activeTodo, nextSessions) ? "done" : "todo";
    createSession.mutate(sessionPayload, {
      onSuccess: () => {
        markSessionRecorded(saveKey);
        void updateStatus.mutateAsync({ id: activeTodo.id, status: nextStatus });
        toast({
          title: timerState === "completed" ? "已完成" : "已放弃",
          description: `本次记录 ${formatSeconds(actualSeconds)}`,
          tone: timerState === "completed" ? "success" : "default"
        });
      },
      onError: (saveError) => {
        savedState.current = null;
        void updateStatus.mutateAsync({ id: activeTodo.id, status: "todo" });
        toast({
          title: "本次记录尚未保存",
          description: saveError instanceof Error ? saveError.message : "请检查网络后重试。",
          tone: "error",
          durationMs: 7000
        });
      }
    });
  }, [
    activeTodo,
    createSession,
    elapsedSeconds,
    finishedAt,
    markSessionRecorded,
    recordedSessionKey,
    reset,
    settings.soundEnabled,
    settings.vibrationEnabled,
    startedAt,
    timerState,
    timerType,
    toast,
    updateStatus
  ]);

  useEffect(() => {
    if (timerState !== "abandoned" || !exitAfterAbandon.current) return;
    exitAfterAbandon.current = false;
    abandonSubmitted.current = false;
    reset();
    navigate("/", { replace: true });
  }, [navigate, reset, timerState]);

  if (isLoading) {
    return (
      <div className="app-screen-bg mx-auto min-h-screen max-w-[430px] px-4 pb-4 pt-[calc(var(--safe-top)+1rem)]">
        <CuteEmptyState title="正在加载计时" description="请稍候" />
      </div>
    );
  }

  if (isError || !todo) {
    return (
      <div className="app-screen-bg mx-auto min-h-screen max-w-[430px] px-4 pb-4 pt-[calc(var(--safe-top)+1rem)]">
        <CuteEmptyState
          title="计时数据加载失败"
          description={error instanceof Error ? error.message : "请返回首页重新选择一个待办。"}
          actionLabel="返回首页"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  const meta = timerTypeMeta[timerType];
  const isRunning = timerState === "running";
  const isPaused = timerState === "paused";
  const isIdle = timerState === "idle";
  const isFinished = timerState === "completed" || timerState === "abandoned";
  const isLocked = timerState === "running" || timerState === "paused";
  const needsManualComplete = timerType !== "countdown" && isLocked;
  const countdownProgress = durationSeconds ? 1 - remainingSeconds / durationSeconds : 0;
  const primaryLabel = isRunning ? "暂停" : isPaused ? "继续" : isFinished ? "回到待办" : timerType === "none" ? "完成" : "开始专注";
  const PrimaryIcon = isRunning ? Pause : isFinished ? RotateCcw : timerType === "none" ? Check : Play;
  const focusTodo = activeTodo ?? todo;
  const focusProgress = targetProgress(focusTodo, timerSessions);
  const focusToday = todayTodoMetrics(focusTodo, timerSessions);
  const focusStreak = todoStreak(focusTodo, timerSessions);

  const handlePause = () => {
    pause();
    if (settings.vibrationEnabled) void lightImpact();
    if (activeTodo) void cancelFocusNotification(activeTodo.id);
    if (activeTodo) void updateStatus.mutateAsync({ id: activeTodo.id, status: "paused" });
  };

  const handleResume = () => {
    resume();
    if (settings.vibrationEnabled) void lightImpact();
    if (activeTodo) void updateStatus.mutateAsync({ id: activeTodo.id, status: "running" });
  };

  const handleStart = () => {
    abandonReason.current = null;
    savedState.current = null;
    start();
    if (settings.vibrationEnabled) void lightImpact();
    if (activeTodo) void updateStatus.mutateAsync({ id: activeTodo.id, status: "running" });
  };

  const handleInstantComplete = async () => {
    if (createSession.isPending) return;
    const item = activeTodo ?? todo;
    try {
      const completion = noTimerCompletion(item);
      await createSession.mutateAsync(completion);
      const completed = isTodoCompleted(item, [...timerSessions, { id: -Date.now(), ...completion }]);
      await updateStatus.mutateAsync({ id: item.id, status: completed ? "done" : "todo" });
      if (settings.vibrationEnabled) void successFeedback();
      toast({ title: "已完成", description: `今日第 ${focusToday.completedCount + 1} 次`, tone: "success" });
      setInstantCompleteOpen(false);
      reset();
      navigate("/");
    } catch (completeError) {
      toast({ title: "完成记录没有保存", description: completeError instanceof Error ? completeError.message : "请检查网络后再试。", tone: "error" });
    }
  };

  const handlePrimary = () => {
    if (isFinished) {
      reset();
      navigate("/");
      return;
    }
    if (timerType === "none" && isIdle) {
      setInstantCompleteOpen(true);
      return;
    }
    if (isRunning) {
      handlePause();
      return;
    }
    if (isPaused) {
      handleResume();
      return;
    }
    handleStart();
  };

  const handleComplete = () => {
    if (!needsManualComplete) return;
    complete("manual");
    if (settings.vibrationEnabled) void lightImpact();
  };

  const handleAbandon = (reason?: string | null) => {
    if (!isLocked) return;
    abandonSubmitted.current = true;
    abandonReason.current = reason ?? null;
    abandon();
    if (settings.vibrationEnabled) void lightImpact();
  };

  const handleBack = () => {
    if (isFinished) {
      reset();
      navigate("/");
      return;
    }
    if (!isLocked) {
      navigate("/");
      return;
    }
    exitAfterAbandon.current = true;
    setReasonPickerOpen(true);
    toast({ title: "专注中不能直接返回", description: "放弃本次专注后才会回到待办列表。", durationMs: 4200 });
  };

  const handleSoundToggle = async () => {
    const next = !settings.soundEnabled;
    await updateSettings({ soundEnabled: next });
    if (next) void playFocusDoneSound(true);
    toast({ title: next ? "铃声已开启" : "铃声已关闭" });
  };

  return (
    <>
      <div
        className={cn(
          "app-screen-bg app-scroll mx-auto flex min-h-[100dvh] max-w-[430px] flex-col overflow-x-hidden overflow-y-auto px-5 pt-[calc(var(--safe-top)+1.25rem)] text-[var(--app-text)]",
          isAuthenticated ? "pb-[calc(var(--safe-bottom)+18px)]" : "pb-[calc(var(--safe-bottom)+94px)]"
        )}
      >
      {shortTip ? (
        <div className="fixed left-1/2 top-[calc(var(--safe-top)+1rem)] z-50 flex w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2 items-start gap-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-4 text-[var(--app-text)] shadow-[0_12px_30px_rgba(80,40,60,0.10)]">
          <CheckCircle2 className="mt-0.5 text-[#48a568]" size={20} />
          <div>
            <p className="font-black">提示</p>
            <p className="text-sm text-[var(--app-muted)]">5 秒以下不记录，待办已回到未开始。</p>
          </div>
        </div>
      ) : null}

      <header className="flex items-center justify-between gap-3">
        <button className="app-header-button" onClick={handleBack} aria-label={isLocked ? "放弃后返回" : "返回"}>
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-sm font-black text-[var(--app-text)]">{todo.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="app-header-button" onClick={handleSoundToggle} aria-label={settings.soundEnabled ? "关闭铃声" : "开启铃声"} title={settings.soundEnabled ? "关闭铃声" : "开启铃声"}>
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col justify-start pt-5 pb-3">
        <section className="mb-4 rounded-[26px] border border-[var(--app-border)] bg-[var(--app-card)]/78 p-3 shadow-[0_10px_24px_rgba(80,40,60,0.07)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-[var(--app-muted)]">当前模式</p>
              <p className="mt-0.5 text-lg font-black" style={{ color: meta.accent }}>
                {meta.label}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--app-primary-soft)] px-3 py-1.5 text-right">
              <p className="text-xs font-black text-[var(--app-muted)]">状态</p>
              <p className="mt-0.5 text-sm font-black text-[var(--app-text)]">{stateLabel[timerState]}</p>
            </div>
          </div>
          {focusTodo.category !== "normal" || timerType === "none" ? (
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-[var(--app-primary-soft)] px-2 py-2">
                <p className="text-[11px] font-bold text-[var(--app-muted)]">今日完成</p>
                <p className="mt-0.5 text-sm font-black text-[var(--app-text)]">{focusToday.completedCount} 次</p>
              </div>
              <div className="rounded-2xl bg-[var(--app-primary-soft)] px-2 py-2">
                <p className="text-[11px] font-bold text-[var(--app-muted)]">计划进度</p>
                <p className="mt-0.5 text-sm font-black text-[var(--app-text)]">{focusProgress.current}/{focusProgress.target} {focusProgress.unit}</p>
              </div>
              <div className="rounded-2xl bg-[var(--app-primary-soft)] px-2 py-2">
                <p className="text-[11px] font-bold text-[var(--app-muted)]">连续坚持</p>
                <p className="mt-0.5 text-sm font-black text-[var(--app-text)]">{focusStreak} 天</p>
              </div>
            </div>
          ) : null}
        </section>

        {timerType === "countdown" ? (
          <section className="flex flex-col items-center">
            <div className="relative flex h-[clamp(232px,72vw,292px)] w-[clamp(232px,72vw,292px)] items-center justify-center rounded-full bg-[var(--app-card-soft)]/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_42px_rgba(80,40,60,0.09)]">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 292 292" aria-label="倒计时进度">
                <circle cx="146" cy="146" r="122" stroke="rgba(255,255,255,.66)" strokeWidth="14" fill="none" />
                <circle
                  cx="146"
                  cy="146"
                  r="122"
                  stroke={meta.accent}
                  strokeWidth="14"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 122}
                  strokeDashoffset={(2 * Math.PI * 122) * (1 - Math.max(0, Math.min(1, countdownProgress)))}
                  className="transition-[stroke-dashoffset] duration-500 ease-out"
                />
              </svg>
              <div className="relative flex h-[clamp(178px,55vw,224px)] w-[clamp(178px,55vw,224px)] flex-col items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-card)] px-5 text-center shadow-[0_12px_34px_rgba(80,40,60,0.11)]">
                <p className="text-sm font-black text-[var(--app-muted)]">剩余</p>
                <p className="mt-2 text-[clamp(2.5rem,12vw,3rem)] font-black leading-none tabular-nums text-[var(--app-text)]">{formatSeconds(remainingSeconds)}</p>
                <p className="mt-3 text-sm font-bold text-[var(--app-muted)]">目标 {formatSeconds(durationSeconds)}</p>
                {timerState === "completed" && completedReason === "natural" ? <p className="mt-2 text-xs font-black text-[var(--app-primary-strong)]">已到点完成</p> : null}
              </div>
            </div>
          </section>
        ) : timerType === "countup" ? (
          <section className="flex flex-col items-center py-1">
            <div className="relative flex aspect-square w-[clamp(244px,74vw,300px)] items-center justify-center rounded-full border border-[color-mix(in_srgb,#22A06B_24%,var(--app-border))] bg-[linear-gradient(155deg,color-mix(in_srgb,#E8F7EF_74%,var(--app-card)_26%),var(--app-card))] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_18px_42px_rgba(34,160,107,0.12)]">
              {Array.from({ length: 12 }, (_, index) => (
                <span key={index} className="absolute inset-3" style={{ transform: `rotate(${index * 30}deg)` }}>
                  <span className="mx-auto block h-3 w-1 rounded-full bg-[color-mix(in_srgb,#22A06B_42%,transparent)]" />
                </span>
              ))}
              <div className="relative flex h-[72%] w-[72%] flex-col items-center justify-center rounded-full border border-white/80 bg-[color-mix(in_srgb,var(--app-card)_88%,transparent)] px-4 shadow-[0_12px_32px_rgba(34,160,107,0.10)]">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#168458]">
                  <span className={cn("h-2.5 w-2.5 rounded-full bg-[#22A06B]", isRunning && "animate-pulse")} />
                  {stateLabel[timerState]}
                </div>
                <p className="whitespace-nowrap text-[clamp(2.8rem,14vw,3.75rem)] font-black leading-none tabular-nums text-[var(--app-text)]">{displayTime}</p>
                <p className="mt-4 text-xs font-black text-[var(--app-muted)]">已专注</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-[28px] border border-[var(--app-border)] bg-[linear-gradient(150deg,var(--app-card),var(--app-primary-soft))] text-center shadow-[0_16px_36px_rgba(80,40,60,0.09)]">
            <div className="flex min-h-[230px] flex-col items-center justify-center px-5 py-8">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--app-card)] text-[var(--app-primary-strong)] shadow-[0_10px_24px_rgba(80,40,60,0.08)]">
                <Sparkles size={29} />
              </div>
              <p className="text-sm font-black text-[var(--app-muted)]">不计时</p>
              <p className="mt-3 text-[2rem] font-black leading-none text-[var(--app-text)]">{isFinished ? "已完成" : "准备好了"}</p>
            </div>
          </section>
        )}
      </main>

      <footer className="space-y-3">
        <button
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--app-text)] text-lg font-black text-white shadow-[0_12px_30px_rgba(40,36,43,0.18)]"
          onClick={handlePrimary}
        >
          <PrimaryIcon size={21} />
          {primaryLabel}
        </button>

        {isLocked ? (
          <div className={needsManualComplete ? "grid grid-cols-2 gap-3" : "grid gap-3"}>
            {needsManualComplete ? (
              <button
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--app-primary)] font-black text-white shadow-[0_10px_24px_rgba(245,140,178,0.25)]"
                onClick={handleComplete}
              >
                <Check size={18} />
                完成
              </button>
            ) : null}
            <button
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] font-black text-[var(--app-danger)] shadow-[0_8px_22px_rgba(80,40,60,0.07)]"
              onClick={() => {
                exitAfterAbandon.current = false;
                setReasonPickerOpen(true);
              }}
            >
              <CircleStop size={18} />
              放弃
            </button>
          </div>
        ) : null}
      </footer>

      <Dialog.Root
        open={reasonPickerOpen}
        onOpenChange={(open) => {
          setReasonPickerOpen(open);
          if (!open && !abandonSubmitted.current) exitAfterAbandon.current = false;
          if (!open) abandonSubmitted.current = false;
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
          <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 max-h-[90vh] w-[calc(100%-56px)] max-w-[340px] rounded-3xl p-5">
            <Dialog.Title className="text-center text-lg font-black">{exitAfterAbandon.current ? "放弃后返回？" : "选择放弃原因"}</Dialog.Title>
            <div className="mt-5 grid gap-2">
              {abandonReasons.map((reason) => (
                <Button
                  key={reason}
                  variant="secondary"
                  onClick={() => {
                    handleAbandon(reason);
                    setReasonPickerOpen(false);
                  }}
                >
                  {reason}
                </Button>
              ))}
              <Button
                variant="ghost"
                onClick={() => {
                  handleAbandon(null);
                  setReasonPickerOpen(false);
                }}
              >
                <XCircle size={17} />
                不填原因
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ConfirmDialog
        open={instantCompleteOpen}
        title="完成这个待办？"
        description={`确认完成「${focusTodo.title}」并记录今日次数。`}
        confirmText="完成"
        tone="success"
        onOpenChange={setInstantCompleteOpen}
        onConfirm={() => void handleInstantComplete()}
      />
      </div>
      {!isAuthenticated ? <GuestPreviewBanner withNav={false} /> : null}
    </>
  );
}
