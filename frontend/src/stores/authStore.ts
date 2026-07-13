/*
 * Copyright 2026 CintaOvO
 * Licensed under the Apache License, Version 2.0.
 * Original project: https://github.com/Cinnamo-roll/Cinta-PotatoClock
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/api/auth";
import type { ChangePasswordRequest, LoginRequest, LoginResponse, RegisterRequest, UpdateProfileRequest, User } from "@/types/auth";

interface AuthState {
  token?: string;
  user?: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateProfile: (payload: UpdateProfileRequest) => Promise<void>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
}

export class RegistrationCompletedError extends Error {
  constructor(cause?: unknown) {
    super("账号已创建，但自动登录失败，请直接登录");
    this.name = "RegistrationCompletedError";
    this.cause = cause;
  }
}

function tokenFrom(result: LoginResponse) {
  return result.accessToken;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: undefined,
      user: undefined,
      isAuthenticated: false,
      isLoading: false,
      login: async (payload) => {
        set({ token: undefined, user: undefined, isAuthenticated: false, isLoading: true });
        try {
          const result = await authApi.login(payload);
          set({ token: tokenFrom(result), user: result.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      register: async (payload) => {
        set({ token: undefined, user: undefined, isAuthenticated: false, isLoading: true });
        let accountCreated = false;
        try {
          await authApi.register(payload);
          accountCreated = true;
          const result = await authApi.login({ username: payload.username, password: payload.password });
          set({ token: tokenFrom(result), user: result.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          if (accountCreated) throw new RegistrationCompletedError(error);
          throw error;
        }
      },
      logout: () => {
        void authApi.logout();
        set({ token: undefined, user: undefined, isAuthenticated: false, isLoading: false });
      },
      fetchMe: async () => {
        const user = await authApi.me();
        set({ user, isAuthenticated: true });
      },
      updateProfile: async (payload) => {
        set({ isLoading: true });
        try {
          const user = await authApi.updateProfile(payload);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      changePassword: async (payload) => {
        set({ isLoading: true });
        try {
          await authApi.changePassword(payload);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: "potato-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
