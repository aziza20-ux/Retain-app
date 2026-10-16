export type Role = 'USER' | 'ADMIN';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'OTHER';
export type BudgetStatus = 'WITHIN' | 'APPROACHING' | 'OVER';
export type SortField = 'date' | 'amount';
export type SortDir = 'asc' | 'desc';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt?: string;
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
  category?: Category;
}

export interface Budget {
  id: string;
  amount: number;
  month: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Backend returns totalSpent and remaining as serialized Decimal strings.
// The frontend converts them to numbers where needed.
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
