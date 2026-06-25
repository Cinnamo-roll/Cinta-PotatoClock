import { create } from "zustand";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "success" | "error";
  durationMs?: number;
}

interface UiState {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  toast: (item) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...item, id }] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    }, item.durationMs ?? 3200);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
