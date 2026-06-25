import { Capacitor } from "@capacitor/core";

export const isNativeApp = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

export function isPluginAvailable(pluginName: string) {
  return Capacitor.isPluginAvailable(pluginName);
}
