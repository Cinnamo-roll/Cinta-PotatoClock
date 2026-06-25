import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useThemeStore } from "@/theme/themeStore";
import { ThemeColorPicker } from "./ThemeColorPicker";
import { ThemePreview } from "./ThemePreview";

interface ThemePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemePanel({ open, onOpenChange }: ThemePanelProps) {
  const draftThemeColor = useThemeStore((state) => state.draftThemeColor);
  const draftCustomColor = useThemeStore((state) => state.draftCustomColor);
  const previewTheme = useThemeStore((state) => state.previewTheme);
  const saveTheme = useThemeStore((state) => state.saveTheme);
  const resetTheme = useThemeStore((state) => state.resetTheme);
  const restoreDraft = useThemeStore((state) => state.restoreDraft);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) restoreDraft();
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(38,35,42,0.18)]" />
        <Dialog.Content className="app-sheet-panel app-modal-scroll fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88vh] max-w-[430px] overflow-y-auto rounded-t-[30px] border border-[var(--app-border)] bg-[var(--app-card)] p-5 pb-[calc(var(--safe-bottom)+20px)] shadow-[0_-12px_32px_rgba(80,40,60,0.10)] outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-black text-[var(--app-text)]">主题颜色搭配</Dialog.Title>
            <Dialog.Close className="rounded-full bg-[var(--app-primary-soft)] p-2 text-[var(--app-text)]" aria-label="关闭">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="space-y-5">
            <ThemePreview themeColor={draftThemeColor} customColor={draftCustomColor} />
            <ThemeColorPicker
              value={draftThemeColor}
              customColor={draftCustomColor}
              onChange={(value) => previewTheme(value)}
              onCustomColorChange={(value) => previewTheme("custom", value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => void resetTheme()}>
                恢复默认
              </Button>
              <Button
                onClick={() => {
                  void saveTheme();
                  onOpenChange(false);
                }}
              >
                保存
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
