import fs from "fs";
import path from "path";

// Centralized error handling middleware
export const errorHandler = (err, req, res, next) => {
  // Log error details
  logError(err, req);

  // Default error response
  let error = {
    success: false,
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  };

  // Handle specific error types
  if (err.name === "ValidationError") {
    error = {
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.details,
    };
    return res.status(400).json(error);
  }

  if (err.code === "ER_DUP_ENTRY") {
    error = {
      success: false,
      message: "Duplicate entry. This record already exists",
      code: "DUPLICATE_ENTRY",
    };
    return res.status(409).json(error);
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    error = {
      success: false,
      message: "Referenced record does not exist",
      code: "INVALID_REFERENCE",
    };
    return res.status(400).json(error);
  }

  if (err.name === "JsonWebTokenError") {
    error = {
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
    };
    return res.status(401).json(error);
  }

  if (err.name === "TokenExpiredError") {
    error = {
      success: false,
      message: "Token has expired",
      code: "TOKEN_EXPIRED",
    };
    return res.status(401).json(error);
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      error = {
        success: false,
        message: "File size too large",
        code: "FILE_TOO_LARGE",
      };
      return res.status(400).json(error);
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      error = {
        success: false,
        message: "Unexpected file field",
        code: "UNEXPECTED_FILE",
      };
      return res.status(400).json(error);
    }
  }

  // Handle database connection errors
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    error = {
      success: false,
      message: "Database connection failed",
      code: "DB_CONNECTION_ERROR",
    };
    return res.status(503).json(error);
  }

  // Handle file system errors
  if (err.code === "ENOENT") {
    error = {
      success: false,
      message: "File not found",
      code: "FILE_NOT_FOUND",
    };
    return res.status(404).json(error);
  }

  // Production vs Development error responses
  if (process.env.NODE_ENV === "production") {
    // In production, don't expose error details
    res.status(500).json(error);
  } else {
    // In development, include stack trace
    error.stack = err.stack;
    error.details = err.message;
    res.status(500).json(error);
  }
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: "ROUTE_NOT_FOUND",
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Error logging function
const logError = (err, req) => {
  const logDir = path.join(process.cwd(), "logs");

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, "error.log");
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?.id || "anonymous",
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
    },
  };

  const logString = JSON.stringify(logEntry, null, 2) + "\n";

  // Append to log file
  fs.appendFile(logFile, logString, (writeErr) => {
    if (writeErr) {
      console.error("Failed to write to log file:", writeErr);
    }
  });

  // Also log to console in development
  if (process.env.NODE_ENV !== "production") {
    console.error("Error occurred:", {
      timestamp,
      url: req.originalUrl,
      error: err.message,
      stack: err.stack,
    });
  }
};
