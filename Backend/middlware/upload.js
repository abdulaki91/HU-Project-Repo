import multer from "multer";
import path from "path";

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/projects"); // storage folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

// Allowed MIME types
const allowedTypes = [
  "application/zip",
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// File filter
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else
    cb(
      new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type"),
      false
    );
};

export const uploadProjectFile = multer({ storage, fileFilter });
