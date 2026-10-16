import { Router } from "express";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";
import isAdmin from "../middlewares/isAdmin.middleware.js";
import { getInsights } from "../controllers/admin.controller.js";

const router = Router();

// All admin routes require a valid JWT and the ADMIN role.
router.use(isAuthenticated, isAdmin);

router.get("/insights", getInsights);

export default router;
