import { http, useMockApi } from "./http";
import { mockClient } from "@/mocks/mockClient";
import type { TodoCollection, TodoCollectionInput } from "@/types/todo";

export const collectionsApi = {
  list: () => (useMockApi ? mockClient.getCollections() : http.get<never, TodoCollection[]>("/collections")),
  create: (payload: TodoCollectionInput) =>
    useMockApi ? mockClient.createCollection(payload) : http.post<never, TodoCollection>("/collections", payload),
  update: (id: number, payload: Partial<TodoCollectionInput>) =>
    useMockApi ? mockClient.updateCollection(id, payload) : http.put<never, TodoCollection>(`/collections/${id}`, payload),
  remove: (id: number) => (useMockApi ? mockClient.deleteCollection(id) : http.delete<never, void>(`/collections/${id}`)),
  tasks: (id: number) => (useMockApi ? mockClient.getTodos().then((todos) => todos.filter((todo) => todo.collectionId === id)) : http.get<never, unknown[]>(`/collections/${id}/tasks`))
};
