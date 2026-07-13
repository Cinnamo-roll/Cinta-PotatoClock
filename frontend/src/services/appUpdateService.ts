/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { App as CapacitorApp } from "@capacitor/app";
import { publicAppApi, type AppReleaseInfo } from "@/api/app";
import { isNativeApp, platform } from "@/lib/capacitor";
import { officialSiteUrl } from "./externalLinkService";

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export interface AvailableAppUpdate {
  currentVersion: string;
  currentBuild: string;
  release: AppReleaseInfo;
  target: "android-apk" | "official-site";
  actionUrl: string;
}

let lastCheckedAt = 0;
let pendingCheck: Promise<AvailableAppUpdate | null> | null = null;

function numericParts(value: string) {
  const matches = value.match(/\d+/g);
  return matches ? matches.map((part) => Number.parseInt(part, 10)) : [0];
}

export function compareAppVersions(left: string, right: string) {
  const leftParts = numericParts(left);
  const rightParts = numericParts(right);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference > 0 ? 1 : -1;
  }

  return 0;
}

export function isReleaseNewer(currentVersion: string, currentBuild: string, release: Pick<AppReleaseInfo, "version" | "buildNumber">) {
  const versionComparison = compareAppVersions(release.version, currentVersion);
  if (versionComparison !== 0) return versionComparison > 0;
  return compareAppVersions(release.buildNumber, currentBuild) > 0;
}

function withVersionQuery(url: string, version: string) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("v", version);
    return parsed.toString();
  } catch {
    return url;
  }
}

async function loadAvailableUpdate() {
  const [appInfo, release] = await Promise.all([CapacitorApp.getInfo(), publicAppApi.latestRelease()]);
  if (!isReleaseNewer(appInfo.version, appInfo.build, release)) return null;

  if (platform === "android" && release.android.available && release.android.downloadUrl) {
    return {
      currentVersion: appInfo.version,
      currentBuild: appInfo.build,
      release,
      target: "android-apk" as const,
      actionUrl: withVersionQuery(release.android.downloadUrl, release.version)
    };
  }

  return {
    currentVersion: appInfo.version,
    currentBuild: appInfo.build,
    release,
    target: "official-site" as const,
    actionUrl: officialSiteUrl
  };
}

export async function checkForAppUpdate(ignoreInterval = false) {
  if (!isNativeApp) return null;
  const now = Date.now();
  if (!ignoreInterval && now - lastCheckedAt < CHECK_INTERVAL_MS) return null;
  if (pendingCheck) return pendingCheck;

  lastCheckedAt = now;
  pendingCheck = loadAvailableUpdate().finally(() => {
    pendingCheck = null;
  });
  return pendingCheck;
}
