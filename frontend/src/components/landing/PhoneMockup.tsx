import type { ReactNode } from "react";
import { Bell, CalendarDays, Check, Clock3, Flame, Moon, Palette, Play, TimerReset } from "lucide-react";

type PhoneVariant = "list" | "timer" | "stats" | "settings" | "modal" | "checkin" | "future" | "download";

interface PhoneMockupProps {
  title: string;
  subtitle: string;
  variant?: PhoneVariant;
  compact?: boolean;
}

const taskItems = [
  ["背英语单词", "25 分钟", "#F2D7DF"],
  ["写一段代码", "45 分钟", "#D9ECDF"],
  ["整理阅读笔记", "20 分钟", "#DCEBFA"]
];

function PhoneShell({ title, subtitle, compact = false, children }: PhoneMockupProps & { children: ReactNode }) {
  return (
    <div className="landing-phone rounded-[34px] bg-[#252225] p-[7px] shadow-[0_20px_42px_rgba(41,38,42,0.24)]">
      <div className={`relative aspect-[9/16] overflow-hidden rounded-[27px] bg-[#F7F4EF] ${compact ? "p-3" : "p-4"}`}>
        <div className="relative z-10 mx-auto mb-4 h-4 w-20 rounded-full bg-[#252225]" />
        <div className="relative z-10 border-b border-[#29262A]/10 pb-3">
          <h3 className={`${compact ? "text-base" : "text-lg"} font-black text-[#29262A]`}>{title}</h3>
          <p className="mt-0.5 text-[11px] font-bold text-[#7A7377]">{subtitle}</p>
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

export function PhoneMockup({ title, subtitle, variant = "list", compact = false }: PhoneMockupProps) {
  if (variant === "timer") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-5 flex justify-center">
          <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[9px] border-[#F0D5DD] bg-white shadow-[0_12px_22px_rgba(41,38,42,0.08)]">
            <div className="absolute inset-[-9px] rounded-full border-[9px] border-transparent border-t-[#D65F84] border-r-[#D65F84]" />
            <div className="text-center">
              <p className="text-[10px] font-black text-[#8C425A]">剩余时间</p>
              <p className="mt-1 text-3xl font-black text-[#29262A]">24:59</p>
              <p className="mt-1 max-w-24 truncate text-[10px] font-bold text-[#7A7377]">整理阅读笔记</p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <span className="rounded-lg bg-[#29262A] px-3 py-2 text-center text-xs font-black text-white">暂停</span>
          <span className="rounded-lg border border-[#29262A]/12 bg-white px-3 py-2 text-center text-xs font-black text-[#5F585D]">结束</span>
        </div>
      </PhoneShell>
    );
  }

  if (variant === "stats") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-[#29262A]/8 bg-white p-3">
            <p className="text-[10px] font-bold text-[#7A7377]">今日专注</p>
            <p className="mt-1 text-lg font-black text-[#29262A]">1h 40m</p>
          </div>
          <div className="rounded-lg bg-[#DDEFE4] p-3">
            <p className="text-[10px] font-bold text-[#35664A]">完成</p>
            <p className="mt-1 text-lg font-black text-[#294D38]">8 次</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg border border-[#29262A]/8 bg-white p-3">
          <div className="flex h-24 items-end gap-2">
            {[44, 72, 54, 88, 64, 78, 52].map((height, index) => (
              <span key={index} className="flex-1 rounded-t-sm bg-[#D65F84]" style={{ height: `${height}%`, opacity: 0.45 + index * 0.06 }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[8px] font-bold text-[#918A8E]"><span>周一</span><span>今天</span></div>
        </div>
      </PhoneShell>
    );
  }

  if (variant === "modal") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-5 rounded-lg border border-[#29262A]/10 bg-white p-3 shadow-[0_10px_22px_rgba(41,38,42,0.10)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8C425A]">取消</span>
            <p className="text-xs font-black text-[#29262A]">新待办</p>
            <Check size={15} className="text-[#35664A]" />
          </div>
          <div className="mt-3 rounded-lg bg-[#F3EFF0] px-3 py-2 text-[10px] font-bold text-[#5F585D]">整理阅读笔记</div>
          <p className="mt-3 text-[9px] font-black text-[#7A7377]">计时方式</p>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            <span className="rounded-md bg-[#F2D7DF] px-1 py-2 text-center text-[9px] font-black text-[#8C425A]">倒计时</span>
            <span className="rounded-md bg-[#F3EFF0] px-1 py-2 text-center text-[9px] font-black text-[#6D666A]">正计时</span>
            <span className="rounded-md bg-[#F3EFF0] px-1 py-2 text-center text-[9px] font-black text-[#6D666A]">不计时</span>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-[#F3EFF0] px-3 py-2 text-[10px] font-bold"><span>25 分钟</span><TimerReset size={14} /></div>
        </div>
      </PhoneShell>
    );
  }

  if (variant === "future") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-4 rounded-lg bg-[#29262A] p-4 text-white">
          <CalendarDays size={20} className="text-[#F7D66E]" />
          <p className="mt-5 text-[10px] font-bold text-white/60">距离项目上线</p>
          <p className="mt-1 text-3xl font-black">18 天</p>
        </div>
        <div className="mt-3 space-y-2">
          {["旅行出发", "生日提醒"].map((item, index) => (
            <div key={item} className="flex items-center justify-between rounded-lg border border-[#29262A]/8 bg-white px-3 py-2.5">
              <div>
                <p className="text-[10px] font-black text-[#29262A]">{item}</p>
                <p className="mt-0.5 text-[9px] font-bold text-[#8A8387]">{index ? "42 天后" : "26 天后"}</p>
              </div>
              <Bell size={13} className="text-[#8C425A]" />
            </div>
          ))}
        </div>
      </PhoneShell>
    );
  }

  if (variant === "settings" || variant === "checkin" || variant === "download") {
    const rows = variant === "settings"
      ? [[Palette, "主题颜色", "暖黄"], [Bell, "本地提醒", "已开启"], [TimerReset, "默认时长", "25 分钟"]]
      : [[Flame, "早起", "07:12"], [Clock3, "今日专注", "2 小时 10 分"], [Moon, "睡前", "23:40"]];
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-4 space-y-2">
          {rows.map(([Icon, label, value]) => (
            <div key={label as string} className="flex items-center justify-between rounded-lg border border-[#29262A]/8 bg-white px-3 py-3">
              <span className="flex items-center gap-2 text-[10px] font-black text-[#3A3538]"><Icon size={14} />{label as string}</span>
              <span className="text-[9px] font-bold text-[#817A7E]">{value as string}</span>
            </div>
          ))}
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell title={title} subtitle={subtitle} compact={compact}>
      <div className="mt-4 space-y-2.5">
        {taskItems.map(([item, time, color]) => (
          <div key={item} className="flex items-center justify-between rounded-lg border border-[#29262A]/8 bg-white p-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-[#29262A]">{item}</p>
              <p className="mt-0.5 text-[10px] font-bold text-[#817A7E]">{time}</p>
            </div>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: color }}><Play size={12} fill="currentColor" /></span>
          </div>
        ))}
      </div>
    </PhoneShell>
  );
}
