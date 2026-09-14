import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import routes from "./routes/index.js";

const app = express();

const PORT = Number(process.env.PORT) || 3333;

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(helmet());

app.use(express.json());

app.use(cookieParser());

app.use(routes);

app.listen(PORT, () => {
  console.log(`🚀 FinanceFlow API running on port ${PORT}`);
});