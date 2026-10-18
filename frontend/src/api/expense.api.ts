import api from "./axios";
import type { Expense } from "../types";

export interface ExpenseListResponse {
  expenses: Expense[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ExpenseResponse {
  expense: Expense;
}

export interface CategorySummaryItem {
  categoryId: string;
  categoryName: string;
  totalSpent: string;
  expenseCount: number;
}

export interface CategorySummaryResponse {
  summary: CategorySummaryItem[];
}

export interface ExpenseQuery {
  categoryId?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ExpensePayload {
  title: string;
  amount: number;
  date: string;
  paymentMethod: string;
  categoryId: string;
  notes?: string;
}

export const expenseApi = {
  list: (params?: ExpenseQuery) =>
    api.get<ExpenseListResponse>("/expenses", { params }),

  getById: (id: string) => api.get<ExpenseResponse>(`/expenses/${id}`),

  create: (data: ExpensePayload) =>
    api.post<ExpenseResponse>("/expenses", data),

  update: (id: string, data: Partial<ExpensePayload>) =>
    api.patch<ExpenseResponse>(`/expenses/${id}`, data),

  remove: (id: string) => api.delete(`/expenses/${id}`),

  // GET /api/expenses/summary — user's spending grouped by category
  // Pass month as ISO string to restrict to a single calendar month.
  categorySummary: (month?: string) =>
    api.get<CategorySummaryResponse>("/expenses/summary", {
      params: month ? { month } : undefined,
    }),
};
