import { z } from "zod";

// Coerce the amount directly to a number so both string and numeric inputs are accepted.
const amountField = z.coerce
  .number({ invalid_type_error: "Amount must be a number" })
  .positive("Budget amount must be a positive number")
  .finite("Budget amount must be a finite number");

// Accept an ISO 8601 string and transform it to a JS Date for normalization downstream.
const monthField = z
  .string()
  .datetime({ message: "month must be a valid ISO 8601 datetime string" })
  .transform((val) => new Date(val));

export const createBudgetSchema = z
  .object({
    amount: amountField,
    month: monthField,
  })
  .strict();

// Only the amount can be updated — the month of a budget is immutable after creation.
export const updateBudgetSchema = z
  .object({
    amount: amountField,
  })
  .strict();

export const budgetIdSchema = z.object({
  id: z.string().uuid("Invalid budget ID"),
});

export const budgetQuerySchema = z
  .object({
    month: z
      .string()
      .datetime({ message: "month must be a valid ISO 8601 datetime string" })
      .transform((val) => new Date(val))
      .optional(),

    startMonth: z
      .string()
      .datetime({
        message: "startMonth must be a valid ISO 8601 datetime string",
      })
      .transform((val) => new Date(val))
      .optional(),
    endMonth: z
      .string()
      .datetime({
        message: "endMonth must be a valid ISO 8601 datetime string",
      })
      .transform((val) => new Date(val))
      .optional(),
  })
  // Ensure the month range is logically valid before querying the database.
  .refine(
    (data) => {
      if (data.startMonth && data.endMonth) {
        return data.startMonth <= data.endMonth;
      }
      return true;
    },
    {
      message: "startMonth must not be after endMonth",
      path: ["startMonth"],
    },
  );
