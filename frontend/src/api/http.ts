import axios from "axios";
import type { ApiResponse } from "@/types/api";
import { friendlyError } from "@/utils/format";

export const useMockApi = import.meta.env.VITE_USE_MOCK === "true" || (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== "false");

function readStoredToken() {
  const rawAuth = localStorage.getItem("potato-auth");
  if (!rawAuth) return undefined;

  try {
    return JSON.parse(rawAuth)?.state?.token as string | undefined;
  } catch {
    localStorage.removeItem("potato-auth");
    return undefined;
  }
}

export function shouldUsePreviewApi() {
  return useMockApi || !readStoredToken();
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 12_000
});

http.interceptors.request.use((config) => {
  const token = readStoredToken();
  const requestUrl = String(config.url ?? "");
  const isPublicAuthRequest = /\/auth\/(login|register)$/.test(requestUrl);
  if (token && !isPublicAuthRequest) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse<unknown>;
    if (typeof payload?.code === "number" && payload.code !== 0) {
      return Promise.reject(new Error(friendlyError(payload.message)));
    }
    return payload?.data ?? response.data;
  },
  (error) => {
    const requestUrl = String(error.config?.url ?? "");
    const isAuthAttempt = /\/auth\/(login|register)$/.test(requestUrl);
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem("potato-auth");
      if (window.location.pathname !== "/login") window.location.assign("/login");
    }
    const message =
      error.response?.status >= 500
        ? "服务暂时不可用，请稍后重试"
        : error.response?.data?.message ?? error.message;
    return Promise.reject(new Error(friendlyError(message)));
  }
);
