import { themePalettes, type ThemeColor } from "@/theme/themes";
import { cn } from "@/utils/cn";

interface ThemeColorPickerProps {
  value: ThemeColor;
  customColor: string;
  onChange: (value: ThemeColor) => void;
  onCustomColorChange: (value: string) => void;
}

export function ThemeColorPicker({ value, customColor, onChange, onCustomColorChange }: ThemeColorPickerProps) {
  const customSwatches = ["#F58CB2", "#8FD6B3", "#86B7F3", "#F4C95D", "#B99CF0", "#EF7D86", "#62646F", "#D95F9F"];
  const options: Array<{ value: ThemeColor; label: string; color: string }> = [
    { value: "rose", label: "粉白", color: themePalettes.rose.primary },
    { value: "mint", label: "薄荷绿", color: themePalettes.mint.primary },
    { value: "sky", label: "天空蓝", color: themePalettes.sky.primary },
    { value: "cream", label: "奶油黄", color: themePalettes.cream.primary },
    { value: "lavender", label: "薰衣草", color: themePalettes.lavender.primary },
    { value: "mocha", label: "浅咖啡", color: themePalettes.mocha.primary },
    { value: "custom", label: "自定义", color: customColor }
  ];

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            className="flex flex-col items-center gap-2 text-xs font-bold text-[var(--app-muted)]"
            type="button"
            onClick={() => onChange(option.value)}
          >
            <span
              className={cn("h-11 w-11 rounded-full border-4", value === option.value ? "border-[var(--app-text)]" : "border-white")}
              style={{ background: option.color }}
            />
            {option.label}
          </button>
        ))}
      </div>
      {value === "custom" ? (
        <div className="mt-4 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-primary-soft)] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[var(--app-text)]">自定义颜色</p>
              <p className="text-xs font-bold text-[var(--app-muted)]">选择一个舒服的主色</p>
            </div>
            <label className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[18px] border-4 border-white shadow-[0_10px_24px_color-mix(in_srgb,var(--app-primary)_14%,transparent)]" style={{ backgroundColor: customColor }}>
              <span className="sr-only">打开颜色选择器</span>
              <input className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="color" value={customColor} onChange={(event) => onCustomColorChange(event.target.value)} />
            </label>
          </div>
          <div className="mt-3 grid grid-cols-8 gap-2">
            {customSwatches.map((color) => (
              <button
                key={color}
                type="button"
                className={cn("h-8 rounded-full border-2 transition active:scale-95", customColor.toLowerCase() === color.toLowerCase() ? "border-[var(--app-text)] ring-2 ring-white" : "border-white")}
                style={{ backgroundColor: color }}
                onClick={() => onCustomColorChange(color)}
                aria-label={`选择颜色 ${color}`}
              />
            ))}
          </div>
          <input
            className="mt-3 h-11 w-full rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] px-4 text-base font-black uppercase text-[var(--app-text)] outline-none focus:border-[var(--app-primary)]"
            value={customColor}
            onChange={(event) => onCustomColorChange(event.target.value)}
            maxLength={7}
            inputMode="text"
            aria-label="自定义颜色值"
          />
        </div>
      ) : null}
    </div>
  );
}
