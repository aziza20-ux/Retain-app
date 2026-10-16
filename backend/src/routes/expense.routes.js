import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getCategorySummary,
} from "../controllers/expense.controller.js";

const router = Router();

router.use(isAuthenticated);

router.post("/", createExpense);
router.get("/", getExpenses);
// Summary must be registered before /:id to avoid "summary" being treated as an ID
router.get("/summary", getCategorySummary);
router.get("/:id", getExpenseById);
router.patch("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
