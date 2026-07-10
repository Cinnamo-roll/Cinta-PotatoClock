import { addLocalDays, localDateKey, localDateTime, pad2 } from "@/utils/date";

export type CheckinType = "wakeup" | "focus_today" | "sleep";

export interface CheckinPayload {
  type: CheckinType;
  checkinTime: string;
  note?: string;
}

interface CheckinMeta {
  label: string;
  menuDescription: string;
  successTitle: string;
  successDescription: string;
  noteIntro?: string;
  placeholder?: string;
  submitText: string;
  windowText: string;
}

const WAKEUP_START = 5 * 60;
const WAKEUP_END = 12 * 60;
const SLEEP_START = 20 * 60;
const SLEEP_END = 2 * 60;

const CHECKIN_META: Record<CheckinType, CheckinMeta> = {
  wakeup: {
    label: "起床记录",
    menuDescription: "05:00-12:00，记下醒来时间",
    successTitle: "起床时间已记录",
    successDescription: "今天从清醒这一刻开始。",
    noteIntro: "现在的状态怎么样？可以留一句话，也可以直接记录。",
    placeholder: "例如：睡得不错，先喝杯水",
    submitText: "记录起床",
    windowText: "05:00-12:00"
  },
  focus_today: {
    label: "今日专注",
    menuDescription: "给今天留下一次开始",
    successTitle: "今天的专注已记录",
    successDescription: "保持自己的节奏，继续完成眼前这件事。",
    submitText: "记录专注",
    windowText: "全天"
  },
  sleep: {
    label: "睡前记录",
    menuDescription: "20:00-次日 02:00，准备休息",
    successTitle: "睡眠时间已记录",
    successDescription: "今天辛苦了，安心休息。",
    noteIntro: "给今天做个简短收尾，可以留空直接记录。",
    placeholder: "例如：今天完成了最重要的一件事",
    submitText: "记录睡眠",
    windowText: "20:00-次日 02:00"
  }
};

function minutesOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function timeText(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function checkinBusinessDate(type: CheckinType, date: Date) {
  if (type === "sleep" && date.getHours() < 2) return addLocalDays(localDateKey(date), -1);
  return localDateKey(date);
}

export function checkinWindowError(type: CheckinType, date = new Date()) {
  const minutes = minutesOfDay(date);
  if (type === "wakeup" && (minutes < WAKEUP_START || minutes >= WAKEUP_END)) {
    return minutes < WAKEUP_START ? "起床记录将在 05:00 开放" : "今天的起床记录时间已结束";
  }
  if (type === "sleep" && minutes >= SLEEP_END && minutes < SLEEP_START) {
    return "睡前记录将在 20:00 开放";
  }
  return undefined;
}

export function checkinWindowHint(type: CheckinType) {
  return `${CHECKIN_META[type].label}时间：${CHECKIN_META[type].windowText}`;
}

export function checkinFailureHint(type: CheckinType, message?: string) {
  if (message?.includes("已经")) {
    return {
      title: `${CHECKIN_META[type].label}已完成`,
      description: "需要调整时，可在统计的历史记录中修改。"
    };
  }
  return {
    title: "记录没有保存",
    description: "请检查网络后再试一次。"
  };
}

export function buildCheckinPayload(type: CheckinType, date = new Date(), note?: string): CheckinPayload {
  const trimmedNote = note?.trim();
  return {
    type,
    checkinTime: localDateTime(date),
    note: trimmedNote || undefined
  };
}

export function buildCheckinToast(type: CheckinType, date = new Date()) {
  const meta = CHECKIN_META[type];
  const dayText = type === "sleep" && date.getHours() < 2 ? "前一晚" : "今天";
  return {
    title: meta.successTitle,
    description: `${dayText} ${timeText(date)} · ${meta.successDescription}`
  };
}

export function checkinLabel(type: CheckinType) {
  return CHECKIN_META[type].label;
}

export function checkinMenuDescription(type: CheckinType) {
  return CHECKIN_META[type].menuDescription;
}

export function checkinNeedsNote(type: CheckinType) {
  return type === "wakeup" || type === "sleep";
}

export function checkinNotePlaceholder(type: CheckinType | null) {
  return type ? CHECKIN_META[type].placeholder ?? "想记下的话" : "想记下的话";
}

export function checkinNoteIntro(type: CheckinType | null) {
  return type ? CHECKIN_META[type].noteIntro ?? "确认后会记录当前时间。" : "确认后会记录当前时间。";
}

export function checkinSubmitText(type: CheckinType | null) {
  return type ? CHECKIN_META[type].submitText : "记录";
}
