import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cinoo.clock",
  appName: "土豆时钟ToDo",
  webDir: "dist",
  server: {
    androidScheme: "https"
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#F8F3E7",
      showSpinner: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#F8F3E7",
      overlaysWebView: true
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#D7AD4A"
    }
  }
};

export default config;
