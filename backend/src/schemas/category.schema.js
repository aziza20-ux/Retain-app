import { z } from "zod";

const nameField = z
  .string()
  .trim()
  .min(1, "Category name is required")
  .max(100, "Category name must be at most 100 characters");

const descriptionField = z
  .string()
  .trim()
  .max(500, "Description must be at most 500 characters")
  .optional();

export const createCategorySchema = z
  .object({
    name: nameField,
    description: descriptionField,
  })
  .strict();

// Both fields are optional for updates; at least one must be provided.
export const updateCategorySchema = z
  .object({
    name: nameField.optional(),
    description: descriptionField,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (name or description) must be provided",
  });

export const categoryIdSchema = z.object({
  id: z.string().uuid("Invalid category ID"),
});
