import { create } from "zustand";
import type { TodoItem } from "@/types/todo";

interface TodoStoreState {
  activeTodo?: TodoItem;
  setActiveTodo: (todo?: TodoItem) => void;
}

export const useTodoStore = create<TodoStoreState>((set) => ({
  activeTodo: undefined,
  setActiveTodo: (todo) => set({ activeTodo: todo })
}));
