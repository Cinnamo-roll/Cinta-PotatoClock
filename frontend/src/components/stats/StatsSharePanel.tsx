import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/common/Button";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { StatsSummary } from "@/types/stats";

export function StatsSharePanel({ open, summary, onClose }: { open: boolean; summary: StatsSummary; onClose: () => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
        <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 max-h-[90vh] w-[calc(100%-44px)] max-w-[360px] rounded-[28px] border-white/80 bg-white/88 p-5 shadow-[0_16px_40px_rgba(120,70,90,0.18)] backdrop-blur-[20px]">
          <Dialog.Title className="text-lg font-black">分享专注成果</Dialog.Title>
          <div className="mt-4 rounded-[24px] bg-[linear-gradient(180deg,var(--app-primary-soft),var(--app-card))] p-5 text-center">
            <p className="text-sm font-black text-[var(--app-muted)]">土豆时钟</p>
            <p className="mt-2 text-3xl font-black text-[var(--app-primary-strong)]">{summary.totalFocusCount} 次</p>
            <p className="mt-1 text-sm font-bold text-[var(--app-muted)]">累计专注 {formatMinutes(summary.totalFocusMinutes)}</p>
          </div>
          <Button className="mt-4 w-full" onClick={onClose}>
            保存分享卡
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
