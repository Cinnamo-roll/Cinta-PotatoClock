export const appTarget = (import.meta.env.VITE_APP_TARGET || "app") as "app" | "landing";
export const isLandingTarget = appTarget === "landing";
export const isAppTarget = appTarget === "app";

export const downloadLinks = {
  androidApk: import.meta.env.VITE_ANDROID_APK_URL || "/downloads/tudou-clock.apk",
  iosIpa: import.meta.env.VITE_IOS_IPA_URL || "/downloads/tudou-clock.ipa",
  testFlight: import.meta.env.VITE_TESTFLIGHT_URL || "",
  appStore: import.meta.env.VITE_APP_STORE_URL || ""
};
