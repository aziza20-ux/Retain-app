import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getMe);

export default router;
