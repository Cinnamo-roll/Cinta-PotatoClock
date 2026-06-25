import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { Textarea } from "@/components/common/Input";
import { checkinLabel, checkinNoteIntro, checkinNotePlaceholder, checkinSubmitText, type CheckinType } from "@/services/checkinService";

interface CheckinNoteDialogProps {
  open: boolean;
  type: CheckinType | null;
  submitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (note: string) => void;
}

export function CheckinNoteDialog({ open, type, submitting = false, onOpenChange, onSubmit }: CheckinNoteDialogProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) setNote("");
  }, [open, type]);

  const title = type ? checkinLabel(type) : "打卡";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
        <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 w-[calc(100%-52px)] max-w-[350px] rounded-[30px] p-5">
          <Dialog.Close className="absolute right-4 top-4 rounded-full bg-[var(--app-primary-soft)] p-2 text-[var(--app-text)]" aria-label="关闭">
            <X size={16} />
          </Dialog.Close>
          <Dialog.Title className="text-xl font-black text-[var(--app-text)]">{title}</Dialog.Title>
          <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{checkinNoteIntro(type)}</p>
          <Textarea className="mt-4" value={note} onChange={(event) => setNote(event.target.value)} maxLength={255} placeholder={checkinNotePlaceholder(type)} />
          <div className="mt-4 flex gap-2">
            <Button className="flex-1" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              取消
            </Button>
            <Button className="flex-1" onClick={() => onSubmit(note)} disabled={submitting}>
              {submitting ? "保存中..." : checkinSubmitText(type)}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
