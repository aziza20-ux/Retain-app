import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";
import isAdmin from "../middlewares/isAdmin.middleware.js";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.post("/", isAuthenticated, isAdmin, createCategory);
router.patch("/:id", isAuthenticated, isAdmin, updateCategory);
router.delete("/:id", isAuthenticated, isAdmin, deleteCategory);

export default router;
