/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { useEffect } from "react";
import {
  ArrowRight,
  BellRing,
  ChartNoAxesColumn,
  CheckCircle2,
  Clock3,
  Download,
  TimerReset,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRoundCheck
} from "lucide-react";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import { downloadLinks } from "@/utils/env";
import { projectIdentity } from "@/config/projectIdentity";

const workflow = [
  { index: "01", title: "写下眼前的小事", desc: "普通待办、习惯和目标各自归位。" },
  { index: "02", title: "选择适合的计时", desc: "倒计时、正计时或不计时，都不强迫。" },
  { index: "03", title: "进入一段专注", desc: "计时状态清楚，暂停与结束触手可及。" },
  { index: "04", title: "回来看见积累", desc: "从完成记录、热力图到阶段复盘。" }
];

const previews = [
  { title: "今天", subtitle: "把今天要做的事放清楚", variant: "list" as const },
  { title: "添加待办", subtitle: "计时方式与分类一次选好", variant: "modal" as const },
  { title: "专注中", subtitle: "只保留当前任务和剩余时间", variant: "timer" as const },
  { title: "统计", subtitle: "看趋势，也看每一天的细节", variant: "stats" as const },
  { title: "未来", subtitle: "重要日子到点提醒，不占用眼前", variant: "future" as const }
];

const features = [
  {
    icon: TimerReset,
    title: "三种计时，按任务选择",
    desc: "倒计时适合有明确时长的任务，正计时记录持续投入，不计时则用于快速完成。",
    tone: "yellow"
  },
  {
    icon: BellRing,
    title: "提醒和未来计划各归其位",
    desc: "待办提醒照顾今天，未来倒计时记住重要日期，首页仍然保持清爽。",
    tone: "blue"
  },
  {
    icon: UserRoundCheck,
    title: "登录后继续使用",
    desc: "待办、专注记录、统计和设置同步保存，换一台设备也不用重新整理。",
    tone: "green"
  },
  {
    icon: ChartNoAxesColumn,
    title: "记录是为了看懂自己",
    desc: "日历热力、专注趋势、任务排行和打卡记录，把投入变成可回看的线索。",
    tone: "rose"
  }
];

const faqs = [
  ["Android 怎么安装？", "下载 APK 后按系统提示安装即可。首次安装时，手机可能会询问是否允许浏览器安装应用。"],
  ["iOS 下载后为什么不能直接打开？", "官网提供的是未签名 IPA，需要通过 AltStore、SideStore、TrollStore 或你正在使用的签名方式安装。"],
  ["数据会保存在哪里？", "登录后，待办、专注记录、统计和设置会同步到你的账号；本地提醒仍由手机系统执行。"],
  ["可以使用哪些计时方式？", "新建待办时可选择倒计时、正计时或不计时；不同待办可以使用不同方式。"],
  ["安装包从哪里下载最稳妥？", "请只从 clock.cinoo.xyz 下载。官网会持续提供当前 Android APK 和 iOS IPA。"]
];

function featureTone(tone: string) {
  if (tone === "blue") return "bg-[#DCEEFF] text-[#285F88]";
  if (tone === "green") return "bg-[#DDEFE4] text-[#35664A]";
  if (tone === "rose") return "bg-[#F8DDE5] text-[#8C425A]";
  return "bg-[#F7D66E] text-[#594914]";
}

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.add("landing-scroll-root");
    document.body.classList.add("landing-scroll-body");

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>(".landing-reveal"));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.14, rootMargin: "0px 0px -6%" }
    );
    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("landing-scroll-root");
      document.body.classList.remove("landing-scroll-body");
    };
  }, []);

  return (
    <div className="landing-page min-h-dvh bg-[#F8F6F1] text-[#29262A]">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#29262A]/10 bg-[#F8F6F1] shadow-[0_2px_14px_rgba(41,38,42,0.06)]">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a className="flex min-w-0 items-center gap-2.5 font-black" href="#top" aria-label="土豆时钟首页">
            <img className="h-9 w-9 rounded-lg shadow-[0_5px_14px_rgba(111,85,18,0.18)]" src="/icons/app-icon-64.png" alt="" aria-hidden="true" />
            <span className="truncate">土豆时钟ToDo</span>
          </a>
          <div className="hidden items-center gap-7 text-sm font-bold text-[#6E686D] md:flex">
            <a className="transition hover:text-[#29262A]" href="#preview">界面</a>
            <a className="transition hover:text-[#29262A]" href="#features">体验</a>
            <a className="transition hover:text-[#29262A]" href="#download">下载</a>
            <a className="transition hover:text-[#29262A]" href="#faq">问答</a>
          </div>
          <a className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#29262A] px-4 text-sm font-black text-white transition hover:bg-[#464047]" href="#download">
            <Download size={16} />
            下载
          </a>
        </nav>
      </header>

      <main id="top" className="pt-[65px]">
        <section className="landing-hero relative overflow-hidden bg-[#F7D66E] px-5">
          <span className="landing-orbit landing-orbit-one" aria-hidden="true" />
          <span className="landing-orbit landing-orbit-two" aria-hidden="true" />
          <img className="landing-hero-mark pointer-events-none absolute right-[-7rem] top-[-5rem] w-[34rem] opacity-[0.12]" src="/icons/app-icon-512.png" alt="" aria-hidden="true" />
          <div className="mx-auto flex h-full max-w-6xl items-center">
            <div className="landing-hero-copy relative z-20 max-w-[650px] py-14 sm:py-20">
              <p className="flex items-center gap-2 text-sm font-black text-[#665316]">
                <Sparkles size={17} />
                把今天安排好，也把每一次投入留下来
              </p>
              <h1 className="mt-5 text-balance text-5xl font-black leading-[1.04] text-[#242124] sm:text-6xl lg:text-7xl">
                土豆时钟ToDo
              </h1>
              <p className="mt-5 max-w-xl text-balance text-lg font-bold leading-8 text-[#51471F] sm:text-xl">
                待办、待办集、专注计时、未来计划与统计复盘，装进一个轻巧顺手的时间工具。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#29262A] px-6 font-black text-white shadow-[0_12px_24px_rgba(41,38,42,0.20)] transition hover:-translate-y-0.5 hover:bg-[#423D43]" href={downloadLinks.androidApk}>
                  <Smartphone size={18} />
                  Android {projectIdentity.version}
                  <Download size={17} />
                </a>
                <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-[#29262A] bg-[#F8F6F1] px-6 font-black text-[#29262A] transition hover:-translate-y-0.5" href={downloadLinks.iosIpa}>
                  iOS 未签名版
                  <ArrowRight size={18} />
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-[#62551E]">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={16} />账号同步</span>
                <span className="inline-flex items-center gap-1.5"><BellRing size={16} />系统提醒</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 size={16} />后台计时</span>
              </div>
            </div>

            <div className="landing-hero-devices pointer-events-none absolute inset-y-0 right-[max(2rem,calc((100vw-72rem)/2))] z-10 hidden w-[500px] lg:block" aria-hidden="true">
              <div className="landing-device landing-device-back absolute bottom-[-7rem] right-[19rem] w-[190px] -rotate-6">
                <PhoneMockup title="今天" subtitle="三件小事，慢慢来" compact />
              </div>
              <div className="landing-device landing-device-front absolute bottom-[-5rem] right-0 w-[270px] rotate-3">
                <PhoneMockup title="专注中" subtitle="整理阅读笔记" variant="timer" />
              </div>
            </div>
            <div className="landing-hero-mobile-device pointer-events-none absolute bottom-[-9rem] right-5 z-10 w-[170px] rotate-3 lg:hidden" aria-hidden="true">
              <PhoneMockup title="专注中" subtitle="整理阅读笔记" variant="timer" compact />
            </div>
          </div>
        </section>

        <section className="bg-[#29262A] text-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 px-5 py-8 lg:grid-cols-4 lg:py-9">
            {workflow.map((item, index) => (
              <div
                key={item.index}
                className={`border-white/12 py-4 ${index % 2 === 0 ? "pl-0 pr-3" : "border-l px-3"} lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0`}
              >
                <p className="text-xs font-black text-[#F7D66E]">{item.index}</p>
                <h2 className="mt-2 text-base font-black sm:text-lg">{item.title}</h2>
                <p className="mt-1.5 text-sm font-semibold leading-6 text-white/62">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="preview" className="relative overflow-hidden px-5 py-16 sm:py-24">
          <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-[#F8DDE5]/55 blur-3xl" aria-hidden="true" />
          <div className="mx-auto max-w-6xl">
            <div className="landing-reveal max-w-3xl">
              <p className="text-sm font-black text-[#8C425A]">真实使用路径</p>
              <h2 className="mt-3 text-balance text-3xl font-black sm:text-4xl">从写下任务，到看见自己做过什么</h2>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[#706A6E]">下面的界面按真实 App 结构重绘：创建待办、选择计时、开始专注，再到统计里回看记录，路径完整而直接。</p>
            </div>
            <div className="landing-preview-rail no-scrollbar mt-10 flex snap-x gap-5 overflow-x-auto pb-5 lg:grid lg:grid-cols-5 lg:overflow-visible">
              {previews.map((preview, index) => (
                <figure key={preview.title} className="landing-reveal min-w-[220px] snap-center" style={{ animationDelay: `${index * 70}ms` }}>
                  <PhoneMockup {...preview} compact />
                  <figcaption className="mt-4 border-l-2 border-[#F7D66E] pl-3">
                    <p className="font-black">{preview.title}</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-[#777075]">{preview.subtitle}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="relative overflow-hidden bg-[#E8F1EB] px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="landing-reveal flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-black text-[#35664A]">真实功能，不堆概念</p>
                <h2 className="mt-3 text-balance text-3xl font-black sm:text-4xl">从安排到复盘，每一步都有用</h2>
              </div>
              <p className="max-w-md text-sm font-semibold leading-6 text-[#5F6E64]">界面围绕日常任务展开，不用先学习复杂的方法，也不会用功能打断专注。</p>
            </div>
            <div className="mt-10 grid border-y border-[#35664A]/20 md:grid-cols-2">
              {features.map((feature, index) => (
                <article key={feature.title} className={`landing-reveal py-7 md:px-7 ${index % 2 ? "md:border-l md:border-[#35664A]/20" : ""} ${index > 1 ? "border-t border-[#35664A]/20" : index === 1 ? "border-t border-[#35664A]/20 md:border-t-0" : ""}`}>
                  <div className={`landing-feature-icon flex h-11 w-11 items-center justify-center rounded-xl ${featureTone(feature.tone)}`}>
                    <feature.icon size={22} />
                  </div>
                  <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
                  <p className="mt-2 max-w-lg text-sm font-semibold leading-7 text-[#5F6E64]">{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="download" className="landing-download-section relative overflow-hidden bg-[#29262A] px-5 py-16 text-white sm:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="landing-reveal grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-black text-[#F7D66E]">下载土豆时钟ToDo</p>
                <h2 className="mt-3 text-balance text-3xl font-black sm:text-4xl">选好版本，继续今天</h2>
                <p className="mt-4 max-w-lg text-sm font-semibold leading-7 text-white/62">安装包仅通过 clock.cinoo.xyz 提供。Android 可直接安装；iOS 当前提供未签名 IPA。</p>
                <p className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#B7D8C3]"><ShieldCheck size={18} />当前版本 {projectIdentity.version}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <a className="landing-download-option group rounded-lg border border-white/14 bg-white/[0.06] p-5 transition hover:border-[#F7D66E] hover:bg-white/[0.10]" href={downloadLinks.androidApk}>
                  <div className="flex items-start justify-between gap-4">
                    <Smartphone className="text-[#F7D66E]" size={26} />
                    <Download className="transition group-hover:translate-y-0.5" size={20} />
                  </div>
                  <h3 className="mt-6 text-xl font-black">Android APK</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/60">版本 {projectIdentity.version}，可直接覆盖旧版安装。</p>
                </a>
                <a className="landing-download-option group rounded-lg border border-white/14 bg-white/[0.06] p-5 transition hover:border-[#9CC7E8] hover:bg-white/[0.10]" href={downloadLinks.iosIpa}>
                  <div className="flex items-start justify-between gap-4">
                    <ShieldCheck className="text-[#9CC7E8]" size={26} />
                    <ArrowRight className="transition group-hover:translate-x-1" size={20} />
                  </div>
                  <h3 className="mt-6 text-xl font-black">iOS IPA</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/60">未签名版本，适合已有签名方式的用户。</p>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="landing-reveal">
              <p className="text-sm font-black text-[#8C425A]">下载前常见问题</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">把需要知道的说清楚</h2>
            </div>
            <div className="mt-9 border-t border-[#29262A]/14">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group border-b border-[#29262A]/14 py-5">
                  <summary className="cursor-pointer list-none font-black marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {question}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1EDE3] text-xl transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 max-w-3xl pr-12 text-sm font-semibold leading-7 text-[#706A6E]">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#29262A]/12 bg-[#F0ECE3] px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm font-bold text-[#6E686D] sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2"><img className="h-7 w-7 rounded-md" src="/icons/app-icon-32.png" alt="" />{projectIdentity.displayName} · clock.cinoo.xyz</p>
          <div className="flex flex-wrap gap-5">
            <a className="hover:text-[#29262A]" href="#top">回到顶部</a>
            <a className="hover:text-[#29262A]" href="#download">下载 App</a>
            <a className="hover:text-[#29262A]" href={projectIdentity.repositoryUrl} target="_blank" rel="noreferrer">Original project by {projectIdentity.author}</a>
            <a className="hover:text-[#29262A]" href="mailto:support@clock.cinoo.xyz">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
