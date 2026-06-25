import { FormEvent, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import { DatePicker } from "@/components/common/DatePicker";
import { Input, Textarea } from "@/components/common/Input";
import { OptionPicker } from "@/components/common/OptionPicker";
import { lightImpact } from "@/services/hapticsService";
import type { TodoCategory, TodoInput, TodoItem, TimerType } from "@/types/todo";
import { cn } from "@/utils/cn";
import { isBeforeDateKey, localDateKey } from "@/utils/date";

interface TodoEditorDialogProps {
  open: boolean;
  defaultCollectionId?: number | null;
  todo?: TodoItem;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: TodoInput) => Promise<void> | void;
}

const categoryOptions: Array<{ value: TodoCategory; label: string; title: string }> = [
  { value: "normal", label: "普通", title: "添加待办" },
  { value: "habit", label: "养习惯", title: "添加习惯" },
  { value: "goal", label: "定目标", title: "添加目标" }
];

const timerOptions: Array<{ value: TimerType; label: string }> = [
  { value: "countdown", label: "倒计时" },
  { value: "countup", label: "正计时" },
  { value: "none", label: "不计时" }
];

const recurrenceOptions: Array<{ value: "每天" | "每周" | "每月"; label: string }> = [
  { value: "每天", label: "每天" },
  { value: "每周", label: "每周" },
  { value: "每月", label: "每月" }
];

const targetUnitOptions: Array<{ value: "分钟" | "次"; label: string }> = [
  { value: "分钟", label: "分钟" },
  { value: "次", label: "次" }
];

const DEFAULT_BACKGROUND_STYLE = "default";

export function TodoEditorDialog({ open, defaultCollectionId = null, todo, onOpenChange, onSubmit }: TodoEditorDialogProps) {
  const [category, setCategory] = useState<TodoCategory>("normal");
  const [timerType, setTimerType] = useState<TimerType>("countdown");
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [countToStats, setCountToStats] = useState(true);
  const [note, setNote] = useState("");
  const [recurrence, setRecurrence] = useState<"每天" | "每周" | "每月">("每天");
  const [targetAmount, setTargetAmount] = useState("25");
  const [targetUnit, setTargetUnit] = useState<"分钟" | "次">("分钟");
  const [deadline, setDeadline] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dialogTitle = todo ? "编辑待办" : categoryOptions.find((item) => item.value === category)?.title ?? "添加待办";

  const reset = () => {
    setCategory("normal");
    setTimerType("countdown");
    setTitle("");
    setDurationMinutes(25);
    setCountToStats(true);
    setNote("");
    setRecurrence("每天");
    setTargetAmount("25");
    setTargetUnit("分钟");
    setDeadline("");
    setSubmitError("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!open) return;
    if (!todo) {
      reset();
      return;
    }
    setCategory(todo.category);
    setTimerType(todo.timerType);
    setTitle(todo.title);
    setDurationMinutes(todo.timerType === "none" ? 25 : Math.max(1, todo.durationMinutes || 25));
    setCountToStats(todo.countToStats ?? todo.includeInStats);
    setNote(todo.note ?? "");
    setRecurrence(todo.recurrence ?? "每天");
    setTargetAmount(String(todo.timerType === "none" && todo.targetUnit !== "次" ? 1 : todo.targetAmount ?? (todo.timerType === "none" ? 1 : todo.durationMinutes || 25)));
    setTargetUnit(todo.timerType === "none" ? "次" : todo.targetUnit ?? "分钟");
    setDeadline(todo.deadline ?? "");
    setSubmitError("");
    setIsSubmitting(false);
  }, [open, todo]);

  const handleTimerChange = (value: TimerType) => {
    setTimerType(value);
    setSubmitError("");
    if (value === "none") {
      setTargetUnit("次");
      setTargetAmount("1");
    } else if (targetUnit === "次") {
      setTargetUnit("分钟");
      setTargetAmount(String(durationMinutes));
    }
    void lightImpact();
  };

  const handleCategoryChange = (value: TodoCategory) => {
    setCategory(value);
    if (value !== "normal" && timerType === "none") {
      setTargetUnit("次");
      setTargetAmount((amount) => String(Math.max(1, parsePositiveInt(amount, 1))));
    }
    setSubmitError("");
    void lightImpact();
  };

  const handleDurationChange = (value: number) => {
    if (!Number.isFinite(value)) return;
    const next = Math.max(1, Math.floor(value));
    setDurationMinutes(next);
    if (targetUnit === "分钟" && (category === "habit" || category === "goal")) setTargetAmount(String(next));
  };

  const parsePositiveInt = (value: string, fallback = 1) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(1, Math.floor(parsed));
  };

  const handleTargetAmountChange = (value: string) => {
    setTargetAmount(value.replace(/[^\d]/g, "").slice(0, 5));
  };

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (isSubmitting) return;
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setSubmitError("先写一个待办名称。");
      return;
    }
    if (category === "goal" && deadline && isBeforeDateKey(deadline, localDateKey())) {
      setSubmitError("截止日期不能早于今天。");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
        title: cleanTitle,
        durationMinutes: timerType === "countdown" ? durationMinutes : 0,
        timerType,
        category,
        collectionId: todo ? todo.collectionId ?? null : defaultCollectionId,
        backgroundStyle: DEFAULT_BACKGROUND_STYLE,
        includeInStats: countToStats,
        countToStats,
        recurrence: category === "habit" ? recurrence : undefined,
        targetAmount: category === "habit" || category === "goal" ? parsePositiveInt(targetAmount) : undefined,
        targetUnit: category === "habit" || category === "goal" ? (timerType === "none" ? "次" : targetUnit) : undefined,
        deadline: category === "goal" ? deadline || localDateKey() : undefined,
        note: note.trim()
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "保存失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.22)]" />
        <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 w-[calc(100%-34px)] max-w-[380px] rounded-[28px] p-4 shadow-[0_16px_36px_rgba(80,40,60,0.14)]">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Close className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-text)]" aria-label="关闭">
                <X size={18} />
              </Dialog.Close>
              <Dialog.Title className="text-lg font-black text-[var(--app-text)]">{dialogTitle}</Dialog.Title>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-primary)] text-white disabled:opacity-60" type="submit" aria-label="保存" disabled={isSubmitting}>
                <Check size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-[22px] bg-[var(--app-primary-soft)] p-1">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleCategoryChange(option.value)}
                  className={cn(
                    "min-h-10 rounded-[18px] text-sm font-bold text-[var(--app-muted)]",
                    category === option.value && "bg-[var(--app-card)] text-[var(--app-text)] shadow-[0_8px_18px_rgba(47,47,53,0.08)]"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="待办名称" />

              <Textarea className="min-h-20" value={note} onChange={(event) => setNote(event.target.value)} placeholder="备注，可选" />

              <div>
                <p className="mb-2 text-sm font-bold text-[var(--app-muted)]">计时方式</p>
                <div className="grid grid-cols-3 gap-2">
                  {timerOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleTimerChange(option.value)}
                      className={cn(
                        "min-h-11 rounded-[18px] bg-[var(--app-primary-soft)] px-2 text-sm font-black text-[var(--app-muted)]",
                        timerType === option.value && "bg-[var(--app-primary)] text-white"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {timerType === "countdown" ? (
                <div className="rounded-[22px] bg-[var(--app-primary-soft)] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[var(--app-muted)]">单次时长</span>
                    <label className="flex items-center gap-2 text-base font-black text-[var(--app-text)]">
                      <Input className="h-10 w-24 text-center" min={1} max={180} type="number" value={durationMinutes} onChange={(event) => handleDurationChange(Number(event.target.value))} />
                      分钟
                    </label>
                  </div>
                  <input className="w-full [accent-color:var(--app-primary)]" type="range" min={1} max={180} value={durationMinutes} onChange={(event) => handleDurationChange(Number(event.target.value))} />
                </div>
              ) : null}

              {category === "habit" ? (
                <div className="space-y-3 rounded-[22px] bg-[var(--app-primary-soft)] p-3">
                  <div>
                    <p className="mb-2 text-sm font-bold text-[var(--app-muted)]">习惯周期</p>
                    <OptionPicker value={recurrence} options={recurrenceOptions} onChange={setRecurrence} ariaLabel="习惯周期" />
                  </div>
                  <div className="space-y-2 text-sm font-bold text-[var(--app-muted)]">
                    <span>计划完成</span>
                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(126px,1.3fr)] gap-2">
                      <Input className="h-10 text-center" inputMode="numeric" value={targetAmount} onChange={(event) => handleTargetAmountChange(event.target.value)} onBlur={() => setTargetAmount(String(parsePositiveInt(targetAmount)))} />
                      <OptionPicker value={timerType === "none" ? "次" : targetUnit} options={targetUnitOptions} disabled={timerType === "none"} onChange={setTargetUnit} ariaLabel="计划单位" />
                    </div>
                  </div>
                </div>
              ) : null}

              {category === "goal" ? (
                <div className="space-y-3 rounded-[22px] bg-[var(--app-primary-soft)] p-3">
                  <DatePicker label="截止日期" value={deadline || localDateKey()} minDate={localDateKey()} onChange={setDeadline} />
                  <div className="space-y-2 text-sm font-bold text-[var(--app-muted)]">
                    <span>总计划量</span>
                    <div className="grid grid-cols-[minmax(0,1fr)_minmax(126px,1.3fr)] gap-2">
                      <Input className="h-10 text-center" inputMode="numeric" value={targetAmount} onChange={(event) => handleTargetAmountChange(event.target.value)} onBlur={() => setTargetAmount(String(parsePositiveInt(targetAmount)))} />
                      <OptionPicker value={timerType === "none" ? "次" : targetUnit} options={targetUnitOptions} disabled={timerType === "none"} onChange={setTargetUnit} ariaLabel="目标单位" />
                    </div>
                  </div>
                </div>
              ) : null}

              <label className="flex min-h-12 items-center justify-between rounded-[18px] bg-[var(--app-primary-soft)] px-3 text-sm font-bold text-[var(--app-text)]">
                计入统计
                <input className="h-5 w-5 [accent-color:var(--app-primary)]" type="checkbox" checked={countToStats} onChange={(event) => setCountToStats(event.target.checked)} />
              </label>
              {submitError ? <p className="rounded-2xl bg-[color-mix(in_srgb,var(--app-danger)_10%,var(--app-card))] px-3 py-2 text-sm font-bold text-[var(--app-danger)]">{submitError}</p> : null}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
