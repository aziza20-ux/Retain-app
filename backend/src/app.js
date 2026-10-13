import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

 const PORT = Number(process.env.PORT) || 3000;

app.use("/api/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });

export default app;
