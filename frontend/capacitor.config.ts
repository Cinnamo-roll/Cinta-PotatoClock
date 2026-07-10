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
      backgroundColor: "#FDECF2",
      showSpinner: false
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#FDECF2",
      overlaysWebView: false
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#F6AFC3"
    }
  }
};

export default config;
