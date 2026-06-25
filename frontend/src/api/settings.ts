import { http, useMockApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { UserSettings } from "@/types/settings";

export const settingsApi = {
  getSettings: () => (useMockApi ? mockClient.getSettings() : http.get<never, UserSettings>("/settings")),
  updateSettings: (payload: Partial<UserSettings>) =>
    useMockApi ? mockClient.updateSettings(payload) : http.put<never, UserSettings>("/settings", payload)
};
