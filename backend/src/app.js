import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import authRouter from "./routes/auth.routes.js";
import budgetRouter from "./routes/budget.routes.js";
import categoryRouter from "./routes/category.routes.js";
import expenseRouter from "./routes/expense.routes.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────────────────────
// CLIENT_URL must be set in .env for production (e.g. http://localhost:5173).
// Falls back to the Vite default for local development.
// Authentication uses Authorization: Bearer <token>, so no cookie config needed.
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json());

// ── Rate limiting for authentication endpoints ──────────────────────────────
// 10 attempts per 15 minutes per IP on login and register.
// windowMs and max are intentionally generous for development; tighten for production.
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later" },
});

const PORT = Number(process.env.PORT) || 3001;

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/admin", adminRouter);

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global error handler ─────────────────────────────────────────────────────
// Must have 4 parameters for Express to treat it as an error handler.
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status ?? 500)
    .json({ message: err.message ?? "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

export default app;
