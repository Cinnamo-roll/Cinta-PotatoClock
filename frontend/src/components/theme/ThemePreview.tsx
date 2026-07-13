import type { ThemeColor } from "@/theme/themes";
import { getThemePalette } from "@/theme/applyTheme";

interface ThemePreviewProps {
  themeColor: ThemeColor;
  customColor: string;
}

export function ThemePreview({ themeColor, customColor }: ThemePreviewProps) {
  const palette = getThemePalette(themeColor, customColor);

  return (
    <div className="rounded-[24px] border p-4" style={{ background: palette.bg, borderColor: palette.border }}>
      <div className="rounded-[20px] p-4 shadow-sm" style={{ background: palette.card }}>
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 rounded-full" style={{ background: palette.primarySoft }} />
          <div className="h-3 w-3 rounded-full" style={{ background: palette.accent }} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="h-4 w-24 rounded-full" style={{ background: palette.text }} />
            <div className="mt-2 h-3 w-16 rounded-full" style={{ background: palette.border }} />
          </div>
          <div className="rounded-full px-4 py-2 text-sm font-black" style={{ background: palette.primary, color: palette.text }}>
            开始
          </div>
        </div>
      </div>
    </div>
  );
}
