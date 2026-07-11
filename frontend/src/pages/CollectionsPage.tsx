import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpDown, BarChart3, Check, ChevronDown, FolderKanban, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddCollectionModal } from "@/components/collection/AddCollectionModal";
import { AnimatedList, AnimatedListItem } from "@/components/common/AnimatedList";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
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
  useCreateCollectionMutation,
  useCreateTimerSessionMutation,
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useTimerSessionsRangeQuery,
  useTodosQuery,
  useUpdateCollectionMutation,
  useUpdateTodoMutation,
  useUpdateTodoStatusMutation,
  useUpdateTodoSortMutation
} from "@/hooks/useApiQueries";
import { useQuickCheckin } from "@/hooks/useQuickCheckin";
import { useTodayKey } from "@/hooks/useTodayKey";
import { lightImpact, successFeedback } from "@/services/hapticsService";
import { useTimerStore } from "@/stores/timerStore";
import { useUiStore } from "@/stores/uiStore";
import type { TodoCollection, TodoInput, TodoItem } from "@/types/todo";
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

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { data: collections = [] } = useCollectionsQuery();
  const { data: todos = [] } = useTodosQuery();
  const createCollection = useCreateCollectionMutation();
  const updateCollection = useUpdateCollectionMutation();
  const createTodo = useCreateTodoMutation();
  const updateTodo = useUpdateTodoMutation();
  const updateTodoStatus = useUpdateTodoStatusMutation();
  const updateTodoSort = useUpdateTodoSortMutation();
  const deleteTodo = useDeleteTodoMutation();
  const createSession = useCreateTimerSessionMutation();
  const today = useTodayKey();
  const { data: timerSessions = [] } = useTimerSessionsRangeQuery("1970-01-01", today);
  const { noteType, noteSubmitting, closeNoteDialog, startQuickCheckin, submitNoteCheckin } = useQuickCheckin();
  const startTodo = useTimerStore((state) => state.startTodo);
  const toast = useUiStore((state) => state.toast);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [todoCollectionId, setTodoCollectionId] = useState<number | null>(null);
  const [editingTodo, setEditingTodo] = useState<TodoItem | undefined>();
  const [actionTodo, setActionTodo] = useState<TodoItem | undefined>();
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [guideOpen, setGuideOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [collectionOrderIds, setCollectionOrderIds] = useState<number[]>([]);
  const [todoOrderIds, setTodoOrderIds] = useState<number[]>([]);
  const [reorderMode, setReorderMode] = useState(false);
  const [pendingCompleteTodo, setPendingCompleteTodo] = useState<TodoItem | undefined>();

  const orderedCollectionsSource = useMemo(
    () => [...collections].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || b.createdAt.localeCompare(a.createdAt)),
    [collections]
  );
  const orderedTodosSource = useMemo(() => [...todos].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || b.createdAt.localeCompare(a.createdAt)), [todos]);

  useEffect(() => {
    if (reorderMode) return;
    const nextOrderIds = orderedCollectionsSource.map((collection) => collection.id);
    setCollectionOrderIds((ids) => {
      const next = sameIds(ids, nextOrderIds) ? ids : nextOrderIds;
      return next;
    });
  }, [orderedCollectionsSource, reorderMode]);

  useEffect(() => {
    if (reorderMode) return;
    const nextOrderIds = orderedTodosSource.map((todo) => todo.id);
    setTodoOrderIds((ids) => {
      const next = sameIds(ids, nextOrderIds) ? ids : nextOrderIds;
      return next;
    });
  }, [orderedTodosSource, reorderMode]);

  const orderedCollections = useMemo(() => {
    const byId = new Map(orderedCollectionsSource.map((collection) => [collection.id, collection]));
    const ordered = collectionOrderIds.map((id) => byId.get(id)).filter((collection): collection is TodoCollection => Boolean(collection));
    if (ordered.length !== orderedCollectionsSource.length) return orderedCollectionsSource;
    return ordered;
  }, [collectionOrderIds, orderedCollectionsSource]);

  const orderedTodos = useMemo(() => {
    const byId = new Map(orderedTodosSource.map((todo) => [todo.id, todo]));
    const ordered = todoOrderIds.map((id) => byId.get(id)).filter((todo): todo is TodoItem => Boolean(todo));
    if (ordered.length !== orderedTodosSource.length) return orderedTodosSource;
    return ordered;
  }, [orderedTodosSource, todoOrderIds]);

  const todosByCollection = useMemo(
    () =>
      collections.reduce<Record<number, TodoItem[]>>((acc, collection) => {
        acc[collection.id] = orderedTodos.filter((todo) => todo.collectionId === collection.id);
        return acc;
      }, {}),
    [collections, orderedTodos]
  );

  const quickToast = (title: string, tone: "success" | "error" = "success", description?: string, durationMs?: number) => {
    void lightImpact();
    toast({ title, description, tone, durationMs });
  };

  const handleCreateTodo = async (payload: TodoInput) => {
    await createTodo.mutateAsync(payload);
    void successFeedback();
    if (!localStorage.getItem("collectionExpandGuideShown")) {
      localStorage.setItem("collectionExpandGuideShown", "true");
      setGuideOpen(true);
    }
    if (payload.collectionId && !expandedIds.includes(payload.collectionId)) {
      setExpandedIds((ids) => [...ids, payload.collectionId!]);
    }
    toast({ title: "待办已添加", tone: "success" });
  };

  const handleUpdateTodo = async (payload: TodoInput) => {
    if (!editingTodo) return;
    await updateTodo.mutateAsync({ id: editingTodo.id, payload });
    void successFeedback();
    toast({ title: "待办已更新", tone: "success" });
    setEditingTodo(undefined);
  };

  const persistCollectionOrder = async (ids: number[]) => {
    const byId = new Map(orderedCollections.map((collection) => [collection.id, collection]));
    try {
      for (const [index, id] of ids.entries()) {
        const collection = byId.get(id);
        if (collection && collection.sortOrder !== index + 1) await updateCollection.mutateAsync({ id, payload: { sortOrder: index + 1 } });
      }
      quickToast("待办集顺序已更新");
    } catch (error) {
      quickToast("顺序保存失败", "error", error instanceof Error ? error.message : "请检查网络后重试");
    }
  };

  const persistTodoOrder = async (ids: number[], collectionId?: number | null) => {
    const byId = new Map(orderedTodos.map((todo) => [todo.id, todo]));
    const scopedIds = collectionId == null ? ids : ids.filter((id) => byId.get(id)?.collectionId === collectionId);
    try {
      for (const [index, id] of scopedIds.entries()) {
        const todo = byId.get(id);
        if (todo && todo.sortOrder !== index + 1) await updateTodoSort.mutateAsync({ id, sortOrder: index + 1 });
      }
      quickToast("待办顺序已更新");
    } catch (error) {
      quickToast("顺序保存失败", "error", error instanceof Error ? error.message : "请检查网络后重试");
    }
  };

  const moveCollection = (id: number, direction: -1 | 1) => {
    const index = collectionOrderIds.indexOf(id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= collectionOrderIds.length || updateCollection.isPending) return;
    const next = reorderIds(collectionOrderIds, id, collectionOrderIds[targetIndex]);
    setCollectionOrderIds(next);
    void persistCollectionOrder(next);
  };

  const moveTodo = (id: number, collectionId: number, direction: -1 | 1) => {
    const scopedIds = todoOrderIds.filter((todoId) => orderedTodos.find((todo) => todo.id === todoId)?.collectionId === collectionId);
    const index = scopedIds.indexOf(id);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= scopedIds.length || updateTodoSort.isPending) return;
    const next = reorderIds(todoOrderIds, id, scopedIds[targetIndex]);
    setTodoOrderIds(next);
    void persistTodoOrder(next, collectionId);
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

  const openCollection = () => {
    void lightImpact();
    setCollectionOpen(true);
  };

  return (
    <MobileShell>
      <div className="space-y-5">
        <PageHeader
          icon={FolderKanban}
          title="待办集"
          description="按场景整理待办"
          action={
            <div className="relative flex gap-2">
              <button
                className="app-header-button"
                onClick={() => {
                  setQuickOpen(false);
                  setReorderMode((enabled) => !enabled);
                  setExpandedIds(orderedCollections.map((collection) => collection.id));
                }}
                aria-label={reorderMode ? "完成排序" : "调整待办集和待办顺序"}
                aria-pressed={reorderMode}
                type="button"
              >
                {reorderMode ? <Check size={19} /> : <ArrowUpDown size={19} />}
              </button>
              <button className="app-header-button" onClick={openCollection} aria-label="添加待办集" type="button">
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

        {reorderMode ? <Card className="bg-white text-sm font-bold text-[var(--app-muted)]">使用右侧箭头调整待办集或集内待办的顺序，修改会立即保存。</Card> : null}

        {orderedCollections.length === 0 ? (
          <CuteEmptyState title="当前没有待办集" description="创建学习、工作或生活分组，再把子待办放进去。" actionLabel="添加待办集" onAction={openCollection} />
        ) : (
          <AnimatedList className="space-y-3">
            {orderedCollections.map((collection) => {
              const childTodos = todosByCollection[collection.id] ?? [];
              const expanded = expandedIds.includes(collection.id);
              const collectionIndex = collectionOrderIds.indexOf(collection.id);
              return (
                <AnimatedListItem key={collection.id}>
                <div className="flex items-center gap-2">
                <Card className="min-w-0 flex-1 overflow-hidden p-0">
                  <div
                    className="flex min-h-20 items-center gap-3 p-4"
                    onClick={() => {
                      if (reorderMode) return;
                      setExpandedIds((ids) => (ids.includes(collection.id) ? ids.filter((id) => id !== collection.id) : [...ids, collection.id]));
                    }}
                  >
                    <span className="h-12 w-1.5 rounded-full" style={{ backgroundColor: collection.color }} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-lg font-black text-[var(--app-text)]">{collection.name}</h2>
                      <p className="text-xs font-bold text-[var(--app-muted)]">{childTodos.length} 个待办</p>
                    </div>
                    <ChevronDown className={expanded ? "rotate-180 text-[var(--app-muted)] transition" : "text-[var(--app-muted)] transition"} size={18} />
                    <button
                      className="rounded-full bg-[var(--app-card-soft)] p-2 text-[var(--app-primary-strong)]"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/stats?collectionId=${collection.id}&collectionName=${encodeURIComponent(collection.name)}`);
                      }}
                      aria-label="统计"
                      type="button"
                    >
                      <BarChart3 size={17} />
                    </button>
                    <button
                      className="rounded-full bg-[var(--app-primary-soft)] p-2 text-[var(--app-primary-strong)]"
                      onClick={(event) => {
                        event.stopPropagation();
                        void lightImpact();
                        setTodoCollectionId(collection.id);
                      }}
                      aria-label="添加待办"
                      type="button"
                    >
                      <Plus size={17} />
                    </button>
                  </div>

                  {expanded ? (
                    <AnimatedList className="space-y-3 border-t border-[var(--app-border)] bg-[var(--app-bg-soft)] p-3" stagger={0.035}>
                      {childTodos.length === 0 ? (
                        <AnimatedListItem>
                          <CuteEmptyState title="这个待办集还没有待办" description="点右侧 + 添加一个子待办。" />
                        </AnimatedListItem>
                      ) : (
                        childTodos.map((todo, todoIndex) => (
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
                                canMoveUp={todoIndex > 0}
                                canMoveDown={todoIndex < childTodos.length - 1}
                                disabled={updateTodoSort.isPending}
                                onMoveUp={() => moveTodo(todo.id, collection.id, -1)}
                                onMoveDown={() => moveTodo(todo.id, collection.id, 1)}
                              />
                            ) : null}
                            </div>
                          </AnimatedListItem>
                        ))
                      )}
                    </AnimatedList>
                  ) : null}
                </Card>
                {reorderMode ? (
                  <ReorderControls
                    label={`待办集“${collection.name}”`}
                    canMoveUp={collectionIndex > 0}
                    canMoveDown={collectionIndex < collectionOrderIds.length - 1}
                    disabled={updateCollection.isPending}
                    onMoveUp={() => moveCollection(collection.id, -1)}
                    onMoveDown={() => moveCollection(collection.id, 1)}
                  />
                ) : null}
                </div>
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        )}
      </div>

      <CheckinNoteDialog open={noteType !== null} type={noteType} submitting={noteSubmitting} onOpenChange={(open) => !open && closeNoteDialog()} onSubmit={submitNoteCheckin} />
      <AddCollectionModal
        open={collectionOpen}
        onOpenChange={setCollectionOpen}
        onSubmit={async (payload) => {
          await createCollection.mutateAsync({ ...payload, sortOrder: orderedCollections.length + 1 });
          void successFeedback();
          toast({ title: "待办集已创建", tone: "success" });
        }}
      />
      <TodoEditorDialog
        open={todoCollectionId !== null}
        defaultCollectionId={todoCollectionId}
        onOpenChange={(open) => {
          if (!open) setTodoCollectionId(null);
        }}
        onSubmit={handleCreateTodo}
      />
      <TodoEditorDialog
        open={!!editingTodo}
        todo={editingTodo}
        onOpenChange={(open) => {
          if (!open) setEditingTodo(undefined);
        }}
        onSubmit={handleUpdateTodo}
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

      <Dialog.Root open={guideOpen} onOpenChange={setGuideOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
          <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 max-h-[90vh] w-[calc(100%-52px)] max-w-[350px] rounded-[30px] p-5">
            <Dialog.Close className="absolute right-4 top-4 rounded-full bg-[var(--app-primary-soft)] p-2 text-[var(--app-text)]" aria-label="关闭">
              <X size={16} />
            </Dialog.Close>
            <Dialog.Title className="text-xl font-black text-[var(--app-text)]">展开这个待办集</Dialog.Title>
            <p className="mt-3 text-sm leading-6 text-[var(--app-muted)]">你已经为这个待办集添加了一个子待办，点击待办集卡片空白处就可以展开或收起。</p>
            <Button className="mt-5 w-full" onClick={() => setGuideOpen(false)}>
              好的，我试试
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
