import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNativeApp } from "@/lib/capacitor";

export async function setupAppChrome() {
  if (!isNativeApp) return;
  try {
    await StatusBar.setBackgroundColor({ color: "#FDECF2" });
    await StatusBar.setStyle({ style: Style.Light });
    await SplashScreen.hide();
  } catch {
    // Native chrome is optional in web preview.
  }
}
