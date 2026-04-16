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
      "string.empty": "First name is required",
      "string.pattern.base": "First name can only contain letters and spaces",
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 50 characters",
      "any.required": "First name is required",
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.empty": "Last name is required",
      "string.pattern.base": "Last name can only contain letters and spaces",
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 50 characters",
      "any.required": "Last name is required",
    }),
  email: Joi.string().email().lowercase().required().messages({
    "string.empty": "Email address is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email address is required",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password cannot exceed 128 characters",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("student", "admin").default("student").messages({
    "any.only": "Role must be either 'student' or 'admin'",
  }),
  batch: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      "string.empty": "Batch year is required",
      "string.pattern.base": "Batch must be a valid 4-digit year (e.g., 2024)",
      "any.required": "Batch year is required",
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
    .required()
    .messages({
      "string.empty": "Department selection is required",
      "any.only": "Please select a valid department from the available options",
      "any.required": "Department selection is required",
    }),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required().messages({
    "string.empty": "Email address is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email address is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

export const projectSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).required().messages({
    "string.empty": "Project title is required",
    "string.min": "Project title must be at least 5 characters long",
    "string.max": "Project title cannot exceed 200 characters",
    "any.required": "Project title is required",
  }),
  description: Joi.string().trim().min(20).max(2000).required().messages({
    "string.empty": "Project description is required",
    "string.min": "Project description must be at least 20 characters long",
    "string.max": "Project description cannot exceed 2000 characters",
    "any.required": "Project description is required",
  }),
  course: Joi.string()
    .valid(
      "Introduction to Computer Science",
      "Introduction to Programming",
      "Object Oriented Programming",
      "Data Structures and Algorithms",
      "Discrete Mathematics",
      "Computer Organization and Architecture",
      "Operating Systems",
      "Database Systems",
      "Computer Networks",
      "Systems Analysis and Design",
      "Software Engineering",
      "Web Programming",
      "Advanced Web Development",
      "Mobile Application Development",
      "Artificial Intelligence",
      "Machine Learning",
      "Human Computer Interaction",
      "Computer Security",
      "Distributed Systems",
      "Compiler Design",
      "Numerical Methods",
      "Algorithm Analysis and Design",
      "Data Mining",
      "Cloud Computing",
      "Research Methods",
      "Final Year Project",
      "Ethics in Computing",
    )
    .required()
    .messages({
      "string.empty": "Course selection is required",
      "any.only": "Please select a valid course from the available options",
      "any.required": "Course selection is required",
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
    .required()
    .messages({
      "string.empty": "Department selection is required",
      "any.only": "Please select a valid department from the available options",
      "any.required": "Department selection is required",
    }),
  batch: Joi.string()
    .pattern(/^\d{4}$/)
    .required()
    .messages({
      "string.empty": "Batch year is required",
      "string.pattern.base": "Batch must be a valid 4-digit year (e.g., 2024)",
      "any.required": "Batch year is required",
    }),
  tags: Joi.array()
    .items(
      Joi.string().trim().max(30).messages({
        "string.max": "Each tag cannot exceed 30 characters",
        "string.empty": "Tags cannot be empty",
      }),
    )
    .max(10)
    .default([])
    .messages({
      "array.max": "Cannot have more than 10 tags",
    }),
  author_name: Joi.string().trim().min(2).max(100).optional().messages({
    "string.min": "Author name must be at least 2 characters long",
    "string.max": "Author name cannot exceed 100 characters",
    "string.empty": "Author name cannot be empty if provided",
  }),
});

// Project update schema (for editing existing projects)
export const projectUpdateSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200).messages({
    "string.empty": "Project title cannot be empty",
    "string.min": "Project title must be at least 5 characters long",
    "string.max": "Project title cannot exceed 200 characters",
  }),
  description: Joi.string().trim().min(20).max(2000).messages({
    "string.empty": "Project description cannot be empty",
    "string.min": "Project description must be at least 20 characters long",
    "string.max": "Project description cannot exceed 2000 characters",
  }),
  course: Joi.string()
    .valid(
      "Introduction to Computer Science",
      "Introduction to Programming",
      "Object Oriented Programming",
      "Data Structures and Algorithms",
      "Discrete Mathematics",
      "Computer Organization and Architecture",
      "Operating Systems",
      "Database Systems",
      "Computer Networks",
      "Systems Analysis and Design",
      "Software Engineering",
      "Web Programming",
      "Advanced Web Development",
      "Mobile Application Development",
      "Artificial Intelligence",
      "Machine Learning",
      "Human Computer Interaction",
      "Computer Security",
      "Distributed Systems",
      "Compiler Design",
      "Numerical Methods",
      "Algorithm Analysis and Design",
      "Data Mining",
      "Cloud Computing",
      "Research Methods",
      "Final Year Project",
      "Ethics in Computing",
    )
    .messages({
      "string.empty": "Course selection cannot be empty",
      "any.only": "Please select a valid course from the available options",
    }),
  tags: Joi.array()
    .items(
      Joi.string().trim().max(30).messages({
        "string.max": "Each tag cannot exceed 30 characters",
        "string.empty": "Tags cannot be empty",
      }),
    )
    .max(10)
    .messages({
      "array.max": "Cannot have more than 10 tags",
    }),
});

// Project status update schema (for admin actions)
export const projectStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .required()
    .messages({
      "string.empty": "Status is required",
      "any.only": "Status must be either 'pending', 'approved', or 'rejected'",
      "any.required": "Status is required",
    }),
  reason: Joi.string().trim().max(500).optional().messages({
    "string.max": "Reason cannot exceed 500 characters",
    "string.empty": "Reason cannot be empty if provided",
  }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      "string.empty": "First name cannot be empty",
      "string.pattern.base": "First name can only contain letters and spaces",
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 50 characters",
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      "string.empty": "Last name cannot be empty",
      "string.pattern.base": "Last name can only contain letters and spaces",
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 50 characters",
    }),
  email: Joi.string().email().lowercase().messages({
    "string.empty": "Email address cannot be empty",
    "string.email": "Please provide a valid email address",
  }),
  batch: Joi.string()
    .pattern(/^\d{4}$/)
    .messages({
      "string.empty": "Batch year cannot be empty",
      "string.pattern.base": "Batch must be a valid 4-digit year (e.g., 2024)",
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
    .messages({
      "string.empty": "Department cannot be empty",
      "any.only": "Please select a valid department from the available options",
    }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(6).max(128).required().messages({
    "string.empty": "New password is required",
    "string.min": "New password must be at least 6 characters long",
    "string.max": "New password cannot exceed 128 characters",
    "any.required": "New password is required",
  }),
});

// Middleware to parse JSON fields in multipart form data
export const parseFormDataFields = (req, res, next) => {
  try {
    console.log("Form data received:", req.body);

    // Parse tags field if it exists and is a string
    if (req.body.tags && typeof req.body.tags === "string") {
      console.log("Parsing tags:", req.body.tags);
      req.body.tags = JSON.parse(req.body.tags);
      console.log("Parsed tags:", req.body.tags);
    }

    console.log("Final body after parsing:", req.body);
    next();
  } catch (error) {
    console.error("Error parsing form data:", error);
    return res.status(400).json({
      success: false,
      message: "Invalid JSON in form fields",
      code: "INVALID_JSON",
    });
  }
};

// Validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => {
        const fieldName = detail.path.join(".");
        const friendlyFieldName = getFriendlyFieldName(fieldName);

        return {
          field: friendlyFieldName,
          message: detail.message,
          path: fieldName,
        };
      });

      // Create a more specific error message based on the first error
      const firstError = errors[0];
      let specificMessage = "Please check the following errors:";

      if (errors.length === 1) {
        specificMessage = firstError.message;
      } else if (errors.length <= 3) {
        specificMessage = errors.map((err) => err.message).join(", ");
      }

      return res.status(400).json({
        success: false,
        message: specificMessage,
        code: "VALIDATION_ERROR",
        errors,
        details: {
          totalErrors: errors.length,
          fields: errors.map((err) => err.field),
        },
      });
    }

    // Sanitize input to prevent XSS
    req.body = sanitizeInput(value);
    next();
  };
};

// Helper function to convert field names to user-friendly names
const getFriendlyFieldName = (fieldName) => {
  const fieldMap = {
    title: "Project Title",
    description: "Project Description",
    course: "Course",
    department: "Department",
    batch: "Batch Year",
    tags: "Tags",
    author_name: "Author Name",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    password: "Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    status: "Project Status",
    reason: "Status Reason",
    role: "User Role",
  };

  return (
    fieldMap[fieldName] ||
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
  );
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
      message: "Project file is required. Please select a file to upload.",
      code: "NO_FILE",
      errors: [
        {
          field: "Project File",
          message: "Please select a file to upload",
        },
      ],
    });
  }

  const allowedTypes = [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-zip",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "application/json",
  ];

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid file type. Only ZIP, PDF, PPT, PPTX, DOC, DOCX, TXT, and JSON files are allowed.",
      code: "INVALID_FILE_TYPE",
      errors: [
        {
          field: "Project File",
          message:
            "Please upload a valid file type (ZIP, PDF, PPT, PPTX, DOC, DOCX, TXT, JSON)",
        },
      ],
    });
  }

  // Check file size (3GB limit)
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 3 * 1024 * 1024 * 1024; // 3GB
  if (req.file.size > maxSize) {
    const maxSizeGB = (maxSize / (1024 * 1024 * 1024)).toFixed(1);
    return res.status(400).json({
      success: false,
      message: `File size too large. Maximum size is ${maxSizeGB}GB`,
      code: "FILE_TOO_LARGE",
      errors: [
        {
          field: "Project File",
          message: `File size exceeds the ${maxSizeGB}GB limit. Please choose a smaller file.`,
        },
      ],
    });
  }

  next();
};
