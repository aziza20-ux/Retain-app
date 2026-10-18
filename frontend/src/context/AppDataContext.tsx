import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Expense, BudgetWithCalc, Category } from "../types";
import { expenseApi, type ExpensePayload } from "../api/expense.api";
import { budgetApi, type BudgetCalc } from "../api/budget.api";
import { categoryApi } from "../api/category.api";
import { getErrorMessage } from "../api/axios";
import { getBudgetStatus } from "../utils/budgetUtils";
import { useAuth } from "./AuthContext";

// Convert the backend BudgetCalc (string Decimals) to the frontend BudgetWithCalc (numbers).
function toFrontendBudget(b: BudgetCalc): BudgetWithCalc {
  const amount = Number(b.amount);
  const totalSpent = parseFloat(b.totalSpent);
  const remaining = parseFloat(b.remaining);
  const utilisation = amount > 0 ? (totalSpent / amount) * 100 : 0;
  return {
    id: b.id,
    amount,
    month: b.month,
    userId: b.userId,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    totalSpent,
    remaining,
    utilisation,
    status: getBudgetStatus(utilisation),
  };
}

interface AppDataContextValue {
  expenses: Expense[];
  budgets: BudgetWithCalc[];
  categories: Category[];
  loading: boolean;
  error: string | null;

  // Expenses
  addExpense: (data: ExpensePayload) => Promise<void>;
  updateExpense: (id: string, data: Partial<ExpensePayload>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refreshExpenses: () => Promise<void>;
  refreshBudgets: () => Promise<void>;

  // Budgets
  addBudget: (amount: number, month: string) => Promise<void>;
  updateBudget: (id: string, amount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Categories
  addCategory: (name: string, description?: string) => Promise<void>;
  updateCategory: (
    id: string,
    data: { name?: string; description?: string },
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<BudgetWithCalc[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Initial data load ──────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, budRes, catRes] = await Promise.all([
        expenseApi.list({ limit: 100 }),
        budgetApi.list(),
        categoryApi.list(),
      ]);
      setExpenses(
        expRes.data.expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
      );
      setBudgets(budRes.data.budgets.map(toFrontendBudget));
      setCategories(catRes.data.categories);
    } catch (err) {
      // Load categories independently so a user-scoped failure (expenses/budgets)
      // never leaves the category list empty.
      try {
        const catRes = await categoryApi.list();
        setCategories(catRes.data.categories);
      } catch {
        /* ignore secondary failure */
      }
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) loadAll();
    if (!authLoading && !isAuthenticated) {
      setExpenses([]);
      setBudgets([]);
      setCategories([]);
    }
  }, [isAuthenticated, authLoading, loadAll]);

  // ── Expenses ───────────────────────────────────────────────────────────────
  const refreshExpenses = useCallback(async () => {
    const res = await expenseApi.list({ limit: 100 });
    setExpenses(
      res.data.expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
    );
  }, []);

  const refreshBudgets = useCallback(async () => {
    const res = await budgetApi.list();
    setBudgets(res.data.budgets.map(toFrontendBudget));
  }, []);

  const addExpense = async (data: ExpensePayload) => {
    const res = await expenseApi.create(data);
    const expense = {
      ...res.data.expense,
      amount: Number(res.data.expense.amount),
    };
    setExpenses((prev) => [expense, ...prev]);
    await refreshBudgets();
  };

  const updateExpense = async (id: string, data: Partial<ExpensePayload>) => {
    const res = await expenseApi.update(id, data);
    const expense = {
      ...res.data.expense,
      amount: Number(res.data.expense.amount),
    };
    setExpenses((prev) => prev.map((e) => (e.id === id ? expense : e)));
    await refreshBudgets();
  };

  const deleteExpense = async (id: string) => {
    await expenseApi.remove(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await refreshBudgets();
  };

  // ── Budgets ────────────────────────────────────────────────────────────────
  const addBudget = async (amount: number, month: string) => {
    const res = await budgetApi.create(amount, month);
    setBudgets((prev) => [toFrontendBudget(res.data.budget), ...prev]);
  };

  const updateBudget = async (id: string, amount: number) => {
    const res = await budgetApi.update(id, amount);
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? toFrontendBudget(res.data.budget) : b)),
    );
  };

  const deleteBudget = async (id: string) => {
    await budgetApi.remove(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // ── Categories ─────────────────────────────────────────────────────────────
  const addCategory = async (name: string, description?: string) => {
    const res = await categoryApi.create(name, description);
    setCategories((prev) => [...prev, res.data.category]);
  };

  const updateCategory = async (
    id: string,
    data: { name?: string; description?: string },
  ) => {
    const res = await categoryApi.update(id, data);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? res.data.category : c)),
    );
  };

  const deleteCategory = async (id: string) => {
    await categoryApi.remove(id);
    // Backend reassigns expenses to Uncategorized — refresh expenses to reflect that.
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await refreshExpenses();
  };

  return (
    <AppDataContext.Provider
      value={{
        expenses,
        budgets,
        categories,
        loading,
        error,
        addExpense,
        updateExpense,
        deleteExpense,
        refreshExpenses,
        refreshBudgets,
        addBudget,
        updateBudget,
        deleteBudget,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used inside AppDataProvider");
  return ctx;
}
