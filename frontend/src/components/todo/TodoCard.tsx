import { Check, Clock3, Flame, Play, Target } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { MetricTile } from "@/components/common/MetricTile";
import type { TimerSession } from "@/types/session";
import type { TodoItem } from "@/types/todo";
import { cn } from "@/utils/cn";
import { isTodoCompleted, targetPeriodText, targetProgress, todayTodoMetrics, totalTodoMetrics } from "@/utils/todoMetrics";

const timerTypeText = {
  countdown: "倒计时",
  countup: "正计时",
  none: "不计时"
};

interface TodoCardProps {
  todo: TodoItem;
  dragging?: boolean;
  todayCompletedCount?: number;
  sessions?: TimerSession[];
  onStart: (todo: TodoItem) => void;
  onComplete?: (todo: TodoItem) => void;
  onOpen?: (todo: TodoItem) => void;
  onLongPressStart?: (todo: TodoItem) => void;
  onDragMove?: (clientX: number, clientY: number) => void;
  onDragEnd?: () => void;
}

export function TodoCard({
  todo,
  dragging = false,
  todayCompletedCount = 0,
  sessions = [],
  onStart,
  onComplete,
  onOpen,
  onLongPressStart,
  onDragMove,
  onDragEnd
}: TodoCardProps) {
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);
  const suppressNextClick = useRef(false);
  const progress = targetProgress(todo, sessions);
  const today = todayTodoMetrics(todo, sessions);
  const total = totalTodoMetrics(todo, sessions);
  const completed = isTodoCompleted(todo, sessions);
  const isNoTimer = todo.timerType === "none";
  const categoryText = todo.category === "habit" ? "习惯" : todo.category === "goal" ? "目标" : "待办";
  const categoryClass =
    todo.category === "habit"
      ? "bg-[color-mix(in_srgb,var(--app-accent)_16%,var(--app-card))] text-[var(--app-accent)]"
      : todo.category === "goal"
        ? "bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]"
        : "bg-[var(--app-card-soft)] text-[var(--app-muted)]";
  const periodText = targetPeriodText(todo);
  const timerText = todo.timerType === "countdown" ? `${todo.durationMinutes} 分钟` : timerTypeText[todo.timerType];
  const showProgress = todo.category !== "normal" || isNoTimer;

  const clearPress = () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };

  const finishPointer = () => {
    clearPress();
    if (longPressed.current) {
      suppressNextClick.current = true;
      longPressed.current = false;
      onDragEnd?.();
    }
  };

  return (
    <Card
      className={cn(
        "overflow-hidden p-0 select-none bg-[var(--app-card)]",
        dragging && "scale-[0.985] border-[var(--app-primary-strong)] shadow-[0_14px_34px_rgba(120,70,90,0.18)]"
      )}
      data-sort-id={todo.id}
      onClick={() => {
        if (suppressNextClick.current) {
          suppressNextClick.current = false;
          return;
        }
        if (longPressed.current) return;
        onOpen?.(todo);
      }}
      onPointerCancel={finishPointer}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        clearPress();
        longPressed.current = false;
        pressTimer.current = window.setTimeout(() => {
          longPressed.current = true;
          onLongPressStart?.(todo);
        }, 420);
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerLeave={clearPress}
      onPointerMove={(event) => {
        if (!longPressed.current) return;
        event.preventDefault();
        onDragMove?.(event.clientX, event.clientY);
      }}
      onPointerUp={finishPointer}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className={cn("min-w-0 flex-1 truncate text-lg font-black text-[var(--app-text)]", completed && "line-through decoration-2 decoration-[var(--app-primary-strong)]/70")}>
              {todo.title}
            </h3>
            {completed ? (
              <span className="shrink-0 rounded-full bg-[#EAF8EF] px-2 py-0.5 text-[11px] font-black text-[#31935A]">已达成</span>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-black text-[var(--app-muted)]">
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1", categoryClass)}>
              <Target size={13} />
              {categoryText}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--app-card-soft)] px-2.5 py-1">
              <Clock3 size={13} />
              {timerText}
            </span>
            {showProgress ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--app-card-soft)] px-2.5 py-1">
                <Flame size={13} />
                {periodText} {progress.current}/{progress.target} {progress.unit}
              </span>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <MetricTile compact className="bg-[var(--app-primary-soft)]" label="今日" value={`${today.completedCount} 次`} />
            <MetricTile compact className="bg-[color-mix(in_srgb,var(--app-accent)_14%,var(--app-card))]" label="累计" value={`${total.completedCount} 次`} />
            <MetricTile compact className="bg-[var(--app-card-soft)]" label={showProgress ? "进度" : "今日时长"} value={showProgress ? `${progress.percent}%` : `${today.focusMinutes} 分钟`} />
          </div>
          {todayCompletedCount > 0 ? <p className="mt-2 text-xs font-bold text-[var(--app-primary-strong)]">今日已完成 {todayCompletedCount} 次</p> : null}
        </div>
        <Button
          className="shrink-0 px-3"
          onClick={(event) => {
            event.stopPropagation();
            if (isNoTimer) {
              onComplete?.(todo);
              return;
            }
            onStart(todo);
          }}
        >
          {isNoTimer ? <Check size={16} /> : <Play size={16} />}
          {isNoTimer ? "完成" : "开始"}
        </Button>
      </div>
    </Card>
  );
}
