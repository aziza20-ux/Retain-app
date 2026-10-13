import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", isAuthenticated, getMe);

export default router;
