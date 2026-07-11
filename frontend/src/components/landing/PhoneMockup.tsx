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
  ["整理阅读笔记", "25 分钟", "#FFE1EC"],
  ["背英语单词", "20 分钟", "#E5F4EA"],
  ["完成项目周报", "正计时", "#E6F1FB"]
];

function PhoneShell({ title, subtitle, compact = false, children }: PhoneMockupProps & { children: ReactNode }) {
  return (
    <div className="landing-phone rounded-[36px] bg-[#242124] p-[7px] shadow-[0_24px_55px_rgba(58,38,49,0.26)]">
      <div className={`relative aspect-[9/16] overflow-hidden rounded-[29px] bg-[linear-gradient(155deg,#FFF8FB,#FFEAF2_55%,#FFF)] ${compact ? "p-3" : "p-4"}`}>
        <div className="relative z-10 mx-auto mb-3 h-4 w-20 rounded-full bg-[#242124]" />
        <div className="relative z-10 flex items-center justify-between border-b border-[#F1D7E1] pb-3">
          <div className="min-w-0">
            <h3 className={`${compact ? "text-base" : "text-lg"} truncate font-black text-[#342B31]`}>{title}</h3>
            <p className="mt-0.5 truncate text-[10px] font-bold text-[#91818A]">{subtitle}</p>
          </div>
          <span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFE1EC] text-[#D85E8E]"><Plus size={14} /></span>
        </div>
        <div className="relative z-10">{children}</div>
        <div className="absolute inset-x-3 bottom-2 z-10 flex justify-around rounded-2xl border border-white/80 bg-white/80 px-2 py-2 text-[#A28F99] shadow-[0_8px_22px_rgba(120,70,90,0.10)] backdrop-blur">
          <CheckCircle2 size={14} className="text-[#E86C9B]" /><FolderKanban size={14} /><Clock3 size={14} /><BarChart3 size={14} />
        </div>
      </div>
    </div>
  );
}

function TaskList() {
  return (
    <div className="mt-3 space-y-2">
      {tasks.map(([item, time, color], index) => (
        <div key={item} className="rounded-2xl border border-[#F3D9E3] bg-white/90 p-2.5 shadow-[0_7px_16px_rgba(120,70,90,0.06)]">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black text-[#342B31]">{item}</p>
              <p className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#91818A]"><Clock3 size={9} />{time}</p>
            </div>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-[#B64F78]" style={{ backgroundColor: color }}><Play size={11} fill="currentColor" /></span>
          </div>
          {index === 0 ? <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#FFE5EE]"><div className="h-full w-2/3 rounded-full bg-[#F58CB2]" /></div> : null}
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
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[9px] border-[#FFE1EC] bg-white shadow-[0_12px_24px_rgba(120,70,90,0.10)]">
            <div className="absolute inset-[-9px] rounded-full border-[9px] border-transparent border-r-[#F58CB2] border-t-[#F58CB2]" />
            <div className="text-center"><p className="text-[9px] font-black text-[#E86C9B]">专注倒计时</p><p className="mt-1 text-3xl font-black text-[#342B31]">24:59</p><p className="mt-1 max-w-24 truncate text-[9px] font-bold text-[#91818A]">整理阅读笔记</p></div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2"><span className="rounded-full bg-[#F58CB2] px-3 py-2 text-center text-xs font-black text-[#342B31]">暂停</span><span className="rounded-full border border-[#F3D9E3] bg-white px-3 py-2 text-center text-xs font-black text-[#756872]">结束</span></div>
      </PhoneShell>
    );
  }

  if (variant === "stats") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-white p-2.5"><p className="text-[9px] font-bold text-[#91818A]">今日专注</p><p className="mt-1 text-base font-black">1小时40分</p></div><div className="rounded-2xl bg-[#EAF8EF] p-2.5"><p className="text-[9px] font-bold text-[#31935A]">完成次数</p><p className="mt-1 text-base font-black">8 次</p></div></div>
        <div className="mt-2 rounded-2xl border border-[#F3D9E3] bg-white p-3"><p className="text-[9px] font-black text-[#91818A]">近 7 天趋势</p><div className="mt-3 flex h-20 items-end gap-1.5">{[44, 72, 54, 88, 64, 78, 92].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-[#F58CB2]" style={{ height: `${height}%`, opacity: 0.45 + index * 0.07 }} />)}</div></div>
      </PhoneShell>
    );
  }

  if (variant === "modal") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <TaskList />
        <div className="absolute inset-x-5 top-[29%] z-20 rounded-[22px] border border-[#F3D9E3] bg-white p-3 shadow-[0_18px_38px_rgba(94,56,75,0.18)]">
          <div className="flex items-center justify-between"><p className="text-xs font-black">添加待办</p><Check size={14} className="text-[#E86C9B]" /></div>
          <div className="mt-3 rounded-xl bg-[#FFF0F6] px-3 py-2 text-[9px] font-bold">整理阅读笔记</div>
          <div className="mt-2 grid grid-cols-3 gap-1"><span className="rounded-lg bg-[#FFE1EC] p-1.5 text-center text-[8px] font-black">倒计时</span><span className="rounded-lg bg-[#F8F3F5] p-1.5 text-center text-[8px] font-black">正计时</span><span className="rounded-lg bg-[#F8F3F5] p-1.5 text-center text-[8px] font-black">不计时</span></div>
          <p className="mt-2 flex items-center gap-1 text-[8px] font-bold text-[#91818A]"><Target size={9} /> 普通待办 · 25 分钟</p>
        </div>
      </PhoneShell>
    );
  }

  if (variant === "future") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-3 rounded-2xl bg-[linear-gradient(135deg,#3B3238,#5A4852)] p-3.5 text-white"><CalendarDays size={18} className="text-[#F7D66E]" /><p className="mt-4 text-[9px] font-bold text-white/60">距离项目上线</p><p className="mt-1 text-2xl font-black">18 天</p></div>
        <div className="mt-2 space-y-2">{[["旅行出发", "26 天后"], ["家人生日", "42 天后"]].map(([item, date]) => <div key={item} className="flex items-center justify-between rounded-2xl border border-[#F3D9E3] bg-white px-3 py-2"><div><p className="text-[10px] font-black">{item}</p><p className="mt-0.5 text-[8px] font-bold text-[#91818A]">{date}</p></div><Bell size={12} className="text-[#E86C9B]" /></div>)}</div>
      </PhoneShell>
    );
  }

  if (variant === "settings" || variant === "checkin" || variant === "download") {
    const rows = variant === "settings"
      ? [[Palette, "主题颜色", "樱花粉"], [Bell, "本地提醒", "已开启"], [Clock3, "默认时长", "25 分钟"]]
      : [[Sunrise, "起床打卡", "07:12"], [Flame, "今日专注", "2小时10分"], [Moon, "睡前打卡", "23:40"]];
    return <PhoneShell title={title} subtitle={subtitle} compact={compact}><div className="mt-3 space-y-2">{rows.map(([Icon, label, value]) => <div key={label as string} className="flex items-center justify-between rounded-2xl border border-[#F3D9E3] bg-white px-3 py-3"><span className="flex items-center gap-2 text-[9px] font-black"><Icon size={13} className="text-[#E86C9B]" />{label as string}</span><span className="text-[8px] font-bold text-[#91818A]">{value as string}</span></div>)}</div></PhoneShell>;
  }

  return <PhoneShell title={title} subtitle={subtitle} compact={compact}><TaskList /></PhoneShell>;
}
