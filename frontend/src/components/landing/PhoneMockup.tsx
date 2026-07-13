import type { ReactNode } from "react";
import { BarChart3, Bell, CalendarDays, Check, CheckCircle2, Clock3, Flame, FolderKanban, Moon, Palette, Play, Plus, Sunrise, Target } from "lucide-react";

type PhoneVariant = "list" | "timer" | "stats" | "settings" | "modal" | "checkin" | "future" | "download";

interface PhoneMockupProps {
  title: string;
  subtitle: string;
  variant?: PhoneVariant;
  compact?: boolean;
}

const tasks = [
  ["整理阅读笔记", "25 分钟", "#F3E1A7"],
  ["背英语单词", "20 分钟", "#DFE9D4"],
  ["完成项目周报", "正计时", "#E8D8B8"]
];

function PhoneShell({ title, subtitle, compact = false, children }: PhoneMockupProps & { children: ReactNode }) {
  return (
    <div className="landing-phone rounded-[36px] bg-[#29251F] p-[7px] shadow-[0_24px_55px_rgba(74,55,25,0.24)]">
      <div className={`relative aspect-[9/16] overflow-hidden rounded-[29px] bg-[linear-gradient(155deg,#FBF5E7,#F1E3C3_55%,#FFF9ED)] ${compact ? "p-3" : "p-4"}`}>
        <div className="relative z-10 mx-auto mb-3 h-4 w-20 rounded-full bg-[#242124]" />
        <div className="relative z-10 flex items-center justify-between border-b border-[#E2D2B2] pb-3">
          <div className="min-w-0">
            <h3 className={`${compact ? "text-base" : "text-lg"} truncate font-black text-[#342C20]`}>{title}</h3>
            <p className="mt-0.5 truncate text-[10px] font-bold text-[#766A57]">{subtitle}</p>
          </div>
          <span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3E1A7] text-[#8A6328]"><Plus size={14} /></span>
        </div>
        <div className="relative z-10">{children}</div>
        <div className="absolute inset-x-3 bottom-2 z-10 flex justify-around rounded-2xl border border-[#E2D2B2]/80 bg-[#FFFCF5]/85 px-2 py-2 text-[#887A64] shadow-[0_8px_22px_rgba(100,76,31,0.10)] backdrop-blur">
          <CheckCircle2 size={14} className="text-[#8A6328]" /><FolderKanban size={14} /><Clock3 size={14} /><BarChart3 size={14} />
        </div>
      </div>
    </div>
  );
}

function TaskList() {
  return (
    <div className="mt-3 space-y-2">
      {tasks.map(([item, time, color], index) => (
        <div key={item} className="rounded-2xl border border-[#E2D2B2] bg-[#FFFCF5]/92 p-2.5 shadow-[0_7px_16px_rgba(100,76,31,0.07)]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black text-[#342C20]">{item}</p>
              <p className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#766A57]"><Clock3 size={9} />{time}</p>
            </div>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#75521F]" style={{ backgroundColor: color }}><Play size={11} fill="currentColor" /></span>
          </div>
          {index === 0 ? <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1E6CE]"><div className="h-full w-2/3 rounded-full bg-[#D7AD4A]" /></div> : null}
        </div>
      ))}
    </div>
  );
}

export function PhoneMockup({ title, subtitle, variant = "list", compact = false }: PhoneMockupProps) {
  if (variant === "timer") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-5 flex justify-center">
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[9px] border-[#F3E1A7] bg-[#FFFCF5] shadow-[0_12px_24px_rgba(100,76,31,0.11)]">
            <div className="absolute inset-[-9px] rounded-full border-[9px] border-transparent border-r-[#D7AD4A] border-t-[#D7AD4A]" />
            <div className="text-center"><p className="text-[9px] font-black text-[#8A6328]">专注倒计时</p><p className="mt-1 text-3xl font-black text-[#342C20]">24:59</p><p className="mt-1 max-w-24 truncate text-[9px] font-bold text-[#766A57]">整理阅读笔记</p></div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2"><span className="rounded-full bg-[#D7AD4A] px-3 py-2 text-center text-xs font-black text-[#342C20]">暂停</span><span className="rounded-full border border-[#E2D2B2] bg-[#FFFCF5] px-3 py-2 text-center text-xs font-black text-[#766A57]">结束</span></div>
      </PhoneShell>
    );
  }

  if (variant === "stats") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-[#FFFCF5] p-2.5"><p className="text-[9px] font-bold text-[#766A57]">今日专注</p><p className="mt-1 text-base font-black">1小时40分</p></div><div className="rounded-2xl bg-[#DFE9D4] p-2.5"><p className="text-[9px] font-bold text-[#567044]">完成次数</p><p className="mt-1 text-base font-black">8 次</p></div></div>
        <div className="mt-2 rounded-2xl border border-[#E2D2B2] bg-[#FFFCF5] p-3"><p className="text-[9px] font-black text-[#766A57]">近 7 天趋势</p><div className="mt-3 flex h-20 items-end gap-1.5">{[44, 72, 54, 88, 64, 78, 92].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-[#D7AD4A]" style={{ height: `${height}%`, opacity: 0.45 + index * 0.07 }} />)}</div></div>
      </PhoneShell>
    );
  }

  if (variant === "modal") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <TaskList />
        <div className="absolute inset-x-5 top-[29%] z-20 rounded-[22px] border border-[#E2D2B2] bg-[#FFFCF5] p-3 shadow-[0_18px_38px_rgba(89,66,24,0.18)]">
          <div className="flex items-center justify-between"><p className="text-xs font-black">添加待办</p><Check size={14} className="text-[#8A6328]" /></div>
          <div className="mt-3 rounded-xl bg-[#F5EBD7] px-3 py-2 text-[9px] font-bold">整理阅读笔记</div>
          <div className="mt-2 grid grid-cols-3 gap-1"><span className="rounded-lg bg-[#F3E1A7] p-1.5 text-center text-[8px] font-black">倒计时</span><span className="rounded-lg bg-[#F2E9D8] p-1.5 text-center text-[8px] font-black">正计时</span><span className="rounded-lg bg-[#F2E9D8] p-1.5 text-center text-[8px] font-black">不计时</span></div>
          <p className="mt-2 flex items-center gap-1 text-[8px] font-bold text-[#766A57]"><Target size={9} /> 普通待办 · 25 分钟</p>
        </div>
      </PhoneShell>
    );
  }

  if (variant === "future") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-3 rounded-2xl bg-[linear-gradient(135deg,#3B3238,#5A4852)] p-3.5 text-white"><CalendarDays size={18} className="text-[#F7D66E]" /><p className="mt-4 text-[9px] font-bold text-white/60">距离项目上线</p><p className="mt-1 text-2xl font-black">18 天</p></div>
        <div className="mt-2 space-y-2">{[["旅行出发", "26 天后"], ["家人生日", "42 天后"]].map(([item, date]) => <div key={item} className="flex items-center justify-between rounded-2xl border border-[#E2D2B2] bg-[#FFFCF5] px-3 py-2"><div><p className="text-[10px] font-black">{item}</p><p className="mt-0.5 text-[8px] font-bold text-[#766A57]">{date}</p></div><Bell size={12} className="text-[#8A6328]" /></div>)}</div>
      </PhoneShell>
    );
  }

  if (variant === "settings" || variant === "checkin" || variant === "download") {
    const rows = variant === "settings"
      ? [[Palette, "主题颜色", "土豆金"], [Bell, "本地提醒", "已开启"], [Clock3, "默认时长", "25 分钟"]]
      : [[Sunrise, "起床打卡", "07:12"], [Flame, "今日专注", "2小时10分"], [Moon, "睡前打卡", "23:40"]];
    return <PhoneShell title={title} subtitle={subtitle} compact={compact}><div className="mt-3 space-y-2">{rows.map(([Icon, label, value]) => <div key={label as string} className="flex items-center justify-between rounded-2xl border border-[#E2D2B2] bg-[#FFFCF5] px-3 py-3"><span className="flex items-center gap-2 text-[9px] font-black"><Icon size={13} className="text-[#8A6328]" />{label as string}</span><span className="text-[8px] font-bold text-[#766A57]">{value as string}</span></div>)}</div></PhoneShell>;
  }

  return <PhoneShell title={title} subtitle={subtitle} compact={compact}><TaskList /></PhoneShell>;
}
