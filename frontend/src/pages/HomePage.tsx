/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { ArrowUpDown, Check, ListTodo, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { AnimatedList, AnimatedListItem } from "@/components/common/AnimatedList";
import { CheckinNoteDialog } from "@/components/common/CheckinNoteDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CuteEmptyState } from "@/components/common/CuteEmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { QuickActionMenu, QuickActionMoreButton } from "@/components/common/QuickActionMenu";
import { ReorderControls } from "@/components/common/ReorderControls";
import { MobileShell } from "@/components/layout/MobileShell";
import { TodoActionSheet } from "@/components/todo/TodoActionSheet";
import { TodoCard } from "@/components/todo/TodoCard";
import { TodoEditorDialog } from "@/components/todo/TodoEditorDialog";
import {
  useCollectionsQuery,
  useCreateTimerSessionMutation,
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useTimerSessionsRangeQuery,
  useTodosQuery,
  useUpdateTodoMutation,
  useUpdateTodoStatusMutation,
  useUpdateTodoSortMutation
} from "@/hooks/useApiQueries";
import { useQuickCheckin } from "@/hooks/useQuickCheckin";
import { useTodayKey } from "@/hooks/useTodayKey";
import { lightImpact, successFeedback } from "@/services/hapticsService";
import { useTimerStore } from "@/stores/timerStore";
import { useUiStore } from "@/stores/uiStore";
import type { TodoInput, TodoItem } from "@/types/todo";
import { isTodoCompleted, todayTodoMetrics } from "@/utils/todoMetrics";
import { noTimerCompletion } from "@/utils/session";

function sameIds(a: number[], b: number[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function reorderIds(ids: number[], activeId: number, targetId: number) {
  const from = ids.indexOf(activeId);
  const to = ids.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return ids;
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data: todos = [], isLoading } = useTodosQuery();
  const { data: collections = [] } = useCollectionsQuery();
  const createTodo = useCreateTodoMutation();
  const updateTodo = useUpdateTodoMutation();
  const updateTodoStatus = useUpdateTodoStatusMutation();
  const deleteTodo = useDeleteTodoMutation();
  const updateTodoSort = useUpdateTodoSortMutation();
  const createSession = useCreateTimerSessionMutation();
  const today = useTodayKey();
  const { data: timerSessions = [] } = useTimerSessionsRangeQuery("1970-01-01", today);
  const { noteType, noteSubmitting, closeNoteDialog, startQuickCheckin, submitNoteCheckin } = useQuickCheckin();
  const startTodo = useTimerStore((state) => state.startTodo);
  const toast = useUiStore((state) => state.toast);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | undefined>();
  const [actionTodo, setActionTodo] = useState<TodoItem | undefined>();
  const [quickOpen, setQuickOpen] = useState(false);
  const [localOrderIds, setLocalOrderIds] = useState<number[]>([]);
  const [reorderMode, setReorderMode] = useState(false);
  const [pendingCompleteTodo, setPendingCompleteTodo] = useState<TodoItem | undefined>();

  const orderedTodos = useMemo(() => [...todos].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || b.createdAt.localeCompare(a.createdAt)), [todos]);

  useEffect(() => {
    if (reorderMode) return;
    const nextOrderIds = orderedTodos.map((todo) => todo.id);
    setLocalOrderIds((ids) => {
      const next = sameIds(ids, nextOrderIds) ? ids : nextOrderIds;
      return next;
    });
  }, [orderedTodos, reorderMode]);

  const visibleTodos = useMemo(() => {
    const byId = new Map(orderedTodos.map((todo) => [todo.id, todo]));
    const ordered = localOrderIds.map((id) => byId.get(id)).filter((todo): todo is TodoItem => Boolean(todo));
    if (ordered.length !== orderedTodos.length) return orderedTodos;
    return ordered;
  }, [localOrderIds, orderedTodos]);

  const handleCreate = async (payload: TodoInput) => {
    await createTodo.mutateAsync(payload);
    void successFeedback();
    toast({ title: "待办已添加", tone: "success" });
  };

  const handleUpdate = async (payload: TodoInput) => {
    if (!editingTodo) return;
    await updateTodo.mutateAsync({ id: editingTodo.id, payload });
    void successFeedback();
    toast({ title: "待办已更新", tone: "success" });
    setEditingTodo(undefined);
  };

  const handleStart = (todo: TodoItem) => {
    void lightImpact();
    startTodo(todo);
    navigate(`/focus/${todo.id}`);
  };

  const handleCompleteNoTimer = async (todo: TodoItem) => {
    if (createSession.isPending) return;
    try {
      const completion = noTimerCompletion(todo);
      await createSession.mutateAsync(completion);
      const completed = isTodoCompleted(todo, [...timerSessions, { id: -Date.now(), ...completion }]);
      await updateTodoStatus.mutateAsync({ id: todo.id, status: completed ? "done" : "todo" });
      setPendingCompleteTodo(undefined);
      void successFeedback();
      toast({ title: "已完成", description: `今日第 ${todayTodoMetrics(todo, timerSessions).completedCount + 1} 次`, tone: "success" });
    } catch (completeError) {
      toast({ title: "完成记录没有保存", description: completeError instanceof Error ? completeError.message : "请检查网络后再试。", tone: "error" });
    }
  };

  const openEditor = () => {
    void lightImpact();
    setEditingTodo(undefined);
    setEditorOpen(true);
  };

  const quickToast = (title: string, tone: "success" | "error" = "success", description?: string, durationMs?: number) => {
    void lightImpact();
    toast({ title, description, tone, durationMs });
  };

  const persistTodoOrder = async (ids: number[]) => {
    const byId = new Map(visibleTodos.map((todo) => [todo.id, todo]));
    try {
      for (const [index, id] of ids.entries()) {
        const todo = byId.get(id);
        if (todo && todo.sortOrder !== index + 1) await updateTodoSort.mutateAsync({ id, sortOrder: index + 1 });
      }
      quickToast("待办顺序已更新");
    } catch (error) {
      quickToast("顺序保存失败", "error", error instanceof Error ? error.message : "请检查网络后重试");
    }
  };

  const moveTodo = (id: number, direction: -1 | 1) => {
    const index = localOrderIds.indexOf(id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= localOrderIds.length || updateTodoSort.isPending) return;
    const next = reorderIds(localOrderIds, id, localOrderIds[targetIndex]);
    setLocalOrderIds(next);
    void persistTodoOrder(next);
  };

  return (
    <MobileShell>
      <div className="space-y-5">
        <PageHeader
          icon={ListTodo}
          title="待办"
          description="安排今天要做的事"
          action={
            <div className="relative flex gap-2">
              <button
                className="app-header-button"
                onClick={() => {
                  setQuickOpen(false);
                  setReorderMode((enabled) => !enabled);
                }}
                aria-label={reorderMode ? "完成排序" : "调整待办顺序"}
                aria-pressed={reorderMode}
                type="button"
              >
                {reorderMode ? <Check size={19} /> : <ArrowUpDown size={19} />}
              </button>
              <button className="app-header-button" onClick={openEditor} aria-label="添加待办" type="button">
                <Plus size={19} />
              </button>
              <QuickActionMoreButton open={quickOpen} onClick={() => setQuickOpen((open) => !open)} />
              <QuickActionMenu
                open={quickOpen}
                onOpenChange={setQuickOpen}
                onWakeup={() => startQuickCheckin("wakeup")}
                onFocusCheckin={() => startQuickCheckin("focus_today")}
                onSleep={() => startQuickCheckin("sleep")}
              />
            </div>
          }
        />

        {reorderMode ? <Card className="bg-white text-sm font-bold text-[var(--app-muted)]">使用每条待办右侧的箭头调整顺序，修改会立即保存。</Card> : null}

        <AnimatedList className="space-y-3">
          {isLoading ? (
            <AnimatedListItem>
              <Card className="text-sm font-semibold text-[var(--app-muted)]">正在加载待办...</Card>
            </AnimatedListItem>
          ) : null}
          {!isLoading && visibleTodos.length === 0 ? (
            <AnimatedListItem>
              <CuteEmptyState title="当前没有待办" description="点右上角 + 新建一个待办，然后开始一次专注。" actionLabel="添加待办" onAction={openEditor} />
            </AnimatedListItem>
          ) : null}
          {visibleTodos.map((todo) => (
            <AnimatedListItem key={todo.id}>
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <TodoCard
                    todo={todo}
                    todayCompletedCount={todayTodoMetrics(todo, timerSessions).completedCount}
                    sessions={timerSessions}
                    onOpen={reorderMode ? undefined : setActionTodo}
                    onStart={handleStart}
                    onComplete={setPendingCompleteTodo}
                  />
                </div>
                {reorderMode ? (
                  <ReorderControls
                    label={`“${todo.title}”`}
                    canMoveUp={localOrderIds.indexOf(todo.id) > 0}
                    canMoveDown={localOrderIds.indexOf(todo.id) < localOrderIds.length - 1}
                    disabled={updateTodoSort.isPending}
                    onMoveUp={() => moveTodo(todo.id, -1)}
                    onMoveDown={() => moveTodo(todo.id, 1)}
                  />
                ) : null}
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </div>

      <CheckinNoteDialog open={noteType !== null} type={noteType} submitting={noteSubmitting} onOpenChange={(open) => !open && closeNoteDialog()} onSubmit={submitNoteCheckin} />
      <TodoEditorDialog open={editorOpen} onOpenChange={setEditorOpen} onSubmit={handleCreate} />
      <TodoEditorDialog
        open={!!editingTodo}
        todo={editingTodo}
        onOpenChange={(open) => {
          if (!open) setEditingTodo(undefined);
        }}
        onSubmit={handleUpdate}
      />
      <TodoActionSheet
        open={!!actionTodo}
        todo={actionTodo}
        collections={collections}
        onOpenChange={(open) => {
          if (!open) setActionTodo(undefined);
        }}
        onEdit={(todo) => setEditingTodo(todo)}
        onMoveToCollection={(todo, collectionId) => {
          void updateTodo.mutateAsync({ id: todo.id, payload: { collectionId, clearCollection: collectionId == null } });
          toast({ title: collectionId == null ? "已移出待办集" : "已移动到待办集", tone: "success" });
        }}
        onOpenStats={(todo) => navigate(`/stats?todoId=${todo.id}&todoName=${encodeURIComponent(todo.title)}`)}
        onDelete={(todo) => {
          void deleteTodo.mutateAsync(todo.id).then(() => {
            toast({ title: "待办已删除" });
          });
        }}
      />
      <ConfirmDialog
        open={!!pendingCompleteTodo}
        title="完成这个待办？"
        description={pendingCompleteTodo ? `确认完成「${pendingCompleteTodo.title}」并记录今日次数。` : undefined}
        confirmText="完成"
        tone="success"
        onOpenChange={(open) => {
          if (!open) setPendingCompleteTodo(undefined);
        }}
        onConfirm={() => {
          if (pendingCompleteTodo) void handleCompleteNoTimer(pendingCompleteTodo);
        }}
      />
    </MobileShell>
  );
}
