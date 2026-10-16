import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Expense, Budget, Category } from '../types';
import { mockExpenses, mockBudgets, mockCategories, UNCATEGORIZED_ID } from '../data/mockData';

interface AppDataContextValue {
  expenses: Expense[];
  addExpense: (e: Expense) => void;
  updateExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;

  budgets: Budget[];
  addBudget: (b: Budget) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;

  categories: Category[];
  addCategory: (c: Category) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void; // reassigns expenses to Uncategorized
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [expenses,   setExpenses]   = useState<Expense[]>(mockExpenses);
  const [budgets,    setBudgets]    = useState<Budget[]>(mockBudgets);
  const [categories, setCategories] = useState<Category[]>(mockCategories);

  // ── Expenses ──────────────────────────────────────────────────────────────
  const addExpense    = (e: Expense)  => setExpenses(prev => [e, ...prev]);
  const updateExpense = (e: Expense)  => setExpenses(prev => prev.map(x => x.id === e.id ? e : x));
  const deleteExpense = (id: string)  => setExpenses(prev => prev.filter(x => x.id !== id));

  // ── Budgets ───────────────────────────────────────────────────────────────
  const addBudget    = (b: Budget)  => setBudgets(prev => [b, ...prev]);
  const updateBudget = (b: Budget)  => setBudgets(prev => prev.map(x => x.id === b.id ? b : x));
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(x => x.id !== id));

  // ── Categories ────────────────────────────────────────────────────────────
  const addCategory    = (c: Category)  => setCategories(prev => [...prev, c]);
  const updateCategory = (c: Category)  => setCategories(prev => prev.map(x => x.id === c.id ? c : x));
  const deleteCategory = (id: string) => {
    // Reassign all expenses that reference the deleted category to Uncategorized
    setExpenses(prev =>
      prev.map(e => e.categoryId === id ? { ...e, categoryId: UNCATEGORIZED_ID } : e),
    );
    setCategories(prev => prev.filter(x => x.id !== id));
  };

  return (
    <AppDataContext.Provider value={{
      expenses, addExpense, updateExpense, deleteExpense,
      budgets,  addBudget,  updateBudget,  deleteBudget,
      categories, addCategory, updateCategory, deleteCategory,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
