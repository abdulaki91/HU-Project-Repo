import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads", "projects");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure filename with timestamp and random hash
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString("hex");
    const timestamp = Date.now();
    const safeName = `${timestamp}_${hash}${ext}`;
    cb(null, safeName);
  },
});

// Allowed MIME types with strict validation
const allowedMimeTypes = [
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

// Allowed extensions
const allowedExtensions = [
  ".zip",
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".txt",
  ".json",
];

// File filter with enhanced security
const fileFilter = (req, file, cb) => {
  const mimetype = file.mimetype.toLowerCase().trim();
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = file.originalname.toLowerCase();

  // Check for dangerous file patterns
  const dangerousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.com$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.jar$/i,
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /\.py$/i,
    /\.rb$/i,
    /\.pl$/i,
    /\.sh$/i,
  ];

  const isDangerous = dangerousPatterns.some((pattern) =>
    pattern.test(filename),
  );

  if (isDangerous) {
    return cb(new Error("File type not allowed for security reasons"), false);
  }

  // Validate MIME type and extension
  if (allowedMimeTypes.includes(mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${allowedExtensions.join(", ")}`,
      ),
      false,
    );
  }
};

// Multer configuration with limits
export const uploadProjectFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 3 * 1024 * 1024 * 1024, // 3GB default
    files: 1, // Only one file per upload
    fields: 20, // Limit form fields
    fieldNameSize: 100, // Limit field name size
    fieldSize: 1024 * 1024, // 1MB field size limit
  },
});

// Profile picture upload (separate configuration)
const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const profileDir = path.join(process.cwd(), "uploads", "profiles");
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const userId = req.user?.id || "anonymous";
    const timestamp = Date.now();
    cb(null, `profile_${userId}_${timestamp}${ext}`);
  },
});

const profilePictureFilter = (req, file, cb) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

  const mimetype = file.mimetype.toLowerCase();
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedImageTypes.includes(mimetype) && allowedImageExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, GIF, WebP) are allowed"), false);
  }
};

export const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: profilePictureFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for profile pictures
    files: 1,
  },
});

// Utility function to clean up uploaded files on error
export const cleanupUploadedFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error);
    }
  }
};

// Middleware to handle multer errors
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Clean up any uploaded files on error
    if (req.file) {
      cleanupUploadedFile(req.file.path);
    }

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 3GB.",
          code: "FILE_TOO_LARGE",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files. Only one file allowed.",
          code: "TOO_MANY_FILES",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Unexpected file field.",
          code: "UNEXPECTED_FILE",
        });
      default:
        return res.status(400).json({
          success: false,
          message: "File upload error.",
          code: "UPLOAD_ERROR",
        });
    }
  } else if (err) {
    // Clean up any uploaded files on error
    if (req.file) {
      cleanupUploadedFile(req.file.path);
    }

    return res.status(400).json({
      success: false,
      message: err.message || "File upload failed.",
      code: "UPLOAD_FAILED",
    });
  }

  next();
};
