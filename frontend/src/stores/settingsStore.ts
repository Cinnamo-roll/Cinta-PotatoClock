/*
 * Copyright 2026 CintaOvO
 * SPDX-License-Identifier: PolyForm-Noncommercial-1.0.0
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { settingsApi } from "@/api/settings";
import { defaultSettings } from "@/mocks/mockData";
import type { ThemeMode, UserSettings } from "@/types/settings";

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  applyTheme: () => void;
}

function shouldUseDark(theme: ThemeMode) {
  return theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      loadSettings: async () => {
        set({ isLoading: true });
        try {
          const settings = await settingsApi.getSettings();
          set({ settings, isLoading: false });
          get().applyTheme();
        } catch {
          set({ isLoading: false });
        }
      },
      updateSettings: async (payload) => {
        const previous = get().settings;
        const optimistic = { ...previous, ...payload };
        set({ settings: optimistic });
        get().applyTheme();
        try {
          const settings = await settingsApi.updateSettings(payload);
          set({ settings });
          get().applyTheme();
        } catch (error) {
          set({ settings: previous });
          get().applyTheme();
          throw error;
        }
      },
      setTheme: async (theme) => {
        localStorage.setItem("potato-theme", theme);
        await get().updateSettings({ theme });
      },
      applyTheme: () => {
        const theme = get().settings.theme;
        localStorage.setItem("potato-theme", theme);
        document.documentElement.classList.toggle("dark", shouldUseDark(theme));
      }
    }),
    {
      name: "potato-settings",
      partialize: (state) => ({ settings: state.settings })
    }
  )
);
