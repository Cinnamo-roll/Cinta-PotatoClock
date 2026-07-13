/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { http } from "./http";

export interface AppPlatformRelease {
  available: boolean;
  downloadUrl?: string | null;
  installNote?: string | null;
}

export interface AppReleaseInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  forceUpdate: boolean;
  changelog: string[];
  ios: AppPlatformRelease;
  android: AppPlatformRelease;
}

export const publicAppApi = {
  latestRelease: () => http.get<never, AppReleaseInfo>("/public/app/releases/latest")
};
