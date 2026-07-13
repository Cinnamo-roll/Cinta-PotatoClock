/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import * as Dialog from "@radix-ui/react-dialog";
import type { PluginListenerHandle } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Download, ExternalLink, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { isNativeApp } from "@/lib/capacitor";
import { checkForAppUpdate, type AvailableAppUpdate } from "@/services/appUpdateService";
import { openExternalLink } from "@/services/externalLinkService";
import { useUiStore } from "@/stores/uiStore";

export function AppUpdatePrompt() {
  const toast = useUiStore((state) => state.toast);
  const [update, setUpdate] = useState<AvailableAppUpdate | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!isNativeApp) return;
    let active = true;
    let resumeHandle: PluginListenerHandle | undefined;

    const check = (ignoreInterval = false) => {
      void checkForAppUpdate(ignoreInterval)
        .then((availableUpdate) => {
          if (active && availableUpdate) setUpdate(availableUpdate);
        })
        .catch(() => undefined);
    };

    check(true);
    void CapacitorApp.addListener("resume", () => check()).then((handle) => {
      if (active) resumeHandle = handle;
      else void handle.remove();
    });

    return () => {
      active = false;
      void resumeHandle?.remove();
    };
  }, []);

  if (!update) return null;

  const isAndroidDownload = update.target === "android-apk";
  const handleUpdate = async () => {
    setOpening(true);
    try {
      await openExternalLink(update.actionUrl);
      if (!update.release.forceUpdate) setUpdate(null);
    } catch {
      toast({
        title: isAndroidDownload ? "安装包暂时无法下载" : "官网暂时打不开",
        description: "请稍后重试，或在浏览器输入 clock.cinoo.xyz。",
        tone: "error",
        durationMs: 6500
      });
    } finally {
      setOpening(false);
    }
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !update.release.forceUpdate) setUpdate(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-[rgba(42,35,24,0.28)] backdrop-blur-[2px]" />
        <Dialog.Content
          className="app-dialog-panel app-modal-scroll z-[100] w-[calc(100%-40px)] max-w-[370px] overflow-hidden rounded-[30px] p-0"
          onEscapeKeyDown={(event) => update.release.forceUpdate && event.preventDefault()}
          onPointerDownOutside={(event) => update.release.forceUpdate && event.preventDefault()}
        >
          <div className="bg-[linear-gradient(145deg,var(--app-primary-soft),var(--app-card))] px-5 pb-5 pt-6">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[var(--app-primary)] text-[var(--app-text)] shadow-[0_10px_24px_color-mix(in_srgb,var(--app-primary)_22%,transparent)]">
                <Sparkles size={25} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--app-primary-strong)]">发现新版本</p>
                <Dialog.Title className="mt-1 text-2xl font-black text-[var(--app-text)]">土豆时钟 {update.release.version}</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm font-semibold text-[var(--app-muted)]">
                  当前版本 {update.currentVersion} · 构建 {update.currentBuild}
                </Dialog.Description>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5 pt-4">
            {update.release.changelog.length > 0 ? (
              <div className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-card-soft)] p-4">
                <p className="text-sm font-black text-[var(--app-text)]">这次更新</p>
                <ul className="mt-2 space-y-2 text-sm font-semibold leading-6 text-[var(--app-muted)]">
                  {update.release.changelog.slice(0, 4).map((item) => (
                    <li className="flex gap-2" key={item}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--app-primary-strong)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-4 text-xs font-semibold leading-5 text-[var(--app-muted)]">
              {isAndroidDownload
                ? "点击后会直接下载新版 APK，Android 会在安装前再次向你确认。原有账号和数据不会被清除。"
                : "iOS 将打开土豆时钟官网，由官网提供当前可用的安装方式。"}
            </p>

            {update.release.forceUpdate ? (
              <p className="mt-3 rounded-2xl bg-[var(--app-primary-soft)] px-3 py-2.5 text-center text-xs font-black leading-5 text-[var(--app-primary-strong)]">
                此版本为必要更新，完成更新后才能继续使用
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-3">
              {!update.release.forceUpdate ? (
                <Button variant="secondary" onClick={() => setUpdate(null)}>
                  稍后提醒
                </Button>
              ) : null}
              <Button className={update.release.forceUpdate ? "col-span-2" : undefined} onClick={() => void handleUpdate()} disabled={opening}>
                {isAndroidDownload ? <Download size={17} /> : <ExternalLink size={17} />}
                {opening ? "正在打开..." : isAndroidDownload ? "下载并更新" : "前往官网"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
