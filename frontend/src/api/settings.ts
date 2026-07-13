import { http, shouldUsePreviewApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { UserSettings } from "@/types/settings";

export const settingsApi = {
  getSettings: () => (shouldUsePreviewApi() ? mockClient.getSettings() : http.get<never, UserSettings>("/settings")),
  updateSettings: (payload: Partial<UserSettings>) =>
    shouldUsePreviewApi() ? mockClient.updateSettings(payload) : http.put<never, UserSettings>("/settings", payload)
};
