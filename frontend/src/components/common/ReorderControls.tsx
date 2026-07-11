import { ChevronDown, ChevronUp } from "lucide-react";

interface ReorderControlsProps {
  label: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  disabled?: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function ReorderControls({ label, canMoveUp, canMoveDown, disabled = false, onMoveUp, onMoveDown }: ReorderControlsProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2" aria-label={`调整${label}顺序`}>
      <button
        className="app-reorder-button"
        disabled={disabled || !canMoveUp}
        onClick={onMoveUp}
        type="button"
        aria-label={`${label}上移`}
      >
        <ChevronUp size={18} />
      </button>
      <button
        className="app-reorder-button"
        disabled={disabled || !canMoveDown}
        onClick={onMoveDown}
        type="button"
        aria-label={`${label}下移`}
      >
        <ChevronDown size={18} />
      </button>
    </div>
  );
}
