#!/usr/bin/env node

/**
 * Local Database Setup Script
 * Sets up MySQL database for local development
 */

import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration for local development
const config = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "", // Default XAMPP/WAMP password is empty
};

const dbName = "projectrepo";

async function setupDatabase() {
  let connection;

  try {
    console.log("🔄 Connecting to MySQL server...");

    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection(config);

    console.log("✅ Connected to MySQL server");

    // Create database if it doesn't exist
    console.log(`🔄 Creating database '${dbName}' if it doesn't exist...`);
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`✅ Database '${dbName}' is ready`);

    // Switch to the created database
    await connection.execute(`USE \`${dbName}\``);

    // Read and execute the initialization SQL
    const initSqlPath = path.join(__dirname, "init.sql");
    if (fs.existsSync(initSqlPath)) {
      console.log("🔄 Running database initialization script...");
      const initSql = fs.readFileSync(initSqlPath, "utf8");

      // Split SQL commands and execute them one by one
      const commands = initSql
        .split(";")
        .map((cmd) => cmd.trim())
        .filter((cmd) => cmd.length > 0);

      for (const command of commands) {
        if (command.toLowerCase().startsWith("use ")) {
          // Skip USE commands as we're already connected to the right database
          continue;
        }
        try {
          await connection.execute(command);
        } catch (error) {
          // Ignore errors for commands that might already exist
          if (!error.message.includes("already exists")) {
            console.warn(`Warning: ${error.message}`);
          }
        }
      }

      console.log("✅ Database initialization completed");
    } else {
      console.log("⚠️  No init.sql file found, creating basic tables...");

      // Create basic tables if init.sql doesn't exist
      await createBasicTables(connection);
    }

    // Verify tables exist
    const [tables] = await connection.execute("SHOW TABLES");
    console.log(
      "📋 Available tables:",
      tables.map((row) => Object.values(row)[0]),
    );

    console.log("🎉 Local database setup completed successfully!");
    console.log("");
    console.log("📝 Database Details:");
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${dbName}`);
    console.log(`   User: ${config.user}`);
    console.log("");
    console.log("🚀 You can now start the backend server with: npm run dev");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    console.log("");
    console.log("🔧 Troubleshooting:");
    console.log("1. Make sure MySQL server is running");
    console.log("2. Check if you can connect with: mysql -u root -p");
    console.log("3. Verify MySQL is running on port 3306");
    console.log("4. If using XAMPP/WAMP, start MySQL service");
    console.log("5. Update DB_USER and DB_PASS in Backend/.env if needed");
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function createBasicTables(connection) {
  // Create users table
  await connection.execute(`
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
    )
  `);

  // Create projects table
  await connection.execute(`
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
    )
  `);

  // Insert default super admin user (password: admin123)
  await connection.execute(`
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
    )
  `);

  console.log("✅ Basic tables created");
  console.log(
    "✅ Default super admin user created (admin@haramaya.edu.et / admin123)",
  );
}

// Run the setup
setupDatabase();
