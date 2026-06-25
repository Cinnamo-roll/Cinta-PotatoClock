import { Preferences } from "@capacitor/preferences";
import { isNativeApp } from "@/lib/capacitor";

export const storageService = {
  async get(key: string): Promise<string | null> {
    if (isNativeApp) {
      const result = await Preferences.get({ key });
      return result.value;
    }
    return localStorage.getItem(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (isNativeApp) {
      await Preferences.set({ key, value });
      return;
    }
    localStorage.setItem(key, value);
  },
  async remove(key: string): Promise<void> {
    if (isNativeApp) {
      await Preferences.remove({ key });
      return;
    }
    localStorage.removeItem(key);
  }
};
