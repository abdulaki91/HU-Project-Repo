-- Initialize database for Haramaya University Project Store
CREATE DATABASE IF NOT EXISTS projectrepo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE projectrepo;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  batch VARCHAR(50) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  verificationToken VARCHAR(255) DEFAULT NULL,
  resetToken VARCHAR(255) DEFAULT NULL,
  resetTokenExpiry DATETIME DEFAULT NULL,
  role ENUM('admin','student','super-admin') NOT NULL DEFAULT 'student',
  verified BOOLEAN DEFAULT FALSE,
  lastLogin DATETIME DEFAULT NULL,
  profilePicture VARCHAR(255) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  status ENUM('active','suspended','inactive') DEFAULT 'active',
  emailPreferences JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_verification_token (verificationToken),
  INDEX idx_reset_token (resetToken),
  INDEX idx_department (department),
  INDEX idx_batch (batch),
  INDEX idx_role (role)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  course VARCHAR(100),
  department VARCHAR(100),
  author_name VARCHAR(255),
  batch VARCHAR(50),
  tags JSON,
  author_id INT NOT NULL,
  file_path VARCHAR(255),
  file_size BIGINT DEFAULT NULL,
  file_type VARCHAR(100) DEFAULT NULL,
  downloads INT DEFAULT 0,
  status ENUM('pending', 'approved','rejected') DEFAULT 'pending',
  rejectionReason TEXT DEFAULT NULL,
  views INT DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_author FOREIGN KEY (author_id) 
    REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_department (department),
  INDEX idx_batch (batch),
  INDEX idx_course (course),
  INDEX idx_author_id (author_id),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX idx_search (title, description, author_name)
);

-- Insert default super admin user (password: admin123)
INSERT IGNORE INTO users (
  firstName, 
  lastName, 
  email, 
  password, 
  role, 
  verified, 
  department,
  batch
) VALUES (
  'Super', 
  'Admin', 
  'admin@haramaya.edu.et', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
  'super-admin', 
  TRUE,
  'Computer Science',
  '2024'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_file_path ON projects(file_path);

-- Create views for common queries
CREATE OR REPLACE VIEW approved_projects AS
SELECT 
  p.*,
  u.firstName,
  u.lastName,
  u.email as author_email
FROM projects p
LEFT JOIN users u ON p.author_id = u.id
WHERE p.status = 'approved';

CREATE OR REPLACE VIEW pending_projects AS
SELECT 
  p.*,
  u.firstName,
  u.lastName,
  u.email as author_email
FROM projects p
LEFT JOIN users u ON p.author_id = u.id
WHERE p.status = 'pending';