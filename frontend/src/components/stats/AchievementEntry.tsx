import * as Dialog from "@radix-ui/react-dialog";
import { AlarmClock, Award, CalendarCheck2, CheckCircle2, Clock3, Flame, Medal, Moon, Sprout, Star, Sunrise, Target, Trophy, X, Zap } from "lucide-react";
import type { ComponentType } from "react";
import { formatMinutes } from "@/components/stats/statsFormat";
import type { StatsBundle, StatsSummary } from "@/types/stats";

type AchievementCategory = "累计专注" | "近期节奏" | "年度稳定" | "打卡习惯";

interface AchievementItem {
  icon: ComponentType<{ size?: number }>;
  category: AchievementCategory;
  title: string;
  desc: string;
  current: number;
  target: number;
  unit: string;
  suffix?: string;
}

function numberValue(value: number | undefined | null) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value ?? 0)) : 0;
}

function clampPercent(current: number, target: number) {
  if (target <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
}

function progressText(item: AchievementItem) {
  const current = numberValue(item.current);
  const target = numberValue(item.target);
  if (item.suffix === "%") return `${current}/${target}%`;
  if (item.unit === "分钟") return `${formatMinutes(current)}/${formatMinutes(target)}`;
  if (item.unit === "分钟/天") return `${formatMinutes(current)}/${formatMinutes(target)}/天`;
  return `${current}/${target} ${item.unit}`;
}

function remainingText(item: AchievementItem) {
  const current = numberValue(item.current);
  const target = numberValue(item.target);
  const remaining = Math.max(0, target - current);
  if (remaining <= 0) return "已完成";
  if (item.suffix === "%") return `还差 ${remaining}%`;
  if (item.unit === "分钟") return `还差 ${formatMinutes(remaining)}`;
  if (item.unit === "分钟/天") return `还差 ${formatMinutes(remaining)}/天`;
  return `还差 ${remaining} ${item.unit}`;
}

function statusText(unlocked: boolean, percent: number) {
  if (unlocked) return "已解锁";
  if (percent <= 0) return "待解锁";
  return `${percent}%`;
}

export function buildAchievements(summary: StatsSummary, stats?: StatsBundle): AchievementItem[] {
  const totalFocusCount = numberValue(summary.totalFocusCount);
  const totalFocusMinutes = numberValue(summary.totalFocusMinutes);
  const averageDailyFocusMinutes = numberValue(summary.averageDailyFocusMinutes);
  const todayFocusCount = numberValue(stats?.today.todayFocusCount);
  const todayFocusMinutes = numberValue(stats?.today.todayFocusMinutes);
  const monthlyActiveDays = numberValue(stats?.monthly.activeDays);
  const monthlyFocusCount = numberValue(stats?.monthly.focusCount);
  const monthlyCompletionRate = numberValue(stats?.monthly.completionRate);
  const yearlyFocusCount = numberValue(stats?.yearly.focusCount);
  const yearlyActiveDays = numberValue(stats?.yearly.activeDays);
  const longestStreakDays = numberValue(stats?.yearly.longestStreakDays);
  const yearlyCompletionRate = numberValue(stats?.yearly.completionRate);
  const wakeupCount = stats?.monthCheckins.filter((item) => item.wakeupChecked).length ?? 0;
  const sleepCount = stats?.monthCheckins.filter((item) => item.sleepChecked).length ?? 0;
  const bothCheckinCount = stats?.monthCheckins.filter((item) => item.wakeupChecked && item.sleepChecked).length ?? 0;

  return [
    { icon: Sprout, category: "累计专注", title: "第一次开始", desc: "完成第一轮专注", current: totalFocusCount, target: 1, unit: "次" },
    { icon: Star, category: "累计专注", title: "小有节奏", desc: "累计完成 5 次专注", current: totalFocusCount, target: 5, unit: "次" },
    { icon: Target, category: "累计专注", title: "二十轮专注", desc: "累计完成 20 次专注", current: totalFocusCount, target: 20, unit: "次" },
    { icon: Trophy, category: "累计专注", title: "百轮玩家", desc: "累计完成 100 次专注", current: totalFocusCount, target: 100, unit: "次" },
    { icon: Clock3, category: "累计专注", title: "一小时沉浸", desc: "累计专注1小时", current: totalFocusMinutes, target: 60, unit: "分钟" },
    { icon: Flame, category: "累计专注", title: "五小时积累", desc: "累计专注5小时", current: totalFocusMinutes, target: 300, unit: "分钟" },
    { icon: Clock3, category: "累计专注", title: "十小时沉浸", desc: "累计专注10小时", current: totalFocusMinutes, target: 600, unit: "分钟" },
    { icon: Medal, category: "累计专注", title: "长线里程碑", desc: "累计专注16小时40分钟", current: totalFocusMinutes, target: 1000, unit: "分钟" },
    { icon: Award, category: "累计专注", title: "百小时专注", desc: "累计专注100小时", current: totalFocusMinutes, target: 6000, unit: "分钟" },
    { icon: Flame, category: "累计专注", title: "日均半小时", desc: "活跃日平均专注30分钟", current: averageDailyFocusMinutes, target: 30, unit: "分钟/天" },

    { icon: Zap, category: "近期节奏", title: "今日开张", desc: "今天完成 1 次专注", current: todayFocusCount, target: 1, unit: "次" },
    { icon: Flame, category: "近期节奏", title: "今日三连", desc: "今天完成 3 次专注", current: todayFocusCount, target: 3, unit: "次" },
    { icon: Clock3, category: "近期节奏", title: "今日一小时", desc: "今天专注1小时", current: todayFocusMinutes, target: 60, unit: "分钟" },
    { icon: CalendarCheck2, category: "近期节奏", title: "本月活跃", desc: "本月有 10 天完成专注", current: monthlyActiveDays, target: 10, unit: "天" },
    { icon: Target, category: "近期节奏", title: "本月高频", desc: "本月完成 30 次专注", current: monthlyFocusCount, target: 30, unit: "次" },
    { icon: CheckCircle2, category: "近期节奏", title: "本月完成率", desc: "本月完成率达到 80%", current: monthlyCompletionRate, target: 80, unit: "", suffix: "%" },

    { icon: CalendarCheck2, category: "年度稳定", title: "年度活跃", desc: "今年累计 30 个活跃日", current: yearlyActiveDays, target: 30, unit: "天" },
    { icon: Target, category: "年度稳定", title: "年度五十轮", desc: "今年完成 50 次专注", current: yearlyFocusCount, target: 50, unit: "次" },
    { icon: Trophy, category: "年度稳定", title: "年度百日", desc: "今年累计 100 个活跃日", current: yearlyActiveDays, target: 100, unit: "天" },
    { icon: Flame, category: "年度稳定", title: "连续一周", desc: "最长连续专注 7 天", current: longestStreakDays, target: 7, unit: "天" },
    { icon: Medal, category: "年度稳定", title: "连续一个月", desc: "最长连续专注 30 天", current: longestStreakDays, target: 30, unit: "天" },
    { icon: CheckCircle2, category: "年度稳定", title: "完成率达标", desc: "今年完成率达到 80%", current: yearlyCompletionRate, target: 80, unit: "", suffix: "%" },

    { icon: Sunrise, category: "打卡习惯", title: "晨间记录", desc: "本月起床打卡 3 次", current: wakeupCount, target: 3, unit: "次" },
    { icon: AlarmClock, category: "打卡习惯", title: "早起有谱", desc: "本月起床打卡 7 次", current: wakeupCount, target: 7, unit: "次" },
    { icon: Moon, category: "打卡习惯", title: "睡前收尾", desc: "本月睡眠打卡 3 次", current: sleepCount, target: 3, unit: "次" },
    { icon: Star, category: "打卡习惯", title: "晚安稳定", desc: "本月睡眠打卡 7 次", current: sleepCount, target: 7, unit: "次" },
    { icon: CalendarCheck2, category: "打卡习惯", title: "作息入门", desc: "本月 1 天同时完成起床和睡眠打卡", current: bothCheckinCount, target: 1, unit: "天" },
    { icon: Award, category: "打卡习惯", title: "作息双修", desc: "本月 5 天同时完成起床和睡眠打卡", current: bothCheckinCount, target: 5, unit: "天" }
  ];
}

function categorySummary(achievements: AchievementItem[], category: AchievementCategory) {
  const items = achievements.filter((item) => item.category === category);
  const unlocked = items.filter((item) => item.current >= item.target).length;
  return `${unlocked}/${items.length}`;
}

export function AchievementEntry({ open, summary, stats, onClose }: { open: boolean; summary: StatsSummary; stats?: StatsBundle; onClose: () => void }) {
  const achievements = buildAchievements(summary, stats);
  const categories: AchievementCategory[] = ["累计专注", "近期节奏", "年度稳定", "打卡习惯"];
  const unlockedCount = achievements.filter((item) => item.current >= item.target).length;
  const nextAchievement = achievements.find((item) => item.current < item.target);

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(38,35,42,0.18)]" />
        <Dialog.Content className="app-dialog-panel app-modal-scroll z-50 flex max-h-[82vh] w-[calc(100%-28px)] max-w-[410px] flex-col !overflow-hidden rounded-[28px] border-[color-mix(in_srgb,var(--app-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--app-card)_92%,transparent)] shadow-[0_18px_46px_rgba(120,70,90,0.18)] backdrop-blur-[22px]">
          <div className="relative border-b border-[color-mix(in_srgb,var(--app-border)_70%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--app-primary-soft)_62%,var(--app-card)_38%),color-mix(in_srgb,#e9f8ef_30%,var(--app-card)_70%))] px-5 pb-4 pt-5">
            <div className="relative z-10 pr-10">
              <p className="text-xs font-black text-[var(--app-primary-strong)]">成就墙</p>
              <Dialog.Title className="mt-1 text-[22px] font-black leading-8">全部成就</Dialog.Title>
              <p className="mt-2 text-xs font-bold leading-5 text-[var(--app-muted)]">
                已解锁 {unlockedCount}/{achievements.length} 枚{nextAchievement ? `，下一枚：${nextAchievement.title}` : "，已经全部拿下"}
              </p>
            </div>
            <Dialog.Close className="absolute right-4 top-4 z-20 rounded-full bg-[color-mix(in_srgb,var(--app-card)_82%,transparent)] p-2 text-[var(--app-text)]" aria-label="关闭">
              <X size={16} />
            </Dialog.Close>
          </div>

          <div className="app-modal-scroll overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-4 gap-2">
              {categories.map((category) => (
                <div key={category} className="rounded-2xl bg-[color-mix(in_srgb,var(--app-card-soft)_72%,transparent)] px-2 py-2 text-center">
                  <p className="text-[10px] font-black text-[var(--app-muted)]">{category}</p>
                  <p className="mt-1 text-sm font-black text-[var(--app-primary-strong)]">{categorySummary(achievements, category)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-4">
              {categories.map((category) => {
                const items = achievements.filter((item) => item.category === category);

                return (
                  <section key={category}>
                    <div className="mb-2 flex items-center justify-between px-1">
                      <h3 className="text-sm font-black text-[var(--app-text)]">{category}</h3>
                      <span className="text-xs font-black text-[var(--app-muted)]">{categorySummary(achievements, category)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const percent = clampPercent(item.current, item.target);
                        const unlocked = item.current >= item.target;
                        const progressWidth = percent <= 0 ? "0.65rem" : `${Math.max(percent, 6)}%`;

                        return (
                          <div
                            key={`${item.category}-${item.title}`}
                            className={
                              unlocked
                                ? "min-h-[154px] rounded-[22px] border border-[color-mix(in_srgb,var(--app-primary)_20%,var(--app-border))] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--app-primary-soft)_68%,var(--app-card)_32%),color-mix(in_srgb,#e9f8ef_26%,var(--app-card)_74%))] p-3"
                                : "min-h-[154px] rounded-[22px] border border-[color-mix(in_srgb,var(--app-border)_76%,transparent)] bg-[color-mix(in_srgb,var(--app-card)_74%,transparent)] p-3"
                            }
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div
                                className={
                                  unlocked
                                    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-primary)] text-[var(--app-text)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--app-card)_58%,transparent)]"
                                    : "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-card-soft)] text-[var(--app-muted)]"
                                }
                              >
                                <Icon size={19} />
                              </div>
                              <span
                                className={
                                  unlocked
                                    ? "rounded-full bg-[color-mix(in_srgb,var(--app-success)_18%,var(--app-card))] px-2 py-1 text-[10px] font-black text-[color-mix(in_srgb,var(--app-success)_78%,#111)]"
                                    : "rounded-full bg-[color-mix(in_srgb,var(--app-card-soft)_78%,var(--app-border)_22%)] px-2 py-1 text-[10px] font-black text-[var(--app-muted)]"
                                }
                              >
                                {statusText(unlocked, percent)}
                              </span>
                            </div>
                            <p className="mt-3 text-sm font-black leading-5 text-[var(--app-text)]">{item.title}</p>
                            <p className="mt-1 min-h-10 text-xs font-bold leading-5 text-[var(--app-muted)]">{item.desc}</p>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--app-border)_58%,transparent)]">
                              <div
                                className={
                                  percent <= 0
                                    ? "h-full rounded-full bg-[color-mix(in_srgb,var(--app-muted)_32%,var(--app-border)_68%)] transition-all"
                                    : "h-full rounded-full bg-[var(--app-primary)] transition-all"
                                }
                                style={{ width: progressWidth }}
                              />
                            </div>
                            <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] font-black text-[var(--app-muted)]">
                              <span>{progressText(item)}</span>
                              <span className={unlocked ? "text-[color-mix(in_srgb,var(--app-success)_78%,#111)]" : ""}>{remainingText(item)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
