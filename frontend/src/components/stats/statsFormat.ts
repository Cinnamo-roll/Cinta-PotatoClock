export function formatMinutes(totalMinutes = 0) {
  const safeMinutes = Number.isFinite(totalMinutes) ? Math.max(0, Math.round(totalMinutes)) : 0;
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  if (hours <= 0) return `${minutes}分钟`;
  if (minutes <= 0) return `${hours}小时`;
  return `${hours}小时${minutes}分钟`;
}

export function formatDuration(totalSeconds: number | undefined | null, fallbackMinutes = 0) {
  if (!Number.isFinite(totalSeconds)) return formatMinutes(fallbackMinutes);
  const safeSeconds = Math.max(0, Math.floor(totalSeconds ?? 0));
  if (safeSeconds < 60) return `${safeSeconds}秒`;
  return formatMinutes(Math.floor(safeSeconds / 60));
}

export function compactMinutes(totalMinutes = 0) {
  const safeMinutes = Number.isFinite(totalMinutes) ? Math.max(0, Math.round(totalMinutes)) : 0;
  if (safeMinutes < 60) return { value: String(safeMinutes), unit: "分钟" };
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  if (minutes <= 0) return { value: String(hours), unit: "小时" };
  return { value: String(hours), unit: `小时${minutes}分钟` };
}

export function formatPercent(value = 0) {
  if (!Number.isFinite(value)) return "0";
  return String(Math.round(value));
}

export function dateText(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

export function timeText(value: string) {
  return new Date(value).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}
