import type { ThemeMode } from "@/types/settings";

interface ThemeToggleProps {
  value: ThemeMode;
  onChange: (theme: ThemeMode) => void;
}

const options: Array<{ value: ThemeMode; label: string }> = [
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
  { value: "system", label: "跟随系统" }
];

export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          className={`min-h-11 rounded-2xl text-sm font-bold ${value === option.value ? "bg-potato text-soil" : "bg-white/55 text-soil/60 dark:bg-white/10 dark:text-cream/60"}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
