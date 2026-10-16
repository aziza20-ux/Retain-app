export type Role = 'USER' | 'ADMIN';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'OTHER';
export type BudgetStatus = 'WITHIN' | 'APPROACHING' | 'OVER';
export type SortField = 'date' | 'amount';
export type SortDir = 'asc' | 'desc';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // stored as plain text for mock only
  role: Role;
  createdAt: string; // ISO timestamp of registration
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  userId: string;
  categoryId: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  amount: number;
  month: string; // ISO first-of-month string e.g. "2025-07-01T00:00:00.000Z"
  userId: string;
}

export interface BudgetWithCalc extends Budget {
  totalSpent: number;
  remaining: number;
  utilisation: number;
  status: BudgetStatus;
}

export interface ExpenseFilterState {
  search: string;
  categoryId: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  sortField: SortField;
  sortDir: SortDir;
}
