import multer from "multer";
import path from "path";

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/projects"); // storage folder
  },
  filename: (req, file, cb) => {
    // sanitize filename to avoid path traversal issues
    const safeName = path.basename(file.originalname);
    cb(null, Date.now() + "_" + safeName);
  },
});

// Allowed MIME types
const allowedTypes = [
  "application/zip",
  "application/x-zip-compressed",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/octet-stream", // fallback
];

// Allowed extensions
const allowedExts = [".zip", ".pdf", ".doc", ".docx", ".ppt", ".pptx"];

// File filter
const fileFilter = (req, file, cb) => {
  const mimetype = file.mimetype.toLowerCase().trim();
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

export const uploadProjectFile = multer({ storage, fileFilter });
