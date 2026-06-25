export type ThemeColor = "rose" | "mint" | "sky" | "cream" | "lavender" | "mocha" | "custom";
export type ThemeMode = "light" | "dark" | "system";

export interface AppThemePalette {
  bg: string;
  bgSoft: string;
  card: string;
  cardSoft: string;
  primary: string;
  primarySoft: string;
  primaryStrong: string;
  text: string;
  muted: string;
  border: string;
  success: string;
  danger: string;
}

export const themePalettes: Record<Exclude<ThemeColor, "custom">, AppThemePalette> = {
  rose: {
    bg: "#FFF8F2",
    bgSoft: "#FBE8EC",
    card: "#FFFDFC",
    cardSoft: "#FFF0EA",
    primary: "#F28AA8",
    primarySoft: "#FFE3E8",
    primaryStrong: "#D85C86",
    text: "#2E2830",
    muted: "#8A7C80",
    border: "#EFD9D4",
    success: "#22C55E",
    danger: "#EF4444"
  },
  mint: {
    bg: "#F7FCF9",
    bgSoft: "#EEF9F3",
    card: "#FFFFFF",
    cardSoft: "#F2FBF6",
    primary: "#83CFAE",
    primarySoft: "#EAF8F1",
    primaryStrong: "#4EAF86",
    text: "#283431",
    muted: "#7F8E89",
    border: "#E4F0EA",
    success: "#22C55E",
    danger: "#EF4444"
  },
  sky: {
    bg: "#F7FBFF",
    bgSoft: "#EEF7FF",
    card: "#FFFFFF",
    cardSoft: "#F2F8FF",
    primary: "#8DBEF2",
    primarySoft: "#EAF4FF",
    primaryStrong: "#5A9DE4",
    text: "#29323D",
    muted: "#7F8A96",
    border: "#E2EDF8",
    success: "#22C55E",
    danger: "#EF4444"
  },
  cream: {
    bg: "#FFFDF7",
    bgSoft: "#FFF8E6",
    card: "#FFFFFF",
    cardSoft: "#FFF9EA",
    primary: "#E8C66D",
    primarySoft: "#FFF6D9",
    primaryStrong: "#CDA646",
    text: "#353229",
    muted: "#918B7C",
    border: "#F1E9D3",
    success: "#22C55E",
    danger: "#EF4444"
  },
  lavender: {
    bg: "#FBF9FF",
    bgSoft: "#F3EEFF",
    card: "#FFFFFF",
    cardSoft: "#F5F0FF",
    primary: "#B7A2F3",
    primarySoft: "#F0EBFF",
    primaryStrong: "#9277DC",
    text: "#302D3A",
    muted: "#8A8497",
    border: "#EAE4F6",
    success: "#22C55E",
    danger: "#EF4444"
  },
  mocha: {
    bg: "#FCFAF7",
    bgSoft: "#F7EFE9",
    card: "#FFFFFF",
    cardSoft: "#F8F1EC",
    primary: "#C9A27E",
    primarySoft: "#F6EEE7",
    primaryStrong: "#A77C5A",
    text: "#352F2A",
    muted: "#91867D",
    border: "#EFE5DC",
    success: "#22C55E",
    danger: "#EF4444"
  }
};

export const defaultThemeColor: ThemeColor = "rose";
export const defaultCustomColor = "#F58CB2";
