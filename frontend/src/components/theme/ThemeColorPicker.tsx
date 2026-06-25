import { themePalettes, type ThemeColor } from "@/theme/themes";
import { cn } from "@/utils/cn";

interface ThemeColorPickerProps {
  value: ThemeColor;
  customColor: string;
  onChange: (value: ThemeColor) => void;
  onCustomColorChange: (value: string) => void;
}

export function ThemeColorPicker({ value, customColor, onChange, onCustomColorChange }: ThemeColorPickerProps) {
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
        <label className="mt-4 flex items-center justify-between rounded-3xl border border-[var(--app-border)] bg-[var(--app-primary-soft)] px-4 py-3 text-sm font-bold text-[var(--app-text)]">
          自定义颜色
          <input className="h-10 w-16 rounded-xl" type="color" value={customColor} onChange={(event) => onCustomColorChange(event.target.value)} />
        </label>
      ) : null}
    </div>
  );
}
