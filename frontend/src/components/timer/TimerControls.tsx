import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/common/Button";
import type { TimerState } from "@/types/timer";

interface TimerControlsProps {
  state: TimerState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export function TimerControls({ state, onStart, onPause, onResume, onReset, onSkip }: TimerControlsProps) {
  const isRunning = state === "running";
  const isPaused = state === "paused";
  const mainLabel = isRunning ? "暂停" : isPaused ? "继续" : "开始";
  const MainIcon = isRunning ? Pause : Play;
  const handleMain = isRunning ? onPause : isPaused ? onResume : onStart;

  return (
    <div className="space-y-3">
      <Button className="w-full text-base" onClick={handleMain}>
        <MainIcon size={19} />
        {mainLabel}
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onReset}>
          <RotateCcw size={17} />
          重置
        </Button>
        <Button variant="secondary" onClick={onSkip}>
          <SkipForward size={17} />
          跳过
        </Button>
      </div>
    </div>
  );
}
