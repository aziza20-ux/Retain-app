import api from "./axios";

export interface BudgetCalc {
  id: string;
  amount: string; // serialized Decimal from backend
  month: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  totalSpent: string; // serialized Decimal from backend
  remaining: string; // serialized Decimal from backend
  status: "WITHIN" | "APPROACHING" | "OVER";
}

export interface BudgetListResponse {
  budgets: BudgetCalc[];
}
export interface BudgetSingleResponse {
  budget: BudgetCalc;
}

export const budgetApi = {
  list: () => api.get<BudgetListResponse>("/budgets"),

  getByMonth: (month: string) =>
    api.get<BudgetSingleResponse>("/budgets/month", { params: { month } }),

  create: (amount: number, month: string) =>
    api.post<BudgetSingleResponse>("/budgets", { amount, month }),

  update: (id: string, amount: number) =>
    api.patch<BudgetSingleResponse>(`/budgets/${id}`, { amount }),

  remove: (id: string) => api.delete(`/budgets/${id}`),
};
