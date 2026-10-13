import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";
import {
  createBudget,
  getBudgets,
  getBudgetByMonth,
  updateBudget,
  deleteBudget,
} from "../controllers/budget.controller.js";

const router = Router();

router.use(isAuthenticated);

router.post("/", createBudget);
router.get("/", getBudgets);
router.get("/month", getBudgetByMonth); // uses ?month= query param — must be before /:id
router.patch("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;
