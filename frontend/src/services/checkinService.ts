export type CheckinType = "wakeup" | "focus_today" | "sleep";

export interface CheckinPayload {
  type: CheckinType;
  checkinTime: string;
  note?: string;
}

export interface CheckinLineLike {
  date: string;
  time?: string | null;
  minutesOfDay: number | null;
}

interface CheckinMeta {
  label: string;
  note: string;
  successTitle: string;
  noteIntro?: string;
  submitText?: string;
  windowText?: string;
  lines: string[];
}

const WAKEUP_START = 5 * 60;
const WAKEUP_END = 12 * 60;
const EARLY_WAKEUP_END = 8 * 60;
const SLEEP_START = 20 * 60;
const SLEEP_END = 2 * 60;
const EARLY_SLEEP_END = 23 * 60;

const CHECKIN_META: Record<CheckinType, CheckinMeta> = {
  wakeup: {
    label: "起床打卡",
    note: "记录今天醒来的时间",
    successTitle: "早呀，起床打卡好了",
    noteIntro: "记录一下醒来的状态，可以留空直接打卡。",
    submitText: "记下起床",
    windowText: "05:00-12:00 前",
    lines: ["今天从清醒一点开始", "醒得很稳，先喝口水", "把今天慢慢启动起来"]
  },
  focus_today: {
    label: "今日专注打卡",
    note: "记录今天已经开始专注",
    successTitle: "今日专注已打卡",
    submitText: "记下专注",
    lines: ["先从一个小任务开始", "今天的专注入口已经打开", "给今天留一段安静时间"]
  },
  sleep: {
    label: "睡眠打卡",
    note: "记录今晚准备休息",
    successTitle: "晚安，睡眠打卡好了",
    noteIntro: "睡前简单收个尾，可以留空直接打卡。",
    submitText: "记下睡眠",
    windowText: "20:00-次日 02:00 前",
    lines: ["可以慢慢收尾了", "今晚早点放过大脑", "给明天留一个轻一点的开头"]
  }
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function checkinMinutesOfDay(type: CheckinType, date: Date) {
  const minutes = minutesOfDay(date);
  if (type === "sleep" && date.getHours() < 12) return minutes + 24 * 60;
  return minutes;
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toLocalDateTime(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function timeText(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function dateTimeText(date: Date) {
  return `${localDateKey(date)} ${timeText(date)}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function pickLine(type: CheckinType, date: Date) {
  const lines = CHECKIN_META[type].lines;
  const index = (date.getDate() + date.getHours() + date.getMinutes()) % lines.length;
  return lines[index];
}

function weatherName(code: number) {
  if (code === 0) return "晴";
  if ([1, 2, 3].includes(code)) return "多云";
  if ([45, 48].includes(code)) return "有雾";
  if ([51, 53, 55, 56, 57].includes(code)) return "毛毛雨";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "下雨";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "下雪";
  if ([95, 96, 99].includes(code)) return "雷阵雨";
  return "天气稳定";
}

function timingStatus(type: CheckinType, minutes: number) {
  if (type === "wakeup") return minutes < EARLY_WAKEUP_END ? "早起" : "晚起";
  if (type === "sleep") return minutes < EARLY_SLEEP_END ? "早睡" : "晚睡";
  return undefined;
}

function streakText(type: CheckinType, date: Date, lineItems: CheckinLineLike[] = []) {
  const currentStatus = timingStatus(type, checkinMinutesOfDay(type, date));
  if (!currentStatus) return undefined;

  const dateToMinutes = new Map<string, number>();
  lineItems.forEach((item) => {
    if (typeof item.minutesOfDay === "number") dateToMinutes.set(item.date, item.minutesOfDay);
  });
  dateToMinutes.set(localDateKey(date), checkinMinutesOfDay(type, date));

  let streak = 0;
  let cursor = new Date(date);
  while (true) {
    const minutes = dateToMinutes.get(localDateKey(cursor));
    if (typeof minutes !== "number" || timingStatus(type, minutes) !== currentStatus) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return `连续${currentStatus} ${streak} 天`;
}

function userLocation(timeoutMs = 5000): Promise<GeolocationPosition | undefined> {
  if (!("geolocation" in navigator)) return Promise.resolve(undefined);

  return new Promise((resolve) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(undefined);
    }, timeoutMs);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(position);
      },
      () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve(undefined);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 10 * 60 * 1000,
        timeout: timeoutMs
      }
    );
  });
}

async function weatherSummary() {
  const location = await userLocation();
  if (!location) return undefined;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 2500);

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", location.coords.latitude.toFixed(4));
    url.searchParams.set("longitude", location.coords.longitude.toFixed(4));
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return undefined;
    const data = (await response.json()) as {
      current?: {
        temperature_2m?: number;
        weather_code?: number;
      };
    };
    const temperature = data.current?.temperature_2m;
    const code = data.current?.weather_code;
    if (typeof temperature !== "number" || typeof code !== "number") return undefined;
    return `今日天气 ${weatherName(code)} ${Math.round(temperature)}℃`;
  } catch {
    return undefined;
  } finally {
    window.clearTimeout(timer);
  }
}

export function checkinWindowError(type: CheckinType, date = new Date()) {
  const minutes = minutesOfDay(date);
  if (type === "wakeup" && (minutes < WAKEUP_START || minutes >= WAKEUP_END)) {
    return minutes < WAKEUP_START ? "还没到起床打卡时间" : "今天的起床打卡时间过了";
  }
  if (type === "sleep" && minutes >= SLEEP_END && minutes < SLEEP_START) {
    return "还没到睡眠打卡时间";
  }
  return undefined;
}

export function checkinWindowHint(type: CheckinType) {
  if (type === "wakeup") return `起床打卡开放时间是 ${CHECKIN_META.wakeup.windowText}，每天记录一次醒来的时间。`;
  if (type === "sleep") return `睡眠打卡开放时间是 ${CHECKIN_META.sleep.windowText}，每天记录一次准备休息的时间。`;
  return "每天记录一次今日专注打卡。";
}

export function checkinFailureHint(type: CheckinType, message?: string) {
  if (message?.includes("已经")) {
    return {
      title: `${checkinLabel(type)}今天已经记录过了`,
      description: "想调整时间的话，可以去统计里的历史记录修改。"
    };
  }
  return {
    title: "打卡没有保存",
    description: "可能是网络或同步慢了一点，稍后再试。"
  };
}

export function buildCheckinPayload(type: CheckinType, date = new Date(), note?: string): CheckinPayload {
  const trimmedNote = note?.trim();
  return {
    type,
    checkinTime: toLocalDateTime(date),
    note: trimmedNote || CHECKIN_META[type].note
  };
}

export async function buildCheckinToast(type: CheckinType, date = new Date(), lineItems: CheckinLineLike[] = [], note?: string) {
  const trimmedNote = note?.trim();
  const parts =
    type === "focus_today"
      ? [`${timeText(date)} 已记录`, await weatherSummary(), pickLine(type, date)]
      : [
          type === "sleep" && date.getHours() < 2 ? `凌晨 ${timeText(date)} 记录睡眠` : `今天 ${timeText(date)} 已记录`,
          timingStatus(type, checkinMinutesOfDay(type, date)),
          streakText(type, date, lineItems),
          trimmedNote ? `备注：${trimmedNote}` : undefined,
          pickLine(type, date)
        ];
  return {
    title: CHECKIN_META[type].successTitle,
    description: parts.filter(Boolean).join(" · ")
  };
}

export function checkinLabel(type: CheckinType) {
  return CHECKIN_META[type].label;
}

export function checkinNeedsNote(type: CheckinType) {
  return type === "wakeup" || type === "sleep";
}

export function checkinNotePlaceholder(type: CheckinType | null) {
  if (type === "wakeup") return "醒来时想记下什么？比如昨晚睡得怎样、今天想先做什么。";
  if (type === "sleep") return "睡前想说点什么？比如今天收尾、明早提醒、此刻心情。";
  return "想说的话";
}

export function checkinNoteIntro(type: CheckinType | null) {
  if (!type) return "记录一句现在想说的话，可以留空。";
  return CHECKIN_META[type].noteIntro ?? "记录一句现在想说的话，可以留空。";
}

export function checkinSubmitText(type: CheckinType | null) {
  if (!type) return "打卡";
  return CHECKIN_META[type].submitText ?? "打卡";
}
