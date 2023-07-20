import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dbConnection } from "./db.js";
import { userRouter } from "./Routes/user.js";
import { templateRouter } from "./Routes/template.js";
import isAuthenticated from "./Controller/auth.js";

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(cors());
app.use("/api/user", userRouter);
app.use("/api/template", templateRouter);
dbConnection();
// isAuthenticated,
app.listen(PORT, () =>
  console.log(`Server running Successfully in localhost:${PORT}`)
);
