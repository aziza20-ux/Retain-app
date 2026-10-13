

import { z } from "zod";



const emailField = z.string().trim().email("Invalid email address").toLowerCase();

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

const nameField = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");


// Rejected fields: role, passwordHash, id, createdAt, updatedAt (via .strict()).

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    password: passwordField,
  })
  .strict();


export const loginSchema = z
  .object({
    email: emailField,
    password: z
      .string()
      .min(1, "Password is required")
      .max(128, "Password must be at most 128 characters"),
  })
  .strict();



export const updateProfileSchema = z
  .object({
    name: nameField.optional(),
    email: emailField.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (name or email) must be provided",
  });
