import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, BarChart3, Clock3, FolderInput, Pencil, Target, Trash2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { useTimerSessionsRangeQuery } from "@/hooks/useApiQueries";
import type { TodoCollection, TodoItem } from "@/types/todo";
import { cn } from "@/utils/cn";
import { deadlineText, targetProgress, todayTodoMetrics, todoStreak, todoTotalDays, totalTodoMetrics, weekHeat } from "@/utils/todoMetrics";

interface TodoActionSheetProps {
  open: boolean;
  todo?: TodoItem;
  collections?: TodoCollection[];
  onOpenChange: (open: boolean) => void;
  onDelete: (todo: TodoItem) => void;
  onEdit: (todo: TodoItem) => void;
  onMoveToCollection: (todo: TodoItem, collectionId: number | null) => void;
  onOpenStats: (todo: TodoItem) => void;
}

function dateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function timerText(todo: TodoItem) {
  if (todo.timerType === "countdown") return `${todo.durationMinutes} 分钟`;
  if (todo.timerType === "countup") return "正计时";
  return "不计时";
}

function categoryText(todo: TodoItem) {
  if (todo.category === "habit") return "习惯";
  if (todo.category === "goal") return "目标";
  return "普通待办";
}

export function TodoActionSheet({ open, todo, collections = [], onOpenChange, onDelete, onEdit, onMoveToCollection, onOpenStats }: TodoActionSheetProps) {
  const reduceMotion = useReducedMotion();
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const startDate = todo?.createdAt?.slice(0, 10) ?? "1970-01-01";
  const endDate = dateInput(new Date());
  const { data: sessions = [] } = useTimerSessionsRangeQuery(startDate, endDate, { todoId: todo?.id }, open && Boolean(todo));

  if (!todo) return null;

  const close = () => {
    setMoveOpen(false);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
  };

  const confirmDelete = () => {
    onDelete(todo);
    close();
  };

  const today = todayTodoMetrics(todo, sessions);
  const total = totalTodoMetrics(todo, sessions);
  const progress = targetProgress(todo, sessions);
  const heat = weekHeat(todo, sessions);
  const deadline = deadlineText(todo);
  const actionButtonClass =
    "flex min-h-[54px] w-full items-center gap-3 rounded-[16px] border border-[color-mix(in_srgb,var(--app-border)_56%,transparent)] bg-[color-mix(in_srgb,var(--app-card)_90%,var(--app-primary-soft)_10%)] bg-clip-padding px-4 py-3 text-left text-sm font-black text-[var(--app-text)] shadow-[0_6px_14px_color-mix(in_srgb,var(--app-primary)_6%,transparent)] transition active:scale-[0.99]";
  const actionIconClass = "flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--app-primary-soft)_68%,var(--app-card)_32%)] text-[var(--app-primary-strong)]";
  const quickActionClass =
    "flex min-h-[58px] items-center justify-center gap-2 rounded-[18px] border border-[color-mix(in_srgb,var(--app-border)_56%,transparent)] bg-[color-mix(in_srgb,var(--app-card)_82%,var(--app-primary-soft)_18%)] bg-clip-padding px-3 text-sm font-black text-[var(--app-primary-strong)] shadow-[0_6px_14px_color-mix(in_srgb,var(--app-primary)_6%,transparent)] transition active:scale-[0.98]";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setMoveOpen(false);
          setDeleteConfirmOpen(false);
        }
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.34)]" />
        <Dialog.Content
          asChild
          onInteractOutside={(event) => {
            if (deleteConfirmOpen) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (deleteConfirmOpen) {
              event.preventDefault();
              setDeleteConfirmOpen(false);
            }
          }}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[calc(100%-36px)] max-w-[390px] overflow-hidden rounded-[28px] border border-[color-mix(in_srgb,var(--app-border)_74%,transparent)] bg-[color-mix(in_srgb,var(--app-card)_92%,var(--app-primary-soft)_8%)] p-0 text-[var(--app-text)] shadow-[0_18px_46px_color-mix(in_srgb,var(--app-primary)_18%,transparent)] outline-none"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, x: "-50%", y: reduceMotion ? "-50%" : "-46%" }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
          <div className={cn("app-modal-scroll max-h-[88vh] overflow-y-auto", deleteConfirmOpen && "pointer-events-none overflow-hidden")}>
          <div className="overflow-hidden rounded-t-[28px] border-b border-[color-mix(in_srgb,var(--app-border)_70%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary-soft)_72%,var(--app-card)_28%),color-mix(in_srgb,var(--app-card-soft)_78%,var(--app-card)_22%))] px-5 pb-5 pt-6">
            <Dialog.Title className="text-center text-[22px] font-black leading-7 text-[var(--app-text)]">{todo.title}</Dialog.Title>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--app-card)_78%,transparent)] px-3 text-xs font-black text-[var(--app-primary-strong)] shadow-[0_6px_14px_color-mix(in_srgb,var(--app-primary)_8%,transparent)]">
                <Target size={14} />
                {categoryText(todo)}
              </span>
              <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--app-card)_78%,transparent)] px-3 text-xs font-black text-[var(--app-primary-strong)] shadow-[0_6px_14px_color-mix(in_srgb,var(--app-primary)_8%,transparent)]">
                <Clock3 size={14} />
                {timerText(todo)}
              </span>
              {deadline ? (
                <span className="inline-flex min-h-8 items-center rounded-full bg-[color-mix(in_srgb,var(--app-card)_78%,transparent)] px-3 text-xs font-black text-[var(--app-primary-strong)] shadow-[0_6px_14px_color-mix(in_srgb,var(--app-primary)_8%,transparent)]">
                  {deadline}
                </span>
              ) : null}
            </div>
          </div>

          {moveOpen ? (
            <div className="px-4 pb-4 pt-3">
              <button className="mb-3 flex min-h-10 items-center gap-2 rounded-[14px] px-1 text-sm font-black text-[var(--app-muted)]" onClick={() => setMoveOpen(false)} type="button">
                <ArrowLeft size={17} />
                移动到待办集
              </button>
              <div className="grid gap-2">
                <button
                  className={actionButtonClass}
                  onClick={() => {
                    onMoveToCollection(todo, null);
                    close();
                  }}
                  type="button"
                >
                  <span className={actionIconClass}>
                    <FolderInput size={17} />
                  </span>
                  <span className="min-w-0 flex-1">不属于任何待办集</span>
                  {todo.collectionId == null ? <span className="shrink-0 text-xs text-[var(--app-primary-strong)]">当前</span> : null}
                </button>
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    className={actionButtonClass}
                    onClick={() => {
                      onMoveToCollection(todo, collection.id);
                      close();
                    }}
                    type="button"
                  >
                    <span className={actionIconClass}>
                      <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: collection.color }} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{collection.name}</span>
                    {todo.collectionId === collection.id ? <span className="shrink-0 text-xs text-[var(--app-primary-strong)]">当前</span> : null}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 px-4 pt-4">
                <button
                  className={quickActionClass}
                  onClick={() => {
                    onEdit(todo);
                    close();
                  }}
                  type="button"
                >
                  <Pencil size={16} />
                  编辑
                </button>
                <button
                  className={quickActionClass}
                  onClick={() => {
                    onOpenStats(todo);
                    close();
                  }}
                  type="button"
                >
                  <BarChart3 size={16} />
                  数据统计
                </button>
                <button className={quickActionClass} onClick={() => setMoveOpen(true)} type="button">
                  <FolderInput size={16} />
                  移动到待办集
                </button>
                <button className="flex min-h-[58px] items-center justify-center gap-2 rounded-[18px] border border-[color-mix(in_srgb,var(--app-danger)_20%,var(--app-border)_80%)] bg-[color-mix(in_srgb,var(--app-danger)_8%,var(--app-card)_92%)] px-3 text-sm font-black text-[var(--app-danger)] shadow-[0_8px_18px_color-mix(in_srgb,var(--app-danger)_8%,transparent)] transition active:scale-[0.98]" onClick={() => setDeleteConfirmOpen(true)} type="button">
                  <Trash2 size={16} />
                  删除
                </button>
              </div>

              <div className="px-4 pt-3">
                <div className="rounded-[18px] border border-[color-mix(in_srgb,var(--app-border)_48%,transparent)] bg-[color-mix(in_srgb,var(--app-card-soft)_70%,var(--app-card)_30%)] p-3">
                  <p className="text-sm font-black text-[var(--app-primary-strong)]">周热力图</p>
                  <div className="mt-3 grid grid-cols-7 gap-2">
                    {heat.map((item) => (
                      <div key={item.key} className="text-center">
                        <span className={cn("mx-auto block h-7 w-7 rounded-full border", item.active ? "border-[var(--app-primary)] bg-[var(--app-primary)]" : "border-[color-mix(in_srgb,var(--app-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--app-card)_88%,transparent)]")} />
                        <p className="mt-1 text-[11px] font-bold text-[var(--app-muted)]">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-4 pt-3">
                <div className="rounded-[18px] border border-[color-mix(in_srgb,var(--app-border)_48%,transparent)] bg-[color-mix(in_srgb,var(--app-card-soft)_70%,var(--app-card)_30%)] p-3">
                  <p className="text-sm font-black text-[var(--app-primary-strong)]">累计数据</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs font-bold text-[var(--app-text)]">{todo.timerType === "none" ? "完成次数" : "专注次数"}</p>
                      <p className="mt-1 text-2xl font-black text-[var(--app-primary-strong)]">{total.completedCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--app-text)]">时长</p>
                      <p className="mt-1 text-2xl font-black text-[var(--app-primary-strong)]">
                        {total.focusMinutes}
                        <span className="text-xs">分钟</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--app-text)]">放弃次数</p>
                      <p className="mt-1 text-2xl font-black text-[var(--app-primary-strong)]">{total.abandonedCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-5 pt-3">
                <div className="rounded-[18px] border border-[color-mix(in_srgb,var(--app-border)_48%,transparent)] bg-[color-mix(in_srgb,var(--app-card-soft)_70%,var(--app-card)_30%)] p-3">
                  <p className="text-sm font-black text-[var(--app-primary-strong)]">
                    {todo.category === "habit" ? `习惯周期：${todo.recurrence ?? "每天"}` : todo.category === "goal" ? "目标完成情况" : todo.timerType === "none" ? "今日完成情况" : "计时信息"}
                  </p>
                  <div className="mt-3 grid grid-cols-3 items-center gap-2 text-center">
                    <div>
                      <p className="text-xs font-bold text-[var(--app-text)]">今日完成</p>
                      <p className="mt-1 text-2xl font-black text-[var(--app-primary-strong)]">
                        {today.completedCount}
                        <span className="text-xs">次</span>
                      </p>
                    </div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--app-primary)] text-sm font-black text-[var(--app-primary-strong)]">
                      {progress.percent}%
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--app-text)]">计划量</p>
                      <p className="mt-1 text-2xl font-black text-[var(--app-primary-strong)]">
                        {progress.target}
                        <span className="text-xs">{progress.unit}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm font-bold text-[var(--app-text)]">
                    <div className="flex justify-between">
                      <span>计时方式</span>
                      <span className="text-[var(--app-primary-strong)]">{timerText(todo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>总共坚持天数</span>
                      <span className="text-[var(--app-primary-strong)]">{todoTotalDays(todo)} 天</span>
                    </div>
                    <div className="flex justify-between">
                      <span>连续坚持天数</span>
                      <span className="text-[var(--app-primary-strong)]">{todoStreak(todo, sessions)} 天</span>
                    </div>
                    {deadline ? (
                      <div className="flex justify-between">
                        <span>目标期限</span>
                        <span className="text-[var(--app-primary-strong)]">{deadline}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          )}
          </div>

          {deleteConfirmOpen ? (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(38,35,42,0.28)] px-6"
            onPointerDown={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.preventDefault()}
            onWheel={(event) => event.preventDefault()}
          >
            <div className="w-full max-w-[330px] rounded-[26px] border border-[color-mix(in_srgb,var(--app-danger)_18%,var(--app-border)_82%)] bg-[color-mix(in_srgb,var(--app-card)_92%,var(--app-danger)_8%)] p-5 text-center shadow-[0_18px_44px_color-mix(in_srgb,var(--app-danger)_16%,transparent)]" role="alertdialog" aria-label="删除这个待办？">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--app-danger)_10%,var(--app-card)_90%)] text-[var(--app-danger)]">
                <Trash2 size={22} />
              </div>
              <p className="mt-3 text-lg font-black text-[var(--app-text)]">删除这个待办？</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--app-muted)]">确定删除「{todo.title}」吗？相关历史记录不会一起删除。</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="min-h-11 rounded-full bg-[var(--app-primary-soft)] px-4 text-sm font-black text-[var(--app-text)] transition active:scale-[0.98]" onClick={() => setDeleteConfirmOpen(false)} type="button">
                  取消
                </button>
                <button className="min-h-11 rounded-full bg-[var(--app-danger)] px-4 text-sm font-black text-white transition active:scale-[0.98]" onClick={confirmDelete} type="button">
                  删除
                </button>
              </div>
            </div>
          </div>
          ) : null}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
