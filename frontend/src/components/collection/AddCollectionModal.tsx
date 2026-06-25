import { FormEvent, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import { Input } from "@/components/common/Input";
import type { TodoCollectionInput } from "@/types/todo";
import { cn } from "@/utils/cn";

interface AddCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: TodoCollectionInput) => Promise<void> | void;
}

const colors = [
  { label: "薄荷绿", value: "#8FD6B3" },
  { label: "天空蓝", value: "#86B7F3" },
  { label: "灰蓝", value: "#8EA4BF" },
  { label: "粉色", value: "#F6AFC3" },
  { label: "紫色", value: "#B99CF0" },
  { label: "红色", value: "#EF7D86" },
  { label: "棕色", value: "#B58667" },
  { label: "深灰", value: "#62646F" },
  { label: "玫红", value: "#D95F9F" },
  { label: "深蓝", value: "#48689D" }
];

export function AddCollectionModal({ open, onOpenChange, onSubmit }: AddCollectionModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(colors[3].value);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name: name.trim(), color });
    setName("");
    setColor(colors[3].value);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
        <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 w-[78vw] max-w-[360px] rounded-[30px] p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Close className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[var(--app-text)]" aria-label="关闭">
                <X size={18} />
              </Dialog.Close>
              <Dialog.Title className="text-lg font-black text-[var(--app-text)]">添加待办集</Dialog.Title>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-primary)] text-[var(--app-text)]" type="submit" aria-label="确认">
                <Check size={18} />
              </button>
            </div>

            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="请输入待办集名称" />
            <div className="mt-4 grid grid-cols-5 gap-3">
              {colors.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={cn("h-10 w-10 rounded-full border-4", color === item.value ? "border-[var(--app-text)]/60" : "border-white")}
                  style={{ backgroundColor: item.value }}
                  onClick={() => setColor(item.value)}
                  aria-label={item.label}
                />
              ))}
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
