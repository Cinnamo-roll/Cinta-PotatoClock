import type { AppThemePalette } from "./themes";

function clamp(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;
  const number = Number.parseInt(value, 16);
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => clamp(value).toString(16).padStart(2, "0")).join("")}`;
}

export function mix(hex: string, target: string, amount: number) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount
  );
}

export function paletteFromPrimary(primary: string): AppThemePalette {
  return {
    bg: mix(primary, "#fff9f2", 0.9),
    bgSoft: mix(primary, "#ffffff", 0.86),
    card: "#fffdfb",
    cardSoft: mix(primary, "#fff7ed", 0.84),
    primary,
    primarySoft: mix(primary, "#ffffff", 0.82),
    primaryStrong: mix(primary, "#000000", 0.16),
    text: "#2F2F35",
    muted: "#8A8A93",
    border: mix(primary, "#ffffff", 0.74),
    success: "#22C55E",
    danger: "#EF4444"
  };
}
