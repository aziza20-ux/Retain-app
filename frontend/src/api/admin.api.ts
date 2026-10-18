import api from "./axios";
import type { Role } from "../types";

export interface CategoryInsight {
  categoryId: string;
  categoryName: string;
  expenseCount: number;
  totalSpent: string;
}

export interface RecentExpense {
  id: string;
  title: string;
  amount: string;
  date: string;
  createdAt: string;
  category: { id: string; name: string } | null;
  user: { id: string; name: string; email: string };
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface InsightsResponse {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: string;
  expensesThisMonth: number;
  spendingByCategory: CategoryInsight[];
  topCategories: CategoryInsight[];
  bottomCategories: CategoryInsight[];
  recentExpenses: RecentExpense[];
  recentUsers: RecentUser[];
}

export const adminApi = {
  insights: () => api.get<InsightsResponse>("/admin/insights"),
};
