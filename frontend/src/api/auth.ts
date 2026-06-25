import { http, useMockApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { ChangePasswordRequest, LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest, User } from "@/types/auth";

export const authApi = {
  login: (payload: LoginRequest) =>
    useMockApi ? mockClient.login(payload) : http.post<never, LoginResponse>("/auth/login", payload),
  register: (payload: RegisterRequest) =>
    useMockApi ? mockClient.register(payload) : http.post<never, User>("/auth/register", payload),
  logout: () => (useMockApi ? mockClient.logout() : http.post<never, void>("/auth/logout")),
  me: () => (useMockApi ? mockClient.me() : http.get<never, User>("/auth/me")),
  updateProfile: (payload: UpdateProfileRequest) =>
    useMockApi ? mockClient.updateProfile(payload) : http.put<never, User>("/users/me", payload),
  changePassword: (payload: ChangePasswordRequest) =>
    useMockApi ? mockClient.changePassword(payload) : http.put<never, void>("/auth/password", payload)
};
