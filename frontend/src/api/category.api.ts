import api from "./axios";
import type { Category } from "../types";

export interface CategoryListResponse {
  categories: Category[];
}
export interface CategorySingleResponse {
  category: Category;
}

export const categoryApi = {
  list: () => api.get<CategoryListResponse>("/categories"),

  create: (name: string, description?: string) =>
    api.post<CategorySingleResponse>("/categories", { name, description }),

  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch<CategorySingleResponse>(`/categories/${id}`, data),

  remove: (id: string) => api.delete(`/categories/${id}`),
};
