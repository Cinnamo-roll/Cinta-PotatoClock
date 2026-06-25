import type { TimerMode } from "@/types/timer";

export function formatSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function modeLabel(mode: TimerMode) {
  return {
    focus: "专注",
    short_break: "短休息",
    long_break: "长休息"
  }[mode];
}

export function friendlyError(message?: string) {
  if (!message) return "请求失败，请稍后再试";
  if (/network|timeout|failed/i.test(message)) return "网络有点堵，请稍后再试";
  return message;
}
