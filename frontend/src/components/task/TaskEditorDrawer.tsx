import { FormEvent, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input, Textarea } from "@/components/common/Input";
import type { Task, TaskInput, TaskPriority } from "@/types/task";
import { cn } from "@/utils/cn";

interface TaskEditorDrawerProps {
  open: boolean;
  task?: Task;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: TaskInput) => void;
}

const priorities: Array<{ value: TaskPriority; label: string }> = [
  { value: "low", label: "轻轻种" },
  { value: "medium", label: "稳稳种" },
  { value: "high", label: "先种它" }
];

export function TaskEditorDrawer({ open, task, onOpenChange, onSubmit }: TaskEditorDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [estimatedPotatoes, setEstimatedPotatoes] = useState(2);

  useEffect(() => {
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setPriority(task?.priority ?? "medium");
    setEstimatedPotatoes(task?.estimatedPotatoes ?? 2);
  }, [task, open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), priority, estimatedPotatoes });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
        <Dialog.Content className="app-sheet-panel app-modal-scroll fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90vh] max-w-[430px] overflow-y-auto rounded-t-[34px] border border-[var(--app-border)] bg-[var(--app-card)] p-5 pb-[calc(var(--safe-bottom)+20px)] shadow-[0_-12px_32px_rgba(80,40,60,0.10)] outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-black text-[var(--app-text)]">{task ? "编辑待办" : "新建待办"}</Dialog.Title>
            <Dialog.Close className="rounded-full bg-[var(--app-primary-soft)] p-2 text-[var(--app-text)]" aria-label="关闭">
              <X size={18} />
            </Dialog.Close>
          </div>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="任务标题" />
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="备注" />
            <div className="grid grid-cols-3 gap-2">
              {priorities.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={cn(
                    "min-h-11 rounded-2xl text-sm font-bold",
                    priority === item.value ? "bg-[var(--app-primary)] text-[var(--app-text)]" : "bg-[var(--app-card-soft)] text-[var(--app-muted)]"
                  )}
                  onClick={() => setPriority(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Input
              type="number"
              min={1}
              max={20}
              value={estimatedPotatoes}
              onChange={(event) => setEstimatedPotatoes(Number(event.target.value))}
              placeholder="预计次数"
            />
            <Button className="w-full" type="submit">
              {task ? "保存待办" : "添加待办"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
