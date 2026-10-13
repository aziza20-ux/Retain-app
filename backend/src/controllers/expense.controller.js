import { prisma } from "../config/prisma.config.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdSchema,
  expenseQuerySchema,
} from "../schemas/expense.schema.js";

// POST /api/expenses
export const createExpense = async (req, res, next) => {
  try {
    const result = createExpenseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
    }

    const { title, amount, date, paymentMethod, categoryId, notes } = result.data;

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        amount,
        date,
        paymentMethod,
        categoryId,
        notes,
        userId: req.user.id,
      },
      include: { category: true },
    });

    return res.status(201).json({ expense });
  } catch (err) {
    next(err);
  }
};

// GET /api/expenses
export const getExpenses = async (req, res, next) => {
  try {
    const result = expenseQuerySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid query parameters", errors: result.error.flatten().fieldErrors });
    }

    const {
      categoryId,
      paymentMethod,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    } = result.data;

    const where = { userId: req.user.id };

    if (categoryId) where.categoryId = categoryId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: { category: true },
      }),
      prisma.expense.count({ where }),
    ]);

    return res.status(200).json({
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/expenses/:id
export const getExpenseById = async (req, res, next) => {
  try {
    const idResult = expenseIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }

    const expense = await prisma.expense.findUnique({
      where: { id: idResult.data.id },
      include: { category: true },
    });

    if (!expense || expense.userId !== req.user.id) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({ expense });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/expenses/:id
export const updateExpense = async (req, res, next) => {
  try {
    const idResult = expenseIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }

    const bodyResult = updateExpenseSchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ message: "Validation failed", errors: bodyResult.error.flatten().fieldErrors });
    }

    const existing = await prisma.expense.findUnique({ where: { id: idResult.data.id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (bodyResult.data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: bodyResult.data.categoryId } });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    const expense = await prisma.expense.update({
      where: { id: idResult.data.id },
      data: bodyResult.data,
      include: { category: true },
    });

    return res.status(200).json({ expense });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/expenses/:id
export const deleteExpense = async (req, res, next) => {
  try {
    const idResult = expenseIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }

    const existing = await prisma.expense.findUnique({ where: { id: idResult.data.id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await prisma.expense.delete({ where: { id: idResult.data.id } });

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    next(err);
  }
};
