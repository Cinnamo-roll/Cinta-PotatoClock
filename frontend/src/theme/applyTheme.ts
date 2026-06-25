import { defaultCustomColor, themePalettes, type ThemeColor, type ThemeMode } from "./themes";
import { mix, paletteFromPrimary } from "./themeUtils";

export function getThemePalette(themeColor: ThemeColor, customColor = defaultCustomColor) {
  return themeColor === "custom" ? paletteFromPrimary(customColor) : themePalettes[themeColor];
}

export function applyAppTheme(params: { themeColor: ThemeColor; themeMode: ThemeMode; customColor?: string }) {
  const palette = getThemePalette(params.themeColor, params.customColor);
  const root = document.documentElement;

  root.style.setProperty("--app-bg", palette.bg);
  root.style.setProperty("--app-bg-soft", palette.bgSoft);
  root.style.setProperty("--app-card", palette.card);
  root.style.setProperty("--app-card-soft", palette.cardSoft);
  root.style.setProperty("--app-primary", palette.primary);
  root.style.setProperty("--app-primary-soft", palette.primarySoft);
  root.style.setProperty("--app-primary-strong", palette.primaryStrong);
  root.style.setProperty("--app-text", palette.text);
  root.style.setProperty("--app-muted", palette.muted);
  root.style.setProperty("--app-border", palette.border);
  root.style.setProperty("--app-success", palette.success);
  root.style.setProperty("--app-danger", palette.danger);
  root.style.setProperty("--app-chart-1", palette.primaryStrong);
  root.style.setProperty("--app-chart-2", palette.primary);
  root.style.setProperty("--app-chart-3", mix(palette.primary, "#ffffff", 0.32));
  root.style.setProperty("--app-chart-4", mix(palette.primary, "#ffffff", 0.55));
  root.style.setProperty("--app-chart-5", mix(palette.primary, "#ffffff", 0.75));

  root.classList.remove("dark");
}
