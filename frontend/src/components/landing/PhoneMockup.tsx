import type { ReactNode } from "react";
import { Bell, CalendarDays, Check, ChevronRight, Clock3, Download, Flame, Moon, Palette, TimerReset } from "lucide-react";

type PhoneVariant = "list" | "timer" | "stats" | "settings" | "modal" | "checkin" | "future" | "download";

interface PhoneMockupProps {
  title: string;
  subtitle: string;
  variant?: PhoneVariant;
  compact?: boolean;
}

const taskItems = [
  ["背英语单词", "25 分钟", "bg-[#FFE1EC]"],
  ["写一段代码", "45 分钟", "bg-[#E7F5EC]"],
  ["整理阅读笔记", "20 分钟", "bg-[#E8F3FF]"]
];

function PhoneShell({ title, subtitle, compact = false, children }: PhoneMockupProps & { children: ReactNode }) {
  return (
    <div className="landing-phone rounded-[34px] border border-white/80 bg-white/72 p-2.5 shadow-[0_18px_40px_rgba(129,82,98,0.14)] backdrop-blur-xl">
      <div className={`relative aspect-[9/16] overflow-hidden rounded-[28px] border border-white/76 bg-[#FFF8FB] ${compact ? "p-3" : "p-4"}`}>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,225,236,0.72),rgba(232,243,255,0.40)_45%,rgba(231,245,236,0.46))]" />
        <div className="relative z-10 mx-auto mb-4 h-4 w-20 rounded-full bg-[#2F2931]/10" />
        <div className="relative z-10">
          <h3 className={`${compact ? "text-base" : "text-lg"} font-black text-[#2F2931]`}>{title}</h3>
          <p className="mt-1 text-xs font-bold text-[#7D7078]">{subtitle}</p>
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
        <div className="mt-6 flex justify-center">
          <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white/78 shadow-[inset_0_0_0_10px_rgba(249,182,201,0.28),0_16px_32px_rgba(129,82,98,0.12)]">
            <div className="absolute inset-4 rounded-full border-[10px] border-[#F58CB2] border-r-[#E7F5EC] border-t-[#FFF1CF]" />
            <div className="text-center">
              <p className="text-xs font-black text-[#8B6474]">专注中</p>
              <p className="mt-1 text-4xl font-black text-[#2F2931]">24:59</p>
              <p className="mt-1 text-xs font-bold text-[#8A7C84]">写一段代码</p>
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <span className="rounded-2xl bg-[#2F2931] px-3 py-2 text-center text-xs font-black text-white">暂停</span>
          <span className="rounded-2xl bg-white/78 px-3 py-2 text-center text-xs font-black text-[#6D5E66]">放弃</span>
        </div>
      </PhoneShell>
    );
  }

  if (variant === "stats") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/78 p-3">
            <p className="text-[10px] font-bold text-[#8A7C84]">今日</p>
            <p className="text-xl font-black text-[#2F2931]">1h 40m</p>
          </div>
          <div className="rounded-2xl bg-[#E7F5EC] p-3">
            <p className="text-[10px] font-bold text-[#47755A]">完成</p>
            <p className="text-xl font-black text-[#304A39]">8 次</p>
          </div>
        </div>
        <div className="mt-4 rounded-3xl bg-white/78 p-3">
          {[72, 48, 86, 64].map((width, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <div className="h-2 rounded-full bg-[#F1E5EA]">
                <div className="h-2 rounded-full bg-[#F58CB2]" style={{ width: `${width}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }).map((_, index) => (
            <span key={index} className={`h-4 rounded-md ${index % 5 === 0 ? "bg-[#F58CB2]" : index % 3 === 0 ? "bg-[#F9B6C9]" : "bg-white/82"}`} />
          ))}
        </div>
      </PhoneShell>
    );
  }

  if (variant === "settings") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-5 space-y-2">
          {[
            [Palette, "主题颜色", "柔粉主题"],
            [Bell, "本地提醒", "已开启"],
            [TimerReset, "默认时长", "25 分钟"]
          ].map(([Icon, label, value]) => (
            <div key={label as string} className="flex items-center justify-between rounded-2xl bg-white/78 px-3 py-3">
              <span className="flex items-center gap-2 text-xs font-black text-[#3A3037]">
                <Icon size={15} />
                {label as string}
              </span>
              <span className="text-[10px] font-bold text-[#8A7C84]">{value as string}</span>
            </div>
          ))}
        </div>
      </PhoneShell>
    );
  }

  if (variant === "modal") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-6 rounded-[26px] bg-white/88 p-4 shadow-[0_14px_30px_rgba(129,82,98,0.12)]">
          <p className="text-center text-sm font-black text-[#2F2931]">添加待办</p>
          <div className="mt-4 h-9 rounded-2xl bg-[#FFF0F6]" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <span className="rounded-2xl bg-[#F9B6C9] px-2 py-2 text-center text-[10px] font-black text-[#3E3037]">倒计时</span>
            <span className="rounded-2xl bg-[#E7F5EC] px-2 py-2 text-center text-[10px] font-black text-[#47755A]">正计时</span>
            <span className="rounded-2xl bg-[#E8F3FF] px-2 py-2 text-center text-[10px] font-black text-[#3D6F9C]">不计时</span>
          </div>
          <div className="mt-3 rounded-2xl bg-[#2F2931] py-2 text-center text-xs font-black text-white">保存</div>
        </div>
      </PhoneShell>
    );
  }

  if (variant === "checkin") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-5 space-y-2">
          {[
            [Flame, "早起", "07:12"],
            [Clock3, "今日专注", "2 小时 10 分"],
            [Moon, "睡前", "23:40"]
          ].map(([Icon, label, value]) => (
            <div key={label as string} className="flex items-center justify-between rounded-2xl bg-white/78 px-3 py-3">
              <span className="flex items-center gap-2 text-xs font-black text-[#3A3037]">
                <Icon size={15} />
                {label as string}
              </span>
              <span className="text-[10px] font-bold text-[#8A7C84]">{value as string}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-3xl bg-[#E7F5EC] p-3 text-xs font-bold leading-5 text-[#47755A]">今天状态不错，晚点记得整理一下专注记录。</div>
      </PhoneShell>
    );
  }

  if (variant === "future") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-5 rounded-3xl bg-[#2F2931] p-4 text-white">
          <CalendarDays size={24} />
          <p className="mt-4 text-xs font-bold text-white/70">距离期末复盘</p>
          <p className="mt-1 text-4xl font-black">18 天</p>
        </div>
        <div className="mt-3 space-y-2">
          {["项目上线", "旅行计划"].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-2xl bg-white/78 px-3 py-2 text-xs font-black text-[#3A3037]">
              {item}
              <ChevronRight size={14} />
            </div>
          ))}
        </div>
      </PhoneShell>
    );
  }

  if (variant === "download") {
    return (
      <PhoneShell title={title} subtitle={subtitle} compact={compact}>
        <div className="mt-5 space-y-3">
          {[
            ["Android APK", "直接下载"],
            ["iOS IPA", "需要签名"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl bg-white/82 p-4">
              <div className="flex items-center justify-between">
                <Download size={18} className="text-[#987238]" />
                <Check size={16} className="text-[#47755A]" />
              </div>
              <p className="mt-3 text-sm font-black text-[#2F2931]">{label}</p>
              <p className="mt-1 text-xs font-bold text-[#8A7C84]">{value}</p>
            </div>
          ))}
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell title={title} subtitle={subtitle} compact={compact}>
      <div className="mt-5 space-y-3">
        {taskItems.map(([item, time, color]) => (
          <div key={item} className="flex items-center justify-between rounded-3xl bg-white/78 p-3 shadow-[0_10px_22px_rgba(129,82,98,0.08)]">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#2F2931]">{item}</p>
              <p className="text-xs font-bold text-[#8A7C84]">{time}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-black text-[#3E3037] ${color}`}>开始</span>
          </div>
        ))}
      </div>
    </PhoneShell>
  );
}
