import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../config/prisma.config.js";

// Safe user projection — never exposes passwordHash or internal fields.
const safeUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

// Safe expense owner projection used inside recentExpenses.
const safeOwnerFields = {
  id: true,
  name: true,
  email: true,
};

/**
 * GET /api/admin/insights
 *
 * Returns all nine platform-wide admin dashboard metrics in a single response.
 * Requires: isAuthenticated + isAdmin middleware (enforced in the route).
 *
 * Metric 4 interpretation: "expenses recorded during the current month" uses
 * the expense `date` field (when the spending occurred), consistent with how
 * the budget calculations use `date` throughout the rest of the application.
 * This matches the assignment's intent of tracking spending activity per month.
 *
 * All independent queries run concurrently via Promise.all to avoid sequential
 * round-trips. Category groupBy results are merged with the full category list
 * so that categories with zero expenses are included in the response.
 */
export const getInsights = async (req, res, next) => {
  try {
    // ── Current-month UTC boundaries (consistent with budget.controller.js) ──
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthEnd   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    // ── Run all independent queries in parallel ────────────────────────────
    const [
      totalUsers,
      totalExpenses,
      expenseValueAggregate,
      expensesThisMonth,
      allCategories,
      categoryGroupBy,
      recentExpenses,
      recentUsers,
    ] = await Promise.all([

      // 1. Total registered users
      prisma.user.count(),

      // 2. Total expenses recorded (platform-wide)
      prisma.expense.count(),

      // 3. Total monetary value of all expenses
      prisma.expense.aggregate({ _sum: { amount: true } }),

      // 4. Expenses recorded during the current calendar month (by expense date)
      prisma.expense.count({
        where: { date: { gte: monthStart, lt: monthEnd } },
      }),

      // 5/6/7. All categories — needed to fill in zero-count categories
      prisma.category.findMany({ orderBy: { name: "asc" } }),

      // 5/6/7. Per-category expense count and spending total
      prisma.expense.groupBy({
        by: ["categoryId"],
        _count: { id: true },
        _sum:   { amount: true },
      }),

      // 8. Recently added expenses (platform-wide, ordered by createdAt desc)
      prisma.expense.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          category: { select: { id: true, name: true } },
          user:     { select: safeOwnerFields },
        },
      }),

      // 9. Recently registered users (ordered by createdAt desc)
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: safeUserFields,
      }),
    ]);

    // ── Assemble per-category stats ────────────────────────────────────────
    // Build a lookup map from the groupBy results.
    const groupByMap = new Map(
      categoryGroupBy.map((row) => [
        row.categoryId,
        {
          expenseCount: row._count.id,
          totalSpent:   row._sum.amount ?? new Decimal(0),
        },
      ])
    );

    // Merge with the full category list so zero-expense categories are included.
    const spendingByCategory = allCategories.map((cat) => {
      const stats = groupByMap.get(cat.id);
      return {
        categoryId:    cat.id,
        categoryName:  cat.name,
        expenseCount:  stats?.expenseCount ?? 0,
        totalSpent:    (stats?.totalSpent ?? new Decimal(0)).toFixed(2),
      };
    });

    // ── Top 5 most-used categories (by expense count desc, then name asc) ──
    const topCategories = [...spendingByCategory]
      .sort((a, b) =>
        b.expenseCount - a.expenseCount ||
        a.categoryName.localeCompare(b.categoryName)
      )
      .slice(0, 5);

    // ── Bottom 5 least-used categories (by expense count asc, then name asc) ─
    const bottomCategories = [...spendingByCategory]
      .sort((a, b) =>
        a.expenseCount - b.expenseCount ||
        a.categoryName.localeCompare(b.categoryName)
      )
      .slice(0, 5);

    // ── Serialize total expense value safely ──────────────────────────────
    const totalExpenseValue = (
      expenseValueAggregate._sum.amount ?? new Decimal(0)
    ).toFixed(2);

    // ── Build response ────────────────────────────────────────────────────
    return res.status(200).json({
      totalUsers,
      totalExpenses,
      totalExpenseValue,
      expensesThisMonth,
      spendingByCategory,
      topCategories,
      bottomCategories,
      recentExpenses,
      recentUsers,
    });
  } catch (err) {
    next(err);
  }
};
