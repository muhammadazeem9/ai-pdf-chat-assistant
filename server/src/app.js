import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import devDocumentRoutes from "./routes/devDocument.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import AppError from "./utils/AppError.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "AI PDF Chat API is running" });
});

app.get("/api/health/db", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

// Temporary route for development and Postman testing
app.use("/api/dev", devDocumentRoutes);

// Handle unknown routes
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// Error middleware must be registered last
app.use(errorMiddleware);

export default app;
