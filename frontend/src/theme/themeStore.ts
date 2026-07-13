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
  hasUserSelectedColor: boolean;
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
      hasUserSelectedColor: false,
      previewTheme: (themeColor, customColor) => {
        const nextCustom = customColor ?? get().draftCustomColor;
        set({ draftThemeColor: themeColor, draftCustomColor: nextCustom });
        applyAppTheme({ themeColor, themeMode: get().themeMode, customColor: nextCustom });
      },
      saveTheme: async () => {
        const { draftThemeColor, draftCustomColor, themeMode } = get();
        set({ themeColor: draftThemeColor, customColor: draftCustomColor, hasUserSelectedColor: true });
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
          draftCustomColor: defaultCustomColor,
          hasUserSelectedColor: false
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
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<ThemeState>;
        if (version < 2) {
          const isHistoricalRoseDefault = (!state.themeColor || state.themeColor === "rose")
            && (!state.customColor || state.customColor.toUpperCase() === "#F58CB2");
          if (!isHistoricalRoseDefault) {
            const selectedColor = state.themeColor ?? defaultThemeColor;
            const selectedCustomColor = state.customColor ?? defaultCustomColor;
            return {
              ...state,
              themeColor: selectedColor,
              customColor: selectedCustomColor,
              draftThemeColor: selectedColor,
              draftCustomColor: selectedCustomColor,
              hasUserSelectedColor: true
            } as ThemeState;
          }
        }
        if (!state.hasUserSelectedColor) {
          return {
            ...state,
            themeColor: defaultThemeColor,
            customColor: defaultCustomColor,
            draftThemeColor: defaultThemeColor,
            draftCustomColor: defaultCustomColor,
            hasUserSelectedColor: false
          } as ThemeState;
        }
        return state as ThemeState;
      },
      partialize: (state) => ({
        themeColor: state.themeColor,
        themeMode: state.themeMode,
        customColor: state.customColor,
        draftThemeColor: state.draftThemeColor,
        draftCustomColor: state.draftCustomColor,
        hasUserSelectedColor: state.hasUserSelectedColor
      })
    }
  )
);
