import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface OptionPickerProps<T extends string> {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

export function OptionPicker<T extends string>({ value, options, onChange, ariaLabel, disabled = false, className }: OptionPickerProps<T>) {
  return (
    <div className={cn("grid gap-2", options.length <= 2 ? "grid-cols-2" : "grid-cols-3", className)} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex min-h-10 items-center justify-center gap-1.5 rounded-[16px] border px-3 text-sm font-black transition active:scale-[0.98]",
              selected
                ? "border-[color-mix(in_srgb,var(--app-primary)_68%,var(--app-card))] bg-[var(--app-card)] text-[var(--app-primary-strong)] shadow-[0_8px_18px_color-mix(in_srgb,var(--app-primary)_12%,transparent)]"
                : "border-transparent bg-[color-mix(in_srgb,var(--app-card)_56%,transparent)] text-[var(--app-muted)]",
              disabled && "cursor-not-allowed opacity-55 active:scale-100"
            )}
          >
            {selected ? <Check size={14} strokeWidth={3} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
