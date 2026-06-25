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

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 12_000
});

http.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      localStorage.removeItem("potato-auth");
      window.location.assign("/login");
    }
    return Promise.reject(new Error(friendlyError(error.response?.data?.message ?? error.message)));
  }
);
