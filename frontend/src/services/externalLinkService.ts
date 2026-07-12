/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { isNativeApp } from "@/lib/capacitor";

function normalizeExternalUrl(url: string) {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const officialSiteUrl = normalizeExternalUrl(import.meta.env.VITE_OFFICIAL_SITE_URL || "https://cinoo.xyz");

function openWithWindow(url: string, fallbackToCurrentTab: boolean) {
  const target = isNativeApp ? "_system" : "_blank";
  const opened = window.open(url, target, "noopener,noreferrer");
  if (!opened && fallbackToCurrentTab) {
    window.location.href = url;
  }
  return Boolean(opened);
}

export async function openExternalLink(url: string) {
  const normalizedUrl = normalizeExternalUrl(url);

  if (!isNativeApp) {
    openWithWindow(normalizedUrl, true);
    return;
  }

  try {
    const { InAppBrowser } = await import("@capacitor/inappbrowser");
    await InAppBrowser.openInExternalBrowser({ url: normalizedUrl });
  } catch (error) {
    const opened = openWithWindow(normalizedUrl, false);
    if (!opened) throw error;
  }
}
