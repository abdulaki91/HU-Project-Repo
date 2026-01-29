import Joi from "joi";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss";

// Rate limiting configurations
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
export const userRegistrationSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "First name can only contain letters and spaces",
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 50 characters",
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "Last name can only contain letters and spaces",
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 50 characters",
    }),
  email: Joi.string().email().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 128 characters",
    }),
  role: Joi.string().valid("student", "admin").default("student"),
  batch: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      "string.pattern.base": "Batch must be a 4-digit year",
    }),
  department: Joi.string()
    .valid(
      "Computer Science",
      "Information Technology",
      "Information System",
      "Information Science",
      "Software Engineering",
      "Statistics",
    )
    .required(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

export const projectSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required().messages({
    "string.min": "Project title must be at least 5 characters long",
    "string.max": "Project title cannot exceed 200 characters",
  }),
  description: Joi.string().trim().min(20).max(2000).required().messages({
    "string.min": "Project description must be at least 20 characters long",
    "string.max": "Project description cannot exceed 2000 characters",
  }),
  course: Joi.string().trim().max(100).required(),
  department: Joi.string()
    .valid(
      "Computer Science",
      "Information Technology",
      "Information System",
      "Information Science",
      "Software Engineering",
      "Statistics",
    )
    .required(),
  batch: Joi.string()
    .pattern(/^\d{4}$/)
    .required(),
  tags: Joi.array()
    .items(Joi.string().trim().max(30))
    .max(10)
    .default([])
    .messages({
      "array.max": "Cannot have more than 10 tags",
      "string.max": "Each tag cannot exceed 30 characters",
    }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/),
  email: Joi.string().email().lowercase(),
  batch: Joi.string().pattern(/^\d{4}$/),
  department: Joi.string().valid(
    "Computer Science",
    "Information Technology",
    "Information System",
    "Information Science",
    "Software Engineering",
    "Statistics",
  ),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.pattern.base":
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "string.min": "New password must be at least 8 characters long",
    }),
});

// Validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors,
      });
    }

    // Sanitize input to prevent XSS
    req.body = sanitizeInput(value);
    next();
  };
};

// XSS sanitization
const sanitizeInput = (obj) => {
  if (typeof obj === "string") {
    return xss(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  } else if (obj && typeof obj === "object") {
    const sanitized = {};
    for (const key in obj) {
      sanitized[key] = sanitizeInput(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// File validation
export const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
      code: "NO_FILE",
    });
  }

  const allowedTypes = [
    "application/zip",
    "application/x-zip-compressed",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid file type. Only ZIP, PDF, DOC, and DOCX files are allowed",
      code: "INVALID_FILE_TYPE",
    });
  }

  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum size is 50MB",
      code: "FILE_TOO_LARGE",
    });
  }

  next();
};
