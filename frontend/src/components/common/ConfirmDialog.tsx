import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  tone?: "default" | "success" | "danger";
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function ConfirmDialog({ open, title, description, confirmText = "确认", cancelText = "取消", tone = "default", onOpenChange, onConfirm }: ConfirmDialogProps) {
  const Icon = tone === "danger" ? Trash2 : tone === "success" ? CheckCircle2 : AlertTriangle;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(38,35,42,0.24)] backdrop-blur-[2px]" />
        <Dialog.Content className="app-dialog-panel app-modal-scroll z-[80] w-[calc(100%-48px)] max-w-[350px] rounded-[28px] border-[color-mix(in_srgb,var(--app-border)_78%,transparent)] p-5 shadow-[0_18px_44px_rgba(80,40,60,0.16)]">
          <div
            className={cn(
              "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl",
              tone === "danger" ? "bg-[#FFF1EE] text-[var(--app-danger)]" : tone === "success" ? "bg-[#EAF8EF] text-[#31935A]" : "bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]"
            )}
          >
            <Icon size={24} />
          </div>
          <Dialog.Title className="mt-4 text-center text-lg font-black">{title}</Dialog.Title>
          {description ? <Dialog.Description className="mt-2 text-center text-sm font-semibold leading-6 text-[var(--app-muted)]">{description}</Dialog.Description> : null}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {cancelText}
            </Button>
            <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
