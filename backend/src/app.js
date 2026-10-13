import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import budgetRouter from "./routes/budget.routes.js";
import categoryRouter from "./routes/category.routes.js";
import expenseRouter from "./routes/expense.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

 const PORT = Number(process.env.PORT) || 3001;

app.use("/api/auth", authRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/expenses", expenseRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler — must have 4 parameters for Express to treat it as an error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ message: err.message ?? "Internal server error" });
});

  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });

export default app;
