export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'OTHER';
export type BudgetStatus = 'WITHIN' | 'APPROACHING' | 'OVER';

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
  month: string;
  userId: string;
  totalSpent: number;
}

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Uncategorized',       description: 'Default fallback category' },
  { id: 'cat-2', name: 'Food & Dining',        description: 'Restaurants, groceries, and food delivery' },
  { id: 'cat-3', name: 'Transport',            description: 'Fuel, public transport, and ride-hailing' },
  { id: 'cat-4', name: 'Housing',              description: 'Rent, utilities, and home maintenance' },
  { id: 'cat-5', name: 'Healthcare',           description: 'Medical bills, pharmacy, and insurance' },
  { id: 'cat-6', name: 'Entertainment',        description: 'Streaming, events, and hobbies' },
  { id: 'cat-7', name: 'Shopping',             description: 'Clothing, electronics, and general shopping' },
  { id: 'cat-8', name: 'Education',            description: 'Tuition, books, and online courses' },
  { id: 'cat-9', name: 'Savings & Investments',description: 'Savings deposits and investment contributions' },
];

export const mockExpenses: Expense[] = [
  { id: 'exp-1',  title: 'Monthly Rent',         amount: 850.00, date: '2025-07-01T08:00:00.000Z', paymentMethod: 'BANK_TRANSFER', categoryId: 'cat-4', userId: 'user-1', createdAt: '2025-07-01T08:00:00.000Z' },
  { id: 'exp-2',  title: 'Grocery Shopping',      amount: 92.50,  date: '2025-07-02T10:30:00.000Z', paymentMethod: 'CARD',          categoryId: 'cat-2', userId: 'user-1', createdAt: '2025-07-02T10:30:00.000Z', notes: 'Weekly groceries from supermarket' },
  { id: 'exp-3',  title: 'Uber Ride',             amount: 14.00,  date: '2025-07-03T18:45:00.000Z', paymentMethod: 'MOBILE_MONEY',  categoryId: 'cat-3', userId: 'user-1', createdAt: '2025-07-03T18:45:00.000Z' },
  { id: 'exp-4',  title: 'Netflix Subscription',  amount: 15.99,  date: '2025-07-04T00:00:00.000Z', paymentMethod: 'CARD',          categoryId: 'cat-6', userId: 'user-1', createdAt: '2025-07-04T00:00:00.000Z' },
  { id: 'exp-5',  title: 'Doctor Visit',          amount: 60.00,  date: '2025-07-05T09:00:00.000Z', paymentMethod: 'CASH',          categoryId: 'cat-5', userId: 'user-1', createdAt: '2025-07-05T09:00:00.000Z', notes: 'General checkup' },
  { id: 'exp-6',  title: 'Online Course',         amount: 49.99,  date: '2025-07-06T14:00:00.000Z', paymentMethod: 'CARD',          categoryId: 'cat-8', userId: 'user-1', createdAt: '2025-07-06T14:00:00.000Z', notes: 'React advanced course' },
  { id: 'exp-7',  title: 'Restaurant Dinner',     amount: 38.00,  date: '2025-07-07T20:00:00.000Z', paymentMethod: 'CARD',          categoryId: 'cat-2', userId: 'user-1', createdAt: '2025-07-07T20:00:00.000Z' },
  { id: 'exp-8',  title: 'Bus Pass',              amount: 30.00,  date: '2025-07-08T07:30:00.000Z', paymentMethod: 'CASH',          categoryId: 'cat-3', userId: 'user-1', createdAt: '2025-07-08T07:30:00.000Z' },
  { id: 'exp-9',  title: 'New Sneakers',          amount: 110.00, date: '2025-07-09T15:00:00.000Z', paymentMethod: 'CARD',          categoryId: 'cat-7', userId: 'user-1', createdAt: '2025-07-09T15:00:00.000Z' },
  { id: 'exp-10', title: 'Electricity Bill',      amount: 75.00,  date: '2025-07-10T11:00:00.000Z', paymentMethod: 'BANK_TRANSFER', categoryId: 'cat-4', userId: 'user-1', createdAt: '2025-07-10T11:00:00.000Z' },
  { id: 'exp-11', title: 'Coffee Shop',           amount: 8.50,   date: '2025-07-11T08:15:00.000Z', paymentMethod: 'CASH',          categoryId: 'cat-2', userId: 'user-1', createdAt: '2025-07-11T08:15:00.000Z' },
  { id: 'exp-12', title: 'Gym Membership',        amount: 40.00,  date: '2025-07-12T06:00:00.000Z', paymentMethod: 'CARD',          categoryId: 'cat-6', userId: 'user-1', createdAt: '2025-07-12T06:00:00.000Z' },
  { id: 'exp-13', title: 'Pharmacy',              amount: 22.00,  date: '2025-07-13T16:30:00.000Z', paymentMethod: 'CASH',          categoryId: 'cat-5', userId: 'user-1', createdAt: '2025-07-13T16:30:00.000Z' },
  { id: 'exp-14', title: 'Savings Deposit',       amount: 200.00, date: '2025-07-14T09:00:00.000Z', paymentMethod: 'BANK_TRANSFER', categoryId: 'cat-9', userId: 'user-1', createdAt: '2025-07-14T09:00:00.000Z' },
  { id: 'exp-15', title: 'Takeaway Lunch',        amount: 12.00,  date: '2025-07-15T13:00:00.000Z', paymentMethod: 'MOBILE_MONEY',  categoryId: 'cat-2', userId: 'user-1', createdAt: '2025-07-15T13:00:00.000Z' },
];

export const mockBudgets: Budget[] = [
  { id: 'bud-1', amount: 1000.00, month: '2025-07-01T00:00:00.000Z', userId: 'user-1', totalSpent: 925.00  }, // APPROACHING
  { id: 'bud-2', amount: 300.00,  month: '2025-06-01T00:00:00.000Z', userId: 'user-1', totalSpent: 145.00  }, // WITHIN
  { id: 'bud-3', amount: 200.00,  month: '2025-05-01T00:00:00.000Z', userId: 'user-1', totalSpent: 230.00  }, // OVER
];

export const mockUser = {
  id: 'user-1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: 'USER' as const,
};

// Derived dashboard summary from mock data
export const mockSummary = {
  currentBalance: 3240.50,
  monthlyIncome: 4500.00,
  monthlyExpenses: mockExpenses.reduce((sum, e) => sum + e.amount, 0),
};
