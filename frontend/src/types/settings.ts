export type ThemeMode = "light" | "dark" | "system";

export interface UserSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreak: boolean;
  autoStartNextFocus: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: ThemeMode;
}
