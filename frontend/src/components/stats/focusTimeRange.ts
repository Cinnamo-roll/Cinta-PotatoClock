export type FocusTimeRangeError = "invalid-date" | "invalid-time" | "same-time";

export type FocusTimeRangeResult =
  | {
      valid: true;
      startTime: string;
      endTime: string;
      startedAt: string;
      endedAt: string;
      durationMinutes: number;
      crossesMidnight: boolean;
    }
  | {
      valid: false;
      error: FocusTimeRangeError;
      message: string;
    };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(\d{2}):(\d{2})$/;

function localDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

function nextCalendarDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  if (value.getUTCFullYear() !== year || value.getUTCMonth() !== month - 1 || value.getUTCDate() !== day) return null;
  value.setUTCDate(value.getUTCDate() + 1);
  return `${String(value.getUTCFullYear()).padStart(4, "0")}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
}

export function normalizeClockTime(value: string) {
  const match = TIME_PATTERN.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function clockTimeParts(value: string) {
  const normalized = normalizeClockTime(value) ?? "00:00";
  const [hours, minutes] = normalized.split(":");
  return { hours, minutes };
}

export function clockTimeFromDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "00:00";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function buildFocusTimeRange(date: string, startValue: string, endValue: string): FocusTimeRangeResult {
  const nextDate = DATE_PATTERN.test(date) ? nextCalendarDate(date) : null;
  if (!nextDate) {
    return { valid: false, error: "invalid-date", message: "记录日期无效，请返回历史记录后重试。" };
  }

  const startTime = normalizeClockTime(startValue);
  const endTime = normalizeClockTime(endValue);
  if (!startTime || !endTime) {
    return { valid: false, error: "invalid-time", message: "请选择完整的开始和结束时间。" };
  }

  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  const startMinuteOfDay = startHours * 60 + startMinutes;
  const endMinuteOfDay = endHours * 60 + endMinutes;

  if (startMinuteOfDay === endMinuteOfDay) {
    return { valid: false, error: "same-time", message: "开始和结束时间不能相同。" };
  }

  const crossesMidnight = endMinuteOfDay < startMinuteOfDay;
  const durationMinutes = crossesMidnight
    ? 24 * 60 - startMinuteOfDay + endMinuteOfDay
    : endMinuteOfDay - startMinuteOfDay;
  const endDate = crossesMidnight ? nextDate : date;

  return {
    valid: true,
    startTime,
    endTime,
    startedAt: localDateTime(date, startTime),
    endedAt: localDateTime(endDate, endTime),
    durationMinutes,
    crossesMidnight
  };
}
