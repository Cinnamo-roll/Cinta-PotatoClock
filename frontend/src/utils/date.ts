export function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function localMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatLocalDate(value: string) {
  if (!value) return "";
  return parseLocalDate(value).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
}

export function daysInLocalMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

export function isBeforeDateKey(value: string, minDate: string) {
  return !!value && !!minDate && value < minDate;
}

export function addMonths(date: Date, step: number) {
  const next = new Date(date);
  next.setMonth(date.getMonth() + step);
  return next;
}
