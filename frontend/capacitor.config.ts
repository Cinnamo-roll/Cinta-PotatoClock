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
      launchShowDuration: 1200,
      backgroundColor: "#FDECF2",
      showSpinner: false
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#FDECF2"
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#F6AFC3"
    }
  }
};

export default config;
