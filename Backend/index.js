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

// Import table creation functions
import { createUsersTable } from "./models/userModel.js";
import { createProjectsTable } from "./models/projectModel.js";

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
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : [
          "http://localhost:5173",
          "http://localhost:3000",
          "http://localhost:5174",
          "http://localhost:8080",
          "https://localhost:8080",
        ];

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
    version: process.env.npm_package_version || "1.0.0",
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

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Haramaya University Project Store API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/user",
      projects: "/api/project",
      health: "/health",
      ping: "/ping",
    },
    documentation: "https://github.com/your-repo/docs",
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  // Close server
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  // Force close after 10 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Database initialization function
async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database tables...");

    // Create users table
    await createUsersTable();
    console.log("✅ Users table ready");

    // Create projects table
    await createProjectsTable();
    console.log("✅ Projects table ready");

    console.log("🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    console.error(
      "Server will continue but some features may not work properly",
    );
  }
}

// Start server
const port = process.env.PORT || 5000;
let server;

async function startServer() {
  try {
    // Initialize database tables first
    await initializeDatabase();

    // Start the server
    server = app.listen(port, () => {
      console.log(`🚀 Server running on PORT: ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔗 API Base URL: http://localhost:${port}/api`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Promise Rejection:", err);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
