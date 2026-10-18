import type { Expense, Budget, BudgetWithCalc, BudgetStatus } from "../types";

export function expenseInMonth(expense: Expense, monthIso: string): boolean {
  const d = new Date(expense.date);
  const m = new Date(monthIso);
  return (
    d.getUTCFullYear() === m.getUTCFullYear() &&
    d.getUTCMonth() === m.getUTCMonth()
  );
}

export function getBudgetStatus(utilisation: number): BudgetStatus {
  if (utilisation >= 100) return "OVER";
  if (utilisation >= 80) return "APPROACHING";
  return "WITHIN";
}

export function calcBudget(
  budget: Budget,
  expenses: Expense[],
): BudgetWithCalc {
  const totalSpent = expenses
    .filter(
      (e) => e.userId === budget.userId && expenseInMonth(e, budget.month),
    )
    .reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget.amount - totalSpent;
  const utilisation =
    budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;
  return {
    ...budget,
    totalSpent,
    remaining,
    utilisation,
    status: getBudgetStatus(utilisation),
  };
}

export const STATUS_STYLES: Record<
  BudgetStatus,
  { label: string; textColor: string; barColor: string; badgeBg: string }
> = {
  WITHIN: {
    label: "Within Budget",
    textColor: "text-[#198754]",
    barColor: "bg-[#198754]",
    badgeBg: "bg-green-50 text-[#198754]",
  },
  APPROACHING: {
    label: "Approaching",
    textColor: "text-yellow-600",
    barColor: "bg-yellow-400",
    badgeBg: "bg-yellow-50 text-yellow-700",
  },
  OVER: {
    label: "Over Budget",
    textColor: "text-[#DC3545]",
    barColor: "bg-[#DC3545]",
    badgeBg: "bg-red-50 text-[#DC3545]",
  },
};

export const PM_LABEL: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  MOBILE_MONEY: "Mobile Money",
  BANK_TRANSFER: "Bank Transfer",
  OTHER: "Other",
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function toMonthKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${mo}`;
}

export function monthKeyToIso(key: string): string {
  return `${key}-01T00:00:00.000Z`;
}

// ── Admin dashboard calculations ─────────────────────────────────────────────

import type { Category } from "../types";

export interface CategoryStat {
  id: string;
  name: string;
  totalSpent: number; // sum of expense amounts
  expenseCount: number; // number of expense records
}

/**
 * Builds per-category stats from the full expense and category lists.
 * Categories with zero expenses are included with zeroed values.
 * Expenses whose categoryId does not match any category are counted
 * under whichever category they reference (handles orphaned refs gracefully).
 */
export function buildCategoryStats(
  expenses: Expense[],
  categories: Category[],
): CategoryStat[] {
  const map = new Map<string, CategoryStat>();

  // Seed every known category with zeros
  for (const cat of categories) {
    map.set(cat.id, {
      id: cat.id,
      name: cat.name,
      totalSpent: 0,
      expenseCount: 0,
    });
  }

  // Accumulate from expenses
  for (const exp of expenses) {
    const existing = map.get(exp.categoryId);
    if (existing) {
      existing.totalSpent += exp.amount;
      existing.expenseCount += 1;
    } else {
      // Orphaned categoryId — create a placeholder so we don’t crash
      map.set(exp.categoryId, {
        id: exp.categoryId,
        name: `Unknown (${exp.categoryId})`,
        totalSpent: exp.amount,
        expenseCount: 1,
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Returns the count of expenses whose createdAt falls in the same
 * calendar month and year as `now`.
 */
export function countExpensesThisMonth(expenses: Expense[], now: Date): number {
  const y = now.getFullYear();
  const m = now.getMonth();
  return expenses.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;
}
