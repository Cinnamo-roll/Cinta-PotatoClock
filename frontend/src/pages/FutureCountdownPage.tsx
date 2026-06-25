import { FormEvent, useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarClock, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CuteEmptyState } from "@/components/common/CuteEmptyState";
import { DatePicker } from "@/components/common/DatePicker";
import { Input, Textarea } from "@/components/common/Input";
import { PageHeader } from "@/components/common/PageHeader";
import { MobileShell } from "@/components/layout/MobileShell";
import { useCreateFuturePlanMutation, useDeleteFuturePlanMutation, useFuturePlansQuery } from "@/hooks/useApiQueries";
import { successFeedback } from "@/services/hapticsService";
import { cancelFuturePlanNotification, checkNotificationPermission, scheduleFuturePlanNotification } from "@/services/notificationService";
import { useUiStore } from "@/stores/uiStore";
import type { FuturePlan } from "@/types/futurePlan";
import { formatLocalDate, isBeforeDateKey, localDateKey, parseLocalDate } from "@/utils/date";
import { daysBetween } from "@/utils/todoMetrics";

function formatDate(value: string) {
  return formatLocalDate(value);
}

function planState(plan: FuturePlan) {
  const today = new Date();
  const target = parseLocalDate(plan.targetDate);
  const targetKey = plan.targetDate;
  const todayKey = localDateKey();
  const isPast = targetKey < todayKey;
  const isToday = targetKey === todayKey;
  return {
    isPast,
    isToday,
    days: isPast ? daysBetween(target, today) : daysBetween(today, target),
    label: isToday ? "就是今天" : isPast ? "已过去" : "还剩"
  };
}

export default function FutureCountdownPage() {
  const toast = useUiStore((state) => state.toast);
  const { data: plans = [], isLoading } = useFuturePlansQuery();
  const createPlan = useCreateFuturePlanMutation();
  const deletePlan = useDeleteFuturePlanMutation();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [targetDate, setTargetDate] = useState(localDateKey());
  const [pendingDeletePlan, setPendingDeletePlan] = useState<FuturePlan | null>(null);
  const sortedPlans = useMemo(() => [...plans].sort((a, b) => a.targetDate.localeCompare(b.targetDate)), [plans]);

  useEffect(() => {
    void checkNotificationPermission().then((allowed) => {
      if (!allowed) return;
      sortedPlans.forEach((plan) => {
        void scheduleFuturePlanNotification({ planId: plan.id, title: plan.title, targetDate: plan.targetDate });
      });
    });
  }, [sortedPlans]);

  const reset = () => {
    setTitle("");
    setNote("");
    setTargetDate(localDateKey());
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const submittedDate = targetDate || localDateKey();
    if (isBeforeDateKey(submittedDate, localDateKey())) {
      toast({ title: "日期不能早于今天", description: "请选择今天或之后的日期。", tone: "error" });
      return;
    }
    void createPlan
      .mutateAsync({ title: cleanTitle, note: note.trim(), targetDate: submittedDate })
      .then((plan) => {
        void successFeedback();
        void scheduleFuturePlanNotification({ planId: plan.id, title: plan.title, targetDate: plan.targetDate });
        toast({ title: "未来计划已添加", tone: "success" });
        reset();
        setOpen(false);
      })
      .catch((error) => toast({ title: "未来计划添加失败", description: error instanceof Error ? error.message : "请稍后再试", tone: "error" }));
  };

  const removePlan = (plan: FuturePlan) => {
    void deletePlan
      .mutateAsync(plan.id)
      .then(() => {
        void cancelFuturePlanNotification(plan.id);
        setPendingDeletePlan(null);
        toast({ title: "未来计划已删除" });
      })
      .catch((error) => toast({ title: "删除失败", description: error instanceof Error ? error.message : "请稍后再试", tone: "error" }));
  };

  return (
    <MobileShell>
      <div className="space-y-4">
        <PageHeader
          icon={CalendarClock}
          title="未来倒计时"
          description="把重要日期提前放在眼前"
          action={
            <button className="app-header-button" onClick={() => setOpen(true)} aria-label="添加未来计划" type="button">
              <Plus size={19} />
            </button>
          }
        />

        {isLoading ? <Card className="text-sm font-semibold text-[var(--app-muted)]">正在加载未来计划...</Card> : null}
        {!isLoading && sortedPlans.length === 0 ? (
          <CuteEmptyState title="还没有未来计划" description="添加一个考试、旅行、纪念日或长期目标日期。" actionLabel="添加计划" onAction={() => setOpen(true)} />
        ) : (
          <div className="space-y-3">
            {sortedPlans.map((plan) => {
              const state = planState(plan);
              return (
                <Card key={plan.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[var(--app-primary-strong)]">{formatDate(plan.targetDate)}</p>
                      <h2 className="mt-1 truncate text-xl font-black text-[var(--app-text)]">{plan.title}</h2>
                      {plan.note ? <p className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--app-muted)]">{plan.note}</p> : null}
                    </div>
                    <button className="rounded-full bg-[var(--app-primary-soft)] p-2 text-[var(--app-danger)]" onClick={() => setPendingDeletePlan(plan)} type="button" aria-label="删除计划">
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="mt-4 rounded-[18px] bg-[var(--app-primary-soft)] px-4 py-3">
                    <p className="text-xs font-bold text-[var(--app-muted)]">{state.label}</p>
                    <div className="mt-1 flex items-end gap-1 text-[var(--app-text)]">
                      {state.isToday ? (
                        <p className="text-3xl font-black leading-none">今天</p>
                      ) : (
                        <>
                          <p className="text-4xl font-black leading-none">{state.days}</p>
                          <p className="pb-1 text-sm font-black">天</p>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.22)]" />
          <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 w-[calc(100%-34px)] max-w-[370px] rounded-[28px] p-4 shadow-[0_16px_36px_rgba(80,40,60,0.14)]">
            <form onSubmit={submit}>
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Close className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-primary-soft)]" aria-label="关闭">
                  <X size={18} />
                </Dialog.Close>
                <Dialog.Title className="text-lg font-black">添加未来计划</Dialog.Title>
                <span className="h-10 w-10" />
              </div>
              <div className="space-y-3">
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="计划名称" />
                <Textarea className="min-h-20" value={note} onChange={(event) => setNote(event.target.value)} placeholder="备注，可选" />
                <DatePicker label="日期" value={targetDate} minDate={localDateKey()} onChange={setTargetDate} />
              </div>
              <Button className="mt-5 w-full" type="submit">
                添加
              </Button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <ConfirmDialog
        open={!!pendingDeletePlan}
        title="删除未来计划？"
        description={pendingDeletePlan ? `删除「${pendingDeletePlan.title}」后不会再显示这个倒计时。` : undefined}
        confirmText="删除"
        tone="danger"
        onOpenChange={(open) => {
          if (!open) setPendingDeletePlan(null);
        }}
        onConfirm={() => {
          if (pendingDeletePlan) removePlan(pendingDeletePlan);
        }}
      />
    </MobileShell>
  );
}
