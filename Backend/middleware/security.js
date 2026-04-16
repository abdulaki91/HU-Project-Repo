import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss";
import validator from "validator";

// Enhanced rate limiting configurations
export const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      code: "RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.round(windowMs / 1000),
      });
    },
  });
};

// Strict rate limiting for authentication endpoints
export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  "Too many authentication attempts. Please try again in 15 minutes.",
);

// General API rate limiting
export const apiRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  "Too many requests. Please try again later.",
);

// File upload rate limiting
export const uploadRateLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // 10 uploads
  "Too many file uploads. Please try again in an hour.",
);

// Enhanced security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: "deny" },
  xssFilter: true,
  referrerPolicy: { policy: "same-origin" },
});

// Input sanitization middleware
export const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === "object") {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// Recursive object sanitization
const sanitizeObject = (obj) => {
  if (typeof obj === "string") {
    return xss(validator.escape(obj));
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  } else if (obj && typeof obj === "object") {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
};

// SQL injection prevention
export const preventSQLInjection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(;|\-\-|\|\||&&)/g,
    /('|(\\')|(;)|(\-\-)|(\|\|)|(&&))/g,
  ];

  const checkForSQLInjection = (value) => {
    if (typeof value === "string") {
      return sqlPatterns.some((pattern) => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "string" && checkForSQLInjection(obj[key])) {
          return true;
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          if (checkObject(obj[key])) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Check body, query, and params
  if (
    (req.body && checkObject(req.body)) ||
    (req.query && checkObject(req.query)) ||
    (req.params && checkObject(req.params))
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid input detected",
      code: "INVALID_INPUT",
    });
  }

  next();
};

// File type validation
export const validateFileType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.file) {
      return next();
    }

    const fileType = req.file.mimetype;
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
        code: "INVALID_FILE_TYPE",
      });
    }

    next();
  };
};

// Request ID middleware for tracking
export const requestId = (req, res, next) => {
  req.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  res.setHeader("X-Request-ID", req.id);
  next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    if (allowedIPs.includes(clientIP) || allowedIPs.includes("*")) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied from this IP address",
      code: "IP_NOT_ALLOWED",
    });
  };
};

// Password strength validation
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!hasLowerCase) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!hasNumbers) {
    errors.push("Password must contain at least one number");
  }
  if (!hasSpecialChar) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password),
  };
};

const calculatePasswordStrength = (password) => {
  let score = 0;

  // Length bonus
  score += Math.min(password.length * 2, 20);

  // Character variety bonus
  if (/[a-z]/.test(password)) score += 5;
  if (/[A-Z]/.test(password)) score += 5;
  if (/[0-9]/.test(password)) score += 5;
  if (/[^A-Za-z0-9]/.test(password)) score += 10;

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns

  if (score < 30) return "weak";
  if (score < 60) return "medium";
  return "strong";
};

export default {
  authRateLimit,
  apiRateLimit,
  uploadRateLimit,
  securityHeaders,
  sanitizeInput,
  preventSQLInjection,
  validateFileType,
  requestId,
  ipWhitelist,
  validatePasswordStrength,
};
