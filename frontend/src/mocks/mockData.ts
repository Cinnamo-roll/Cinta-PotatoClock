import type { User } from "@/types/auth";
import type { Task } from "@/types/task";
import type { UserSettings } from "@/types/settings";
import type { PotatoSession } from "@/types/timer";
import type { TimerSession } from "@/types/session";
import type { FuturePlan } from "@/types/futurePlan";
import type { TodoCollection, TodoItem } from "@/types/todo";
import { localDateKey, localDateTime } from "@/utils/date";

type MockCheckinType = "wakeup" | "focus_today" | "sleep";

interface MockCheckinSeed {
  id: number;
  type: MockCheckinType;
  checkedAt: string;
  note?: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dateAt(daysAgo: number, hour: number, minute: number) {
  const date = new Date(Date.now() - daysAgo * DAY_MS);
  date.setHours(hour, minute, 0, 0);
  return localDateTime(date);
}

function minutesAfter(value: string, minutes: number) {
  return localDateTime(new Date(new Date(value).getTime() + minutes * 60 * 1000));
}

export const mockUser: User = {
  id: "u-potato",
  username: "potato",
  nickname: "专注用户",
  email: "potato@example.com"
};

export const defaultSettings: UserSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartNextFocus: false,
  soundEnabled: true,
  vibrationEnabled: true,
  theme: "system"
};

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "完成更新提示交互",
    description: "Android 直达安装包，iOS 前往官网。",
    status: "doing",
    priority: "high",
    estimatedPotatoes: 4,
    completedPotatoes: 2,
    sortOrder: 1,
    selected: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "task-2",
    title: "阅读《深度工作》",
    description: "每天读 20 分钟并记下一条启发。",
    status: "todo",
    priority: "medium",
    estimatedPotatoes: 3,
    completedPotatoes: 0,
    sortOrder: 2,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "task-3",
    title: "整理本周发布说明",
    status: "done",
    priority: "low",
    estimatedPotatoes: 1,
    completedPotatoes: 1,
    sortOrder: 3,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const initialTodos: TodoItem[] = [
  {
    id: 1,
    title: "背 30 个英语单词",
    durationMinutes: 25,
    timerType: "countdown",
    category: "normal",
    collectionId: 1,
    status: "todo",
    backgroundStyle: "bg-gradient-to-br from-[#fff7fb] to-[#ffe1ed]",
    includeInStats: true,
    countToStats: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "完成更新提示交互",
    durationMinutes: 45,
    timerType: "countdown",
    category: "normal",
    collectionId: 2,
    status: "todo",
    backgroundStyle: "bg-gradient-to-br from-[#fff6e8] to-[#ffe0c5]",
    includeInStats: true,
    countToStats: true,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "阅读《深度工作》",
    durationMinutes: 20,
    timerType: "countup",
    category: "habit",
    collectionId: 1,
    status: "todo",
    backgroundStyle: "bg-gradient-to-br from-[#f3f7ff] to-[#deeaff]",
    includeInStats: true,
    countToStats: true,
    recurrence: "每天",
    targetAmount: 20,
    targetUnit: "分钟",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    title: "晨间拉伸",
    durationMinutes: 15,
    timerType: "countdown",
    category: "habit",
    collectionId: 3,
    status: "todo",
    backgroundStyle: "bg-gradient-to-br from-[#f1fff5] to-[#d8f6df]",
    includeInStats: true,
    countToStats: true,
    recurrence: "每天",
    targetAmount: 15,
    targetUnit: "分钟",
    createdAt: dateAt(18, 8, 20),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    title: "推进土豆时钟 1.3 原型",
    durationMinutes: 30,
    timerType: "countup",
    category: "goal",
    collectionId: 2,
    status: "todo",
    backgroundStyle: "bg-gradient-to-br from-[#f9f4ff] to-[#eadcff]",
    includeInStats: true,
    countToStats: true,
    targetAmount: 8,
    targetUnit: "次",
    deadline: dateAt(-10, 23, 59),
    note: "每次完成一个可演示的小模块。",
    createdAt: dateAt(12, 10, 0),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    title: "整理本周发布说明",
    durationMinutes: 35,
    timerType: "countdown",
    category: "normal",
    collectionId: 2,
    status: "todo",
    backgroundStyle: "bg-gradient-to-br from-[#fff8e8] to-[#ffe8b8]",
    includeInStats: true,
    countToStats: true,
    createdAt: dateAt(10, 15, 10),
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    title: "复盘本周错题",
    durationMinutes: 40,
    timerType: "countdown",
    category: "normal",
    collectionId: 1,
    status: "todo",
    backgroundStyle: "bg-gradient-to-br from-[#eef7ff] to-[#d7eaff]",
    includeInStats: true,
    countToStats: true,
    createdAt: dateAt(9, 20, 0),
    updatedAt: new Date().toISOString()
  },
  {
    id: 8,
    title: "睡前放松",
    durationMinutes: 20,
    timerType: "none",
    category: "habit",
    collectionId: 3,
    status: "todo",
    backgroundStyle: "bg-gradient-to-br from-[#f6f0ff] to-[#e4d8ff]",
    includeInStats: true,
    countToStats: true,
    recurrence: "每天",
    targetAmount: 1,
    targetUnit: "次",
    createdAt: dateAt(16, 22, 0),
    updatedAt: new Date().toISOString()
  }
];

export const initialCollections: TodoCollection[] = [
  {
    id: 1,
    name: "学习",
    description: "英语、阅读和复盘",
    color: "#6F8655",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "土豆时钟项目",
    description: "功能、交互和发布准备",
    color: "#D7AD4A",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "生活",
    description: "运动、睡眠和日常恢复",
    color: "#89AA78",
    createdAt: dateAt(18, 8, 0),
    updatedAt: new Date().toISOString()
  }
];

export const initialFuturePlans: FuturePlan[] = [
  {
    id: "future-1",
    title: "土豆时钟 1.3 版本复盘",
    note: "整理反馈、数据和下一版优先级",
    targetDate: localDateKey(new Date(Date.now() + 7 * DAY_MS)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "future-2",
    title: "英语阶段测验",
    note: "复习本月单词和错题",
    targetDate: localDateKey(new Date(Date.now() + 18 * DAY_MS)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "future-3",
    title: "周末短途旅行",
    note: "提前确认车票和住宿",
    targetDate: localDateKey(new Date(Date.now() + 32 * DAY_MS)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialSessions: PotatoSession[] = [
  {
    id: "s-1",
    taskId: "task-1",
    taskTitle: "完成更新提示交互",
    mode: "focus",
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    endedAt: new Date(Date.now() - 5700000).toISOString(),
    plannedMinutes: 25,
    actualMinutes: 25,
    completed: true
  },
  {
    id: "s-2",
    taskId: "task-1",
    taskTitle: "完成更新提示交互",
    mode: "focus",
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    endedAt: new Date(Date.now() - 2100000).toISOString(),
    plannedMinutes: 25,
    actualMinutes: 25,
    completed: true
  }
];

const sessionPlans = [
  { taskId: 1, collectionId: 1, taskTitle: "背 30 个英语单词", timerType: "countdown" as const, category: "normal" as const, plannedMinutes: 25 },
  { taskId: 2, collectionId: 2, taskTitle: "完成更新提示交互", timerType: "countdown" as const, category: "normal" as const, plannedMinutes: 45 },
  { taskId: 3, collectionId: 1, taskTitle: "阅读《深度工作》", timerType: "countup" as const, category: "habit" as const, plannedMinutes: 20 },
  { taskId: 4, collectionId: 3, taskTitle: "晨间拉伸", timerType: "countdown" as const, category: "habit" as const, plannedMinutes: 15 },
  { taskId: 5, collectionId: 2, taskTitle: "推进土豆时钟 1.3 原型", timerType: "countup" as const, category: "goal" as const, plannedMinutes: 30 },
  { taskId: 6, collectionId: 2, taskTitle: "整理本周发布说明", timerType: "countdown" as const, category: "normal" as const, plannedMinutes: 35 },
  { taskId: 7, collectionId: 1, taskTitle: "复盘本周错题", timerType: "countdown" as const, category: "normal" as const, plannedMinutes: 40 },
  { taskId: 8, collectionId: 3, taskTitle: "睡前放松", timerType: "none" as const, category: "habit" as const, plannedMinutes: 0 }
];

const completedPlanIdsByDay = [
  [4, 2],
  [3, 1, 5, 8],
  [4, 2, 3],
  [3, 7],
  [4, 1, 5],
  [3, 2, 6],
  [4, 1, 8],
  [3, 2, 5],
  [4, 7],
  [3, 1, 2],
  [4, 5, 8],
  [3, 2],
  [4, 1, 7],
  [3, 2, 6]
];

const interruptedPlanByDay = new Map([
  [0, { taskId: 3, actualMinutes: 8, reason: "消息打断" }],
  [5, { taskId: 1, actualMinutes: 11, reason: "临时电话" }],
  [9, { taskId: 5, actualMinutes: 12, reason: "状态不佳" }]
]);

function buildTimerSessionSeed(): TimerSession[] {
  const sessions: TimerSession[] = [];
  let id = 100;
  completedPlanIdsByDay.forEach((planIds, daysAgo) => {
    planIds.forEach((taskId, index) => {
      const plan = sessionPlans.find((item) => item.taskId === taskId)!;
      const actualMinutes = plan.plannedMinutes;
      const startedAt = dateAt(daysAgo, [7, 9, 14, 21][index] ?? 21, [35, 20, 10, 15][index] ?? 0);
      sessions.push({
        id: id++,
        taskId: plan.taskId,
        collectionId: plan.collectionId,
        taskTitle: plan.taskTitle,
        mode: "focus",
        timerType: plan.timerType,
        category: plan.category,
        plannedMinutes: plan.plannedMinutes,
        actualMinutes,
        actualSeconds: actualMinutes * 60,
        startedAt,
        endedAt: minutesAfter(startedAt, actualMinutes),
        completed: true,
        interrupted: false,
        countToStats: plan.timerType !== "none",
        note: index === 0 && daysAgo % 4 === 0 ? "按计划完成，状态比较稳定。" : undefined
      });
    });

    const interruption = interruptedPlanByDay.get(daysAgo);
    if (interruption) {
      const plan = sessionPlans.find((item) => item.taskId === interruption.taskId)!;
      const startedAt = dateAt(daysAgo, 11, 40);
      sessions.push({
        id: id++,
        taskId: plan.taskId,
        collectionId: plan.collectionId,
        taskTitle: plan.taskTitle,
        mode: "focus",
        timerType: plan.timerType,
        category: plan.category,
        plannedMinutes: plan.plannedMinutes,
        actualMinutes: interruption.actualMinutes,
        actualSeconds: interruption.actualMinutes * 60,
        startedAt,
        endedAt: minutesAfter(startedAt, interruption.actualMinutes),
        completed: false,
        interrupted: true,
        interruptReason: interruption.reason,
        countToStats: true,
        note: "记录原因后重新安排，不把中断当成失败。"
      });
    }
  });
  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

function buildCheckinSeed(): MockCheckinSeed[] {
  const checkins: MockCheckinSeed[] = [];
  let id = 100;
  for (let daysAgo = 0; daysAgo < 14; daysAgo += 1) {
    if (daysAgo % 6 !== 2) {
      checkins.push({
        id: id++,
        type: "wakeup",
        checkedAt: dateAt(daysAgo, daysAgo % 5 === 0 ? 8 : 7, 5 + ((daysAgo * 7) % 45)),
        note: daysAgo % 4 === 0 ? "醒来后先喝水，精神还可以。" : null
      });
    }
    if (daysAgo % 5 !== 1) {
      const sleepHour = daysAgo % 7 === 0 ? 1 : daysAgo % 4 === 0 ? 0 : 23;
      checkins.push({
        id: id++,
        type: "sleep",
        checkedAt: dateAt(daysAgo, sleepHour, 10 + ((daysAgo * 9) % 45)),
        note: sleepHour >= 1 ? "稍微有点晚，明天提前收尾。" : null
      });
    }
    if (daysAgo > 0 && daysAgo % 3 !== 1) {
      checkins.push({
        id: id++,
        type: "focus_today",
        checkedAt: dateAt(daysAgo, 21, 5 + ((daysAgo * 5) % 35)),
        note: daysAgo % 4 === 0 ? "今天最有价值的是坚持开始。" : "完成今日专注复盘。"
      });
    }
  }
  return checkins.sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));
}

export const initialTimerSessions: TimerSession[] = buildTimerSessionSeed();
export const initialCheckins: MockCheckinSeed[] = buildCheckinSeed();
