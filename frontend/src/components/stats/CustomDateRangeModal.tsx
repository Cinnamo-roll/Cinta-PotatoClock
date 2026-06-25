import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/common/Button";
import { DatePicker } from "@/components/common/DatePicker";
import type { StatsDateRange } from "@/types/stats";

interface CustomDateRangeModalProps {
  open: boolean;
  value: StatsDateRange;
  onChange: (value: StatsDateRange) => void;
  onClose: () => void;
}

export function CustomDateRangeModal({ open, value, onChange, onClose }: CustomDateRangeModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
        <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 max-h-[90vh] w-[calc(100%-44px)] max-w-[360px] rounded-[28px] border-white/80 bg-white/85 p-5 shadow-[0_16px_40px_rgba(120,70,90,0.18)] backdrop-blur-[20px]">
          <Dialog.Title className="text-lg font-black">自定日期</Dialog.Title>
          <p className="mt-1 text-sm font-bold text-[var(--app-muted)]">选择你想查看的专注统计范围。</p>
          <div className="mt-5 grid gap-3">
            <DatePicker label="开始日期" value={value.startDate ?? ""} onChange={(startDate) => onChange({ ...value, startDate })} />
            <DatePicker label="结束日期" value={value.endDate ?? ""} minDate={value.startDate} onChange={(endDate) => onChange({ ...value, endDate })} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button onClick={onClose}>确认</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
