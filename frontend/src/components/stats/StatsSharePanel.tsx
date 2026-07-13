import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/common/Button";
import { Construction } from "lucide-react";

export function StatsSharePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
        <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 max-h-[90vh] w-[calc(100%-44px)] max-w-[360px] rounded-[28px] p-5">
          <div className="flex flex-col items-center py-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]">
              <Construction size={25} />
            </span>
            <Dialog.Title className="mt-4 text-xl font-black">待开发</Dialog.Title>
            <p className="mt-2 text-sm font-bold leading-6 text-[var(--app-muted)]">专注成果分享将在后续版本继续开发。</p>
          </div>
          <Button className="mt-4 w-full" onClick={onClose}>
            我知道了
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
