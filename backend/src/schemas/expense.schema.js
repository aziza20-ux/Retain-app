import { z } from "zod";

export const PaymentMethodEnum = z.enum([
  "CASH",
  "CARD",
  "MOBILE_MONEY",
  "BANK_TRANSFER",
  "OTHER",
]);

const titleField = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title must be at most 200 characters");

// Accept both string and number inputs from the request body, then coerce to a number.
const amountField = z
  .union([z.string(), z.number()])
  .transform((val) => Number(val))
  .pipe(
    z
      .number()
      .positive("Amount must be a positive number")
      .finite("Amount must be a finite number"),
  );

// Date: accepts an ISO 8601 string and transforms it to a JS Date object.
const dateField = z
  .string()
  .datetime({ message: "Date must be a valid ISO 8601 datetime string" })
  .transform((val) => new Date(val));

const notesField = z
  .string()
  .trim()
  .max(1000, "Notes must be at most 1000 characters")
  .optional();

const categoryIdField = z.string().uuid("Invalid category ID");

// Reject expenses dated in the future using a UTC calendar-day comparison.
export const createExpenseSchema = z
  .object({
    title: titleField,
    amount: amountField,
    date: dateField,
    paymentMethod: PaymentMethodEnum,
    categoryId: categoryIdField,
    notes: notesField,
  })
  .strict()
  .refine(
    (data) => {
      const expenseDay = data.date.toISOString().slice(0, 10);
      const todayDay = new Date().toISOString().slice(0, 10);
      return expenseDay <= todayDay;
    },
    { message: "Expense date cannot be in the future", path: ["date"] },
  );

// All fields are optional for updates; at least one must be provided.
export const updateExpenseSchema = z
  .object({
    title: titleField.optional(),
    amount: amountField.optional(),
    date: dateField.optional(),
    paymentMethod: PaymentMethodEnum.optional(),
    categoryId: categoryIdField.optional(),
    notes: notesField,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const expenseIdSchema = z.object({
  id: z.string().uuid("Invalid expense ID"),
});

// Coerce pagination query string values (always strings from the URL) to integers.
const positiveIntString = z
  .string()
  .regex(/^\d+$/, "Must be a positive integer")
  .transform(Number)
  .pipe(z.number().int().positive());

export const expenseQuerySchema = z
  .object({
    // Category filter
    categoryId: z.string().uuid("Invalid category ID").optional(),

    // Payment method filter
    paymentMethod: PaymentMethodEnum.optional(),

    // Date range — ISO 8601 strings, transformed to Date objects
    startDate: z
      .string()
      .datetime({
        message: "startDate must be a valid ISO 8601 datetime string",
      })
      .transform((val) => new Date(val))
      .optional(),
    endDate: z
      .string()
      .datetime({ message: "endDate must be a valid ISO 8601 datetime string" })
      .transform((val) => new Date(val))
      .optional(),

    // Full-text search across title and notes
    search: z.string().trim().max(200).optional(),

    // Sorting
    sortBy: z.enum(["date", "amount"]).default("date"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),

    // Pagination — coerced from query string to integer
    page: positiveIntString.default("1"),
    limit: positiveIntString
      .pipe(z.number().int().positive().max(100, "Maximum page size is 100"))
      .default("20"),
  })
  // Ensure the date range is logically valid before hitting the database.
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "startDate must not be after endDate",
      path: ["startDate"],
    },
  );

// Schema for GET /api/expenses/summary
// month is optional — when supplied, restricts the summary to that calendar month.
export const summaryQuerySchema = z.object({
  month: z
    .string()
    .datetime({ message: "month must be a valid ISO 8601 datetime string" })
    .transform((val) => new Date(val))
    .optional(),
});
