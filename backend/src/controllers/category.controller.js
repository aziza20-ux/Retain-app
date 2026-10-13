import { prisma } from "../config/prisma.config.js";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} from "../schemas/category.schema.js";

// POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const result = createCategorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Validation failed", errors: result.error.flatten().fieldErrors });
    }

    const category = await prisma.category.create({ data: result.data });

    return res.status(201).json({ category });
  } catch (err) {
    if (err?.code === "P2002") {
      return res.status(409).json({ message: "A category with this name already exists" });
    }
    next(err);
  }
};

// GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return res.status(200).json({ categories });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/:id
export const getCategoryById = async (req, res, next) => {
  try {
    const idResult = categoryIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await prisma.category.findUnique({ where: { id: idResult.data.id } });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({ category });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/categories/:id
export const updateCategory = async (req, res, next) => {
  try {
    const idResult = categoryIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const bodyResult = updateCategorySchema.safeParse(req.body);
    if (!bodyResult.success) {
      return res.status(400).json({ message: "Validation failed", errors: bodyResult.error.flatten().fieldErrors });
    }

    const existing = await prisma.category.findUnique({ where: { id: idResult.data.id } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    const category = await prisma.category.update({
      where: { id: idResult.data.id },
      data: bodyResult.data,
    });

    return res.status(200).json({ category });
  } catch (err) {
    if (err?.code === "P2002") {
      return res.status(409).json({ message: "A category with this name already exists" });
    }
    next(err);
  }
};

// DELETE /api/categories/:id
// Reassigns all associated expenses to "Uncategorized" before deletion.
// Both operations run in a single transaction to prevent orphaned expenses.
export const deleteCategory = async (req, res, next) => {
  try {
    const idResult = categoryIdSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const { id } = idResult.data;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (existing.name === "Uncategorized") {
      return res.status(400).json({ message: "The Uncategorized category cannot be deleted" });
    }

    const uncategorized = await prisma.category.findUnique({
      where: { name: "Uncategorized" },
    });

    if (!uncategorized) {
      return res.status(409).json({
        message: "Cannot delete category: the Uncategorized fallback category does not exist. Please seed it first.",
      });
    }

    await prisma.$transaction([
      prisma.expense.updateMany({
        where: { categoryId: id },
        data: { categoryId: uncategorized.id },
      }),
      prisma.category.delete({ where: { id } }),
    ]);

    return res.status(200).json({ message: "Category deleted and expenses reassigned to Uncategorized" });
  } catch (err) {
    next(err);
  }
};
