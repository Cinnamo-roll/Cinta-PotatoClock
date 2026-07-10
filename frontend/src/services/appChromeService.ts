import { registerPlugin } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNativeApp, isPluginAvailable } from "@/lib/capacitor";

interface SafeAreaInsets {
  top: number;
  bottom: number;
}

interface SafeAreaPlugin {
  getInsets(): Promise<SafeAreaInsets>;
}

const SafeArea = registerPlugin<SafeAreaPlugin>("SafeArea");

function isTextEntry(element: Element | null) {
  if (element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLInputElement) {
    return !["button", "checkbox", "color", "file", "radio", "range", "reset", "submit"].includes(element.type);
  }
  return element?.getAttribute("contenteditable") === "true";
}

async function applyViewportMetrics() {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  root.style.setProperty("--visual-viewport-height", `${viewport?.height ?? window.innerHeight}px`);
  root.style.setProperty("--visual-viewport-offset-top", `${viewport?.offsetTop ?? 0}px`);

  if (isNativeApp && isPluginAvailable("SafeArea")) {
    try {
      const insets = await SafeArea.getInsets();
      root.style.setProperty("--native-safe-top", `${Math.max(0, insets.top)}px`);
      root.style.setProperty("--native-safe-bottom", `${Math.max(0, insets.bottom)}px`);
    } catch {
      // CSS env() remains the fallback when native insets are unavailable.
    }
  }
}

export async function setupAppChrome(): Promise<() => void> {
  if (isNativeApp) {
    await Promise.allSettled([
      StatusBar.setOverlaysWebView({ overlay: false }),
      StatusBar.setBackgroundColor({ color: "#FDECF2" }),
      StatusBar.setStyle({ style: Style.Light })
    ]);
  }

  const refresh = () => void applyViewportMetrics();
  const handleFocusIn = (event: FocusEvent) => {
    if (isTextEntry(event.target as Element | null)) document.body.classList.add("keyboard-open");
    window.setTimeout(refresh, 50);
  };
  const handleFocusOut = () => {
    window.setTimeout(() => {
      if (!isTextEntry(document.activeElement)) document.body.classList.remove("keyboard-open");
      refresh();
    }, 80);
  };

  await applyViewportMetrics();
  if (isNativeApp) await SplashScreen.hide().catch(() => undefined);
  window.visualViewport?.addEventListener("resize", refresh);
  window.visualViewport?.addEventListener("scroll", refresh);
  window.addEventListener("orientationchange", refresh);
  document.addEventListener("focusin", handleFocusIn);
  document.addEventListener("focusout", handleFocusOut);

  return () => {
    window.visualViewport?.removeEventListener("resize", refresh);
    window.visualViewport?.removeEventListener("scroll", refresh);
    window.removeEventListener("orientationchange", refresh);
    document.removeEventListener("focusin", handleFocusIn);
    document.removeEventListener("focusout", handleFocusOut);
    document.body.classList.remove("keyboard-open");
  };
}
