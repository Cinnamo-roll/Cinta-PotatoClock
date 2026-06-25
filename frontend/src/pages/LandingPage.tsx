import { useEffect } from "react";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  ChartNoAxesColumn,
  CheckCircle2,
  Clock3,
  Download,
  FolderKanban,
  Heart,
  Moon,
  ShieldCheck,
  Sparkles,
  TimerReset
} from "lucide-react";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import { downloadLinks } from "@/utils/env";

const featureCards = [
  { title: "待办驱动专注", desc: "先写下今天的小块任务，再一键进入专注，不让计时和任务管理分家。", icon: CalendarCheck, tone: "rose" },
  { title: "三种计时模式", desc: "倒计时、正计时、不计时都支持，适合学习、工作、阅读和轻量习惯养成。", icon: TimerReset, tone: "mint" },
  { title: "待办集整理", desc: "按学习、工作、生活或目标分类，把长期事项收进更清晰的抽屉。", icon: FolderKanban, tone: "sky" },
  { title: "统计复盘", desc: "今日、月度、年度、热力图、周总结和任务排行，看到每一次投入留下的痕迹。", icon: ChartNoAxesColumn, tone: "amber" },
  { title: "本地提醒", desc: "App 端支持本地通知，专注结束、暂停继续和锁屏提醒都更可靠。", icon: Bell, tone: "rose" },
  { title: "柔和设置", desc: "主题、声音、震动、通知和默认统计范围都能按自己的节奏调整。", icon: ShieldCheck, tone: "mint" }
];

const screenshots = [
  { title: "今日待办", subtitle: "卡片式任务和快速开始", variant: "list" as const },
  { title: "新建任务", subtitle: "时长、类型、分类一次设好", variant: "modal" as const },
  { title: "专注计时", subtitle: "沉浸式倒计时与完成反馈", variant: "timer" as const },
  { title: "数据统计", subtitle: "月度趋势、热力图和任务排行", variant: "stats" as const },
  { title: "打卡记录", subtitle: "早起、专注、睡前都能留痕", variant: "checkin" as const },
  { title: "未来计划", subtitle: "把重要日子放进倒计时", variant: "future" as const },
  { title: "个人设置", subtitle: "主题、提醒和账户管理", variant: "settings" as const },
  { title: "移动下载", subtitle: "官网统一分发安装包", variant: "download" as const }
];

const softStats = [
  ["10", "条 Flyway 迁移已校验"],
  ["43", "个后端测试通过"],
  ["2", "端安装包下载入口"],
  ["1", "个统一官网域名"]
];

const faqs = [
  ["Android 可以直接安装 APK 吗？", "可以。下载 APK 后按系统提示允许安装即可，建议只从 clock.cinoo.xyz 下载。"],
  ["iOS IPA 为什么不能直接点开安装？", "iOS IPA 需要自行签名，或后续通过 TestFlight / App Store 分发，不能像 Android APK 一样直接安装。"],
  ["官网下载链接放在哪里？", "上线时把 APK 和 IPA 放到服务器项目目录的 downloads 文件夹，官网会通过 /downloads/... 提供下载。"],
  ["数据保存在哪里？", "登录后的待办、专注记录、统计和设置都会通过后端 API 保存到 MySQL，Redis 用于缓存和登录辅助能力。"],
  ["锁屏提醒可靠吗？", "App 端使用 Capacitor Local Notifications，比普通网页提醒可靠；用户仍需要在系统里授予通知权限。"]
];

function toneClass(tone: string) {
  if (tone === "mint") return "bg-[#E7F5EC] text-[#47755A]";
  if (tone === "sky") return "bg-[#E8F3FF] text-[#3D6F9C]";
  if (tone === "amber") return "bg-[#FFF1CF] text-[#987238]";
  return "bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]";
}

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.add("landing-scroll-root");
    document.body.classList.add("landing-scroll-body");
    return () => {
      document.documentElement.classList.remove("landing-scroll-root");
      document.body.classList.remove("landing-scroll-body");
    };
  }, []);

  return (
    <div className="landing-page min-h-dvh overflow-x-hidden bg-[#fff8fb] text-[var(--app-text)]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/78 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a className="flex items-center gap-2 text-base font-black" href="#top" aria-label="土豆时钟首页">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFE1EC] text-lg shadow-[0_8px_18px_rgba(245,140,178,0.18)]">豆</span>
            <span>土豆时钟</span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-bold text-[var(--app-muted)] sm:flex">
            <a className="transition hover:text-[var(--app-text)]" href="#screenshots">截图</a>
            <a className="transition hover:text-[var(--app-text)]" href="#features">功能</a>
            <a className="transition hover:text-[var(--app-text)]" href="#download">下载</a>
            <a className="transition hover:text-[var(--app-text)]" href="#faq">问题</a>
          </div>
          <a className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#2f2931] px-4 text-sm font-black text-white shadow-[0_10px_24px_rgba(47,41,49,0.16)]" href="#download">
            下载
            <Download size={16} />
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="landing-hero relative overflow-hidden px-5 pb-12 pt-12 sm:pt-16">
          <div className="landing-grid absolute inset-0 opacity-70" />
          <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
            <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/74 px-4 py-2 text-sm font-black text-[#7E5262] shadow-[0_12px_30px_rgba(177,93,124,0.12)] backdrop-blur-xl">
              <Sparkles size={16} />
              把今天切成更容易开始的一小块
            </div>
            <h1 className="relative z-10 mt-6 max-w-4xl text-balance text-5xl font-black leading-[1.05] text-[#2E2730] sm:text-6xl lg:text-7xl">
              土豆时钟
            </h1>
            <p className="relative z-10 mt-5 max-w-2xl text-balance text-lg font-bold leading-8 text-[#6F626B] sm:text-xl">
              一个可爱但不打扰的待办式专注工具。写下任务，开始计时，留下记录，再温柔地复盘自己的投入。
            </p>
            <div className="relative z-10 mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
              <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2f2931] px-6 font-black text-white shadow-[0_14px_30px_rgba(47,41,49,0.18)] transition hover:-translate-y-0.5" href={downloadLinks.androidApk}>
                <Download size={18} />
                下载 Android APK
              </a>
              <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F9B6C9] px-6 font-black text-[#3E3037] shadow-[0_14px_30px_rgba(245,140,178,0.20)] transition hover:-translate-y-0.5" href={downloadLinks.iosIpa}>
                下载 iOS IPA
                <ArrowRight size={18} />
              </a>
            </div>
            <p className="relative z-10 mt-3 text-sm font-semibold text-[#8B7C84]">iOS IPA 需要自行签名或通过 TestFlight / App Store 分发。</p>

            <div className="landing-phone-stage relative mt-12 flex w-full max-w-5xl items-end justify-center gap-4 overflow-hidden pb-5">
              <div className="landing-float hidden w-[185px] rotate-[-7deg] sm:block">
                <PhoneMockup title="今日待办" subtitle="3 件小事待开始" compact />
              </div>
              <div className="landing-float-delayed w-[230px] sm:w-[270px]">
                <PhoneMockup title="专注计时" subtitle="正在专注中" variant="timer" />
              </div>
              <div className="landing-float hidden w-[185px] rotate-[7deg] sm:block">
                <PhoneMockup title="数据统计" subtitle="本月 28 次专注" variant="stats" compact />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/80 bg-white/64 py-6 backdrop-blur-xl">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-5 sm:grid-cols-4">
            {softStats.map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-[#F3DDE6] bg-white/72 px-4 py-4 text-center shadow-[0_10px_24px_rgba(129,82,98,0.08)]">
                <p className="text-3xl font-black text-[#3B3038]">{value}</p>
                <p className="mt-1 text-xs font-bold text-[#8A7C84]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="screenshots" className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-[var(--app-primary-strong)]">APP 画面</p>
              <h2 className="mt-2 text-3xl font-black text-[#2E2730] sm:text-4xl">从待办到复盘，都有柔软的小界面</h2>
            </div>
            <p className="max-w-md text-sm font-semibold leading-6 text-[#7E7179]">截图区补全了待办、新建、计时、统计、打卡、未来计划、设置和下载入口，用户进官网就能看懂 App 能做什么。</p>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {screenshots.map((shot, index) => (
              <div key={shot.title} className="landing-shot" style={{ animationDelay: `${index * 80}ms` }}>
                <PhoneMockup {...shot} compact />
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="bg-[#F4FAF6] py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <p className="text-sm font-black text-[#47755A]">核心功能</p>
              <h2 className="mt-2 text-3xl font-black text-[#2E2730] sm:text-4xl">轻量、完整、适合每天重复使用</h2>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature) => (
                <article key={feature.title} className="rounded-3xl border border-white/78 bg-white/82 p-5 shadow-[0_16px_34px_rgba(71,117,90,0.10)] backdrop-blur-xl transition hover:-translate-y-1">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass(feature.tone)}`}>
                    <feature.icon size={22} />
                  </div>
                  <h3 className="mt-4 text-xl font-black text-[#322B32]">{feature.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#756970]">{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="download" className="relative overflow-hidden bg-[#FFF4D8] px-5 py-16">
          <div className="landing-grid absolute inset-0 opacity-45" />
          <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-center">
            <div>
              <p className="text-sm font-black text-[#987238]">下载与安装</p>
              <h2 className="mt-2 text-3xl font-black text-[#2E2730] sm:text-4xl">官网统一提供 Android 和 iOS 安装包入口</h2>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-[#716457]">
                上线后把安装包放入服务器的 `downloads` 目录，用户即可从 `https://clock.cinoo.xyz/downloads/...` 下载。Android APK 可按系统提示安装；iOS IPA 需要签名或走 TestFlight / App Store。
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <a className="group rounded-3xl border border-white/80 bg-white/78 p-5 shadow-[0_16px_34px_rgba(152,114,56,0.12)] transition hover:-translate-y-1" href={downloadLinks.androidApk}>
                  <Download className="text-[#987238]" size={28} />
                  <h3 className="mt-4 text-2xl font-black">Android APK</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#716457]">适合安卓手机直接下载后安装。</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-black text-[#2E2730]">
                    下载 APK
                    <ArrowRight className="transition group-hover:translate-x-1" size={18} />
                  </span>
                </a>
                <a className="group rounded-3xl border border-white/80 bg-white/78 p-5 shadow-[0_16px_34px_rgba(152,114,56,0.12)] transition hover:-translate-y-1" href={downloadLinks.iosIpa}>
                  <ShieldCheck className="text-[#987238]" size={28} />
                  <h3 className="mt-4 text-2xl font-black">iOS IPA</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[#716457]">需要自行签名，或后续接入 TestFlight / App Store。</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-black text-[#2E2730]">
                    下载 IPA
                    <ArrowRight className="transition group-hover:translate-x-1" size={18} />
                  </span>
                </a>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[320px]">
              <PhoneMockup title="下载中心" subtitle="选择你的设备版本" variant="download" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-3xl bg-[#2F2931] p-6 text-white shadow-[0_18px_45px_rgba(47,41,49,0.16)]">
              <Heart size={28} />
              <h3 className="mt-4 text-2xl font-black">不制造压力</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-white/72">界面保持柔和，记录专注，但不把每一分钟都变成焦虑。</p>
            </div>
            <div className="rounded-3xl bg-[#E7F5EC] p-6 text-[#304A39] shadow-[0_18px_45px_rgba(71,117,90,0.12)]">
              <Moon size={28} />
              <h3 className="mt-4 text-2xl font-black">兼顾作息</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#4E6756]">早起、今日专注、睡前打卡可以和专注统计一起形成一天的节奏。</p>
            </div>
            <div className="rounded-3xl bg-[#E8F3FF] p-6 text-[#2F506F] shadow-[0_18px_45px_rgba(61,111,156,0.12)]">
              <CheckCircle2 size={28} />
              <h3 className="mt-4 text-2xl font-black">为上线准备</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#4D6A84]">官网、下载、API、Docker、Caddy 反代和环境变量都按独立项目准备。</p>
            </div>
          </div>
        </section>

        <section id="faq" className="bg-white/70 py-16">
          <div className="mx-auto max-w-4xl px-5">
            <p className="text-sm font-black text-[var(--app-primary-strong)]">FAQ</p>
            <h2 className="mt-2 text-3xl font-black text-[#2E2730]">上线前常见问题</h2>
            <div className="mt-8 space-y-3">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group rounded-3xl border border-[#F1DDE5] bg-white p-5 shadow-[0_12px_28px_rgba(129,82,98,0.08)]">
                  <summary className="cursor-pointer list-none font-black text-[#332C33] marker:hidden">
                    <span className="inline-flex w-full items-center justify-between gap-3">
                      {question}
                      <span className="text-xl text-[var(--app-primary-strong)] transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm font-semibold leading-7 text-[#756970]">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#F1DDE5] bg-[#2F2931] px-5 py-8 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm font-bold text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>土豆时钟 · clock.cinoo.xyz</p>
          <div className="flex flex-wrap gap-4">
            <a href="#top">回到顶部</a>
            <a href="#download">下载 App</a>
            <a href="mailto:support@clock.cinoo.xyz">support@clock.cinoo.xyz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
