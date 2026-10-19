import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../config/prisma.config.js";
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdSchema,
  budgetQuerySchema,
} from "../schemas/budget.schema.js";

// Normalize any date to the first day of its UTC month so budgets are always month-aligned.
const normalizeToMonthStart = (date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
};

// Compute totalSpent, remaining, and status for a budget by aggregating its month's expenses.
const withCalculations = async (budget) => {
  const monthStart = budget.month;
  const monthEnd = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  );

  const aggregate = await prisma.expense.aggregate({
    where: {
      userId: budget.userId,
      date: { gte: monthStart, lt: monthEnd },
    },
    _sum: { amount: true },
  });

  const totalSpent = aggregate._sum.amount ?? new Decimal(0);
  const budgetAmount = new Decimal(budget.amount);
  const remaining = budgetAmount.minus(totalSpent);
  // Use Decimal arithmetic to avoid floating-point errors when computing the utilisation ratio.
  const spentRatio = budgetAmount.isZero()
    ? new Decimal(0)
    : new Decimal(totalSpent).div(budgetAmount);

  let status;
  if (spentRatio.gte(1)) {
    status = "OVER";
  } else if (spentRatio.gte(0.8)) {
    status = "APPROACHING";
  } else {
    status = "WITHIN";
  }

  // Serialize Decimal fields to fixed-precision strings for consistent JSON output.
  return {
    ...budget,
    totalSpent: totalSpent.toFixed(2),
    remaining: remaining.toFixed(2),
    status,
  };
};

// POST /api/budgets
export const createBudget = async (req, res, next) => {
  try {
    const result = createBudgetSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        });
    }

    const { amount, month } = result.data;
    // Always store the month as the first day of that month in UTC.
    const normalizedMonth = normalizeToMonthStart(month);

    const budget = await prisma.budget.create({
      data: {
        amount,
        month: normalizedMonth,
        userId: req.user.id,
      },
    });

    return res.status(201).json({ budget: await withCalculations(budget) });
  } catch (err) {
    // P2002 is Prisma's unique constraint violation — one budget per user per month.
    if (err?.code === "P2002") {
      return res
        .status(409)
        .json({ message: "A budget already exists for this month" });
    }
    next(err);
  }
};

// GET /api/budgets
export const getBudgets = async (req, res, next) => {
  try {
    const result = budgetQuerySchema.safeParse(req.query);
    if (!result.success) {
      return res
        .status(400)
        .json({
          message: "Invalid query parameters",
          errors: result.error.flatten().fieldErrors,
        });
    }

    const { month, startMonth, endMonth } = result.data;

    // Always scope to the authenticated user.
    const where = { userId: req.user.id };

    if (month) {
      where.month = normalizeToMonthStart(month);
    } else if (startMonth || endMonth) {
      // Build a month range filter when exact month is not specified.
      where.month = {};
      if (startMonth) where.month.gte = normalizeToMonthStart(startMonth);
      if (endMonth) where.month.lte = normalizeToMonthStart(endMonth);
    }

    const budgets = await prisma.budget.findMany({
      where,
      orderBy: { month: "desc" },
    });

    // Attach calculated fields to every budget before responding.
    const budgetsWithCalcs = await Promise.all(budgets.map(withCalculations));

    return res.status(200).json({ budgets: budgetsWithCalcs });
  } catch (err) {
    next(err);
  }
};

// GET /api/budgets/month?month=<ISO string>
export const getBudgetByMonth = async (req, res, next) => {
  try {
    const parsed = budgetQuerySchema.safeParse(req.query);
    if (!parsed.success || !parsed.data.month) {
      return res
        .status(400)
        .json({ message: "A valid month query parameter is required" });
    }

    const normalizedMonth = normalizeToMonthStart(parsed.data.month);

    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: { userId: req.user.id, month: normalizedMonth },
      },
    });

    if (!budget) {
      return res
        .status(404)
        .json({ message: "Budget not found for this month" });
    }

    return res.status(200).json({ budget: await withCalculations(budget) });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/budgets/:id
export const updateBudget = async (req, res, next) => {
  try {
    const idResult = budgetIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid budget ID" });
    }

    const bodyResult = updateBudgetSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res
        .status(400)
        .json({
          message: "Validation failed",
          errors: bodyResult.error.flatten().fieldErrors,
        });
    }

    // Confirm ownership before allowing the update.
    const existing = await prisma.budget.findUnique({
      where: { id: idResult.data.id },
    });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const budget = await prisma.budget.update({
      where: { id: idResult.data.id },
      data: bodyResult.data,
    });

    return res.status(200).json({ budget: await withCalculations(budget) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/budgets/:id
export const deleteBudget = async (req, res, next) => {
  try {
    const idResult = budgetIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid budget ID" });
    }

    // Confirm ownership before allowing the deletion.
    const existing = await prisma.budget.findUnique({
      where: { id: idResult.data.id },
    });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ message: "Budget not found" });
    }

    await prisma.budget.delete({ where: { id: idResult.data.id } });

    return res.status(200).json({ message: "Budget deleted successfully" });
  } catch (err) {
    next(err);
  }
};
