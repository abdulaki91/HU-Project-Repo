import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function setupDatabase() {
  let connection;

  try {
    // First connect without specifying database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      port: process.env.DB_PORT,
    });

    console.log("Connected to MySQL server");

    // Create database if it doesn't exist
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
    );
    console.log(`Database '${process.env.DB_NAME}' created or already exists`);

    // Close connection and reconnect with database specified
    await connection.end();

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
    });

    console.log(`Connected to database '${process.env.DB_NAME}'`);

    // Create users table
    const createUsersTable = `
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
    `;

    await connection.execute(createUsersTable);
    console.log("Users table created successfully");

    // Create projects table
    const createProjectsTable = `
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
    `;

    await connection.execute(createProjectsTable);
    console.log("Projects table created successfully");

    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
