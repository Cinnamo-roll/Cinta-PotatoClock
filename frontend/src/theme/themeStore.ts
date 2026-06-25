import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyAppTheme } from "./applyTheme";
import { defaultCustomColor, defaultThemeColor, type ThemeColor, type ThemeMode } from "./themes";
import { storageService } from "@/services/storageService";

interface ThemeState {
  themeColor: ThemeColor;
  themeMode: ThemeMode;
  customColor: string;
  draftThemeColor: ThemeColor;
  draftCustomColor: string;
  previewTheme: (themeColor: ThemeColor, customColor?: string) => void;
  saveTheme: () => Promise<void>;
  restoreDraft: () => void;
  resetTheme: () => Promise<void>;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeColor: defaultThemeColor,
      themeMode: "system",
      customColor: defaultCustomColor,
      draftThemeColor: defaultThemeColor,
      draftCustomColor: defaultCustomColor,
      previewTheme: (themeColor, customColor) => {
        const nextCustom = customColor ?? get().draftCustomColor;
        set({ draftThemeColor: themeColor, draftCustomColor: nextCustom });
        applyAppTheme({ themeColor, themeMode: get().themeMode, customColor: nextCustom });
      },
      saveTheme: async () => {
        const { draftThemeColor, draftCustomColor, themeMode } = get();
        set({ themeColor: draftThemeColor, customColor: draftCustomColor });
        applyAppTheme({ themeColor: draftThemeColor, themeMode, customColor: draftCustomColor });
        await storageService.set("appTheme", JSON.stringify({ themeColor: draftThemeColor, customColor: draftCustomColor, themeMode }));
      },
      restoreDraft: () => {
        const { themeColor, customColor, themeMode } = get();
        set({ draftThemeColor: themeColor, draftCustomColor: customColor });
        applyAppTheme({ themeColor, themeMode, customColor });
      },
      resetTheme: async () => {
        set({
          themeColor: defaultThemeColor,
          customColor: defaultCustomColor,
          draftThemeColor: defaultThemeColor,
          draftCustomColor: defaultCustomColor
        });
        applyAppTheme({ themeColor: defaultThemeColor, themeMode: get().themeMode, customColor: defaultCustomColor });
        await storageService.set("appTheme", JSON.stringify({ themeColor: defaultThemeColor, customColor: defaultCustomColor, themeMode: get().themeMode }));
      },
      applyTheme: () => {
        const { themeColor, customColor, themeMode } = get();
        applyAppTheme({ themeColor, themeMode, customColor });
      }
    }),
    {
      name: "app-theme",
      partialize: (state) => ({
        themeColor: state.themeColor,
        themeMode: state.themeMode,
        customColor: state.customColor,
        draftThemeColor: state.draftThemeColor,
        draftCustomColor: state.draftCustomColor
      })
    }
  )
);
