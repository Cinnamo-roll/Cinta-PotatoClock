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
  accent: string;
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
    accent: "#74885E",
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
    accent: "#B78A38",
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
    accent: "#B78A38",
    text: "#29323D",
    muted: "#7F8A96",
    border: "#E2EDF8",
    success: "#22C55E",
    danger: "#EF4444"
  },
  cream: {
    bg: "#F8F3E7",
    bgSoft: "#EFE4CB",
    card: "#FFFCF5",
    cardSoft: "#F5EBD7",
    primary: "#D7AD4A",
    primarySoft: "#F3E1A7",
    primaryStrong: "#8A6328",
    accent: "#6F8655",
    text: "#342C20",
    muted: "#766A57",
    border: "#E2D2B2",
    success: "#5E8B57",
    danger: "#C65D4B"
  },
  lavender: {
    bg: "#FBF9FF",
    bgSoft: "#F3EEFF",
    card: "#FFFFFF",
    cardSoft: "#F5F0FF",
    primary: "#B7A2F3",
    primarySoft: "#F0EBFF",
    primaryStrong: "#9277DC",
    accent: "#74885E",
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
    accent: "#71865A",
    text: "#352F2A",
    muted: "#91867D",
    border: "#EFE5DC",
    success: "#22C55E",
    danger: "#EF4444"
  }
};

export const defaultThemeColor: ThemeColor = "cream";
export const defaultCustomColor = "#D7AD4A";
