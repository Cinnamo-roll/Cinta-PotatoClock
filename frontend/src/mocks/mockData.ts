import type { User } from "@/types/auth";
import type { Task } from "@/types/task";
import type { UserSettings } from "@/types/settings";
import type { PotatoSession } from "@/types/timer";
import type { TimerSession } from "@/types/session";
import type { FuturePlan } from "@/types/futurePlan";
import type { TodoCollection, TodoItem } from "@/types/todo";

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
  return date.toISOString();
}

function minutesAfter(value: string, minutes: number) {
  return new Date(new Date(value).getTime() + minutes * 60 * 1000).toISOString();
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
    title: "整理今天的学习计划",
    description: "先把最重要的三件事写清楚。",
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
    title: "阅读技术文章",
    description: "慢慢读，不赶时间。",
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
    title: "复盘一次专注",
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
    title: "背英语单词",
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
    title: "写代码",
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
    title: "阅读",
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
    title: "整理产品想法",
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
    note: "每次只写一个可执行点。",
    createdAt: dateAt(12, 10, 0),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    title: "写周报",
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
    title: "复盘错题",
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
    color: "#F6AFC3",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "工作",
    description: "代码、文档和沟通",
    color: "#F3B36A",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "生活",
    description: "运动、睡眠和日常恢复",
    color: "#8FCFA4",
    createdAt: dateAt(18, 8, 0),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "长期目标",
    description: "需要慢慢推进的大块任务",
    color: "#AFA6F5",
    createdAt: dateAt(14, 9, 30),
    updatedAt: new Date().toISOString()
  }
];

export const initialFuturePlans: FuturePlan[] = [
  {
    id: "future-1",
    title: "毕业论文提交",
    note: "提前准备终稿和检查清单",
    targetDate: new Date(Date.now() + 38 * DAY_MS).toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const initialSessions: PotatoSession[] = [
  {
    id: "s-1",
    taskId: "task-1",
    taskTitle: "整理今天的学习计划",
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
    taskTitle: "整理今天的学习计划",
    mode: "focus",
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    endedAt: new Date(Date.now() - 2100000).toISOString(),
    plannedMinutes: 25,
    actualMinutes: 25,
    completed: true
  }
];

const sessionPlans = [
  { taskId: 1, collectionId: 1, taskTitle: "背英语单词", timerType: "countdown" as const, category: "normal" as const, plannedMinutes: 25 },
  { taskId: 2, collectionId: 2, taskTitle: "写代码", timerType: "countdown" as const, category: "normal" as const, plannedMinutes: 45 },
  { taskId: 3, collectionId: 1, taskTitle: "阅读", timerType: "countup" as const, category: "habit" as const, plannedMinutes: 20 },
  { taskId: 4, collectionId: 3, taskTitle: "晨间拉伸", timerType: "countdown" as const, category: "habit" as const, plannedMinutes: 15 },
  { taskId: 5, collectionId: 2, taskTitle: "整理产品想法", timerType: "countup" as const, category: "goal" as const, plannedMinutes: 30 },
  { taskId: 6, collectionId: 2, taskTitle: "写周报", timerType: "countdown" as const, category: "normal" as const, plannedMinutes: 35 },
  { taskId: 7, collectionId: 1, taskTitle: "复盘错题", timerType: "countdown" as const, category: "normal" as const, plannedMinutes: 40 }
];

const interruptReasons = ["临时电话", "有点困", "计划调整", "被消息打断", "需要处理家务"];

function buildTimerSessionSeed(): TimerSession[] {
  const sessions: TimerSession[] = [];
  let id = 100;
  for (let daysAgo = 0; daysAgo < 30; daysAgo += 1) {
    const sessionsInDay = daysAgo % 6 === 0 ? 1 : daysAgo % 5 === 0 ? 4 : daysAgo % 3 === 0 ? 3 : 2;
    for (let index = 0; index < sessionsInDay; index += 1) {
      const plan = sessionPlans[(daysAgo + index * 2) % sessionPlans.length];
      const interrupted = (daysAgo + index) % 9 === 0;
      const actualMinutes = interrupted ? Math.max(8, Math.round(plan.plannedMinutes * 0.45)) : plan.plannedMinutes + ((daysAgo + index) % 3) * 5;
      const startedAt = dateAt(daysAgo, [7, 10, 14, 20][index] ?? 20, (daysAgo * 7 + index * 11) % 50);
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
        completed: !interrupted,
        interrupted,
        interruptReason: interrupted ? interruptReasons[(daysAgo + index) % interruptReasons.length] : null,
        note: interrupted ? "下次把手机放远一点。" : index === 0 && daysAgo % 4 === 0 ? "状态不错，进入得很快。" : undefined
      });
    }
  }
  return sessions.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

function buildCheckinSeed(): MockCheckinSeed[] {
  const checkins: MockCheckinSeed[] = [];
  let id = 100;
  for (let daysAgo = 0; daysAgo < 30; daysAgo += 1) {
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
    if (daysAgo % 3 !== 1) {
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
