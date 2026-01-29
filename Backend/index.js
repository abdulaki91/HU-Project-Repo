// Load environment variables
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import fs from "fs";

dotenv.config();

import userRoute from "./routes/userRoute.js";
import projectRoute from "./routes/projectRoute.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { generalRateLimit, securityHeaders } from "./middleware/validation.js";

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set("trust proxy", 1);

// Security headers
app.use(securityHeaders);

// Compression middleware
app.use(compression());

// Request logging
if (process.env.NODE_ENV === "production") {
  // Create logs directory
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Log to file in production
  const accessLogStream = fs.createWriteStream(
    path.join(logDir, "access.log"),
    { flags: "a" },
  );
  app.use(morgan("combined", { stream: accessLogStream }));
} else {
  // Log to console in development
  app.use(morgan("dev"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:5173", "http://localhost:3000"];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Rate limiting
app.use(generalRateLimit);

// Serve static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/user", userRoute);
app.use("/api/project", projectRoute);

// Ping route for testing backend reachability
app.get("/ping", (req, res) => {
  res.json({
    success: true,
    message: "pong from Node.js backend",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Start server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`🚀 Server running on PORT: ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
