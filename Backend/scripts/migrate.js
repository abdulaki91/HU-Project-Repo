import db from "../config/db.config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration tracking table
const createMigrationsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await db.execute(sql);
};

// Get executed migrations
const getExecutedMigrations = async () => {
  try {
    const [rows] = await db.execute(
      "SELECT filename FROM migrations ORDER BY executed_at",
    );
    return rows.map((row) => row.filename);
  } catch (error) {
    return [];
  }
};

// Record migration execution
const recordMigration = async (filename) => {
  await db.execute("INSERT INTO migrations (filename) VALUES (?)", [filename]);
};

// Migration files
const migrations = [
  {
    filename: "001_create_users_table.sql",
    sql: `
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
    `,
  },
  {
    filename: "002_create_projects_table.sql",
    sql: `
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
    `,
  },
  {
    filename: "003_create_comments_table.sql",
    sql: `
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        parent_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_comment_project FOREIGN KEY (project_id) 
          REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_comment_user FOREIGN KEY (user_id) 
          REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) 
          REFERENCES comments(id) ON DELETE CASCADE,
        INDEX idx_project_id (project_id),
        INDEX idx_user_id (user_id),
        INDEX idx_parent_id (parent_id)
      );
    `,
  },
  {
    filename: "004_create_ratings_table.sql",
    sql: `
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_project (user_id, project_id),
        CONSTRAINT fk_rating_project FOREIGN KEY (project_id) 
          REFERENCES projects(id) ON DELETE CASCADE,
        CONSTRAINT fk_rating_user FOREIGN KEY (user_id) 
          REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_project_id (project_id),
        INDEX idx_user_id (user_id),
        INDEX idx_rating (rating)
      );
    `,
  },
  {
    filename: "005_create_notifications_table.sql",
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('project_approved', 'project_rejected', 'comment_added', 'rating_added', 'system') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        data JSON DEFAULT NULL,
        read_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_notification_user FOREIGN KEY (user_id) 
          REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_type (type),
        INDEX idx_read_at (read_at),
        INDEX idx_created_at (created_at)
      );
    `,
  },
  {
    filename: "006_create_audit_logs_table.sql",
    sql: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id INT DEFAULT NULL,
        old_values JSON DEFAULT NULL,
        new_values JSON DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        user_agent TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_audit_user FOREIGN KEY (user_id) 
          REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_resource (resource_type, resource_id),
        INDEX idx_created_at (created_at)
      );
    `,
  },
];

// Run migrations
const runMigrations = async () => {
  try {
    console.log("🚀 Starting database migrations...");

    // Create migrations tracking table
    await createMigrationsTable();

    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log(`📋 Found ${executedMigrations.length} executed migrations`);

    // Run pending migrations
    let executedCount = 0;

    for (const migration of migrations) {
      if (!executedMigrations.includes(migration.filename)) {
        console.log(`⚡ Running migration: ${migration.filename}`);

        try {
          // Execute migration SQL
          await db.execute(migration.sql);

          // Record migration
          await recordMigration(migration.filename);

          console.log(`✅ Completed migration: ${migration.filename}`);
          executedCount++;
        } catch (error) {
          console.error(`❌ Failed migration: ${migration.filename}`, error);
          throw error;
        }
      } else {
        console.log(
          `⏭️  Skipping migration: ${migration.filename} (already executed)`,
        );
      }
    }

    if (executedCount === 0) {
      console.log("✨ Database is up to date! No migrations needed.");
    } else {
      console.log(`🎉 Successfully executed ${executedCount} migrations!`);
    }
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  }
};

// Rollback last migration (basic implementation)
const rollbackMigration = async () => {
  try {
    console.log("🔄 Rolling back last migration...");

    const [rows] = await db.execute(
      "SELECT filename FROM migrations ORDER BY executed_at DESC LIMIT 1",
    );

    if (rows.length === 0) {
      console.log("ℹ️  No migrations to rollback");
      return;
    }

    const lastMigration = rows[0].filename;
    console.log(`⚡ Rolling back: ${lastMigration}`);

    // Remove from migrations table
    await db.execute("DELETE FROM migrations WHERE filename = ?", [
      lastMigration,
    ]);

    console.log(`✅ Rolled back: ${lastMigration}`);
    console.log(
      "⚠️  Note: You may need to manually drop tables/columns created by this migration",
    );
  } catch (error) {
    console.error("💥 Rollback failed:", error);
    process.exit(1);
  }
};

// CLI interface
const command = process.argv[2];

switch (command) {
  case "up":
    runMigrations().then(() => process.exit(0));
    break;
  case "down":
    rollbackMigration().then(() => process.exit(0));
    break;
  case "status":
    (async () => {
      await createMigrationsTable();
      const executed = await getExecutedMigrations();
      console.log("📊 Migration Status:");
      migrations.forEach((migration) => {
        const status = executed.includes(migration.filename) ? "✅" : "⏳";
        console.log(`${status} ${migration.filename}`);
      });
      process.exit(0);
    })();
    break;
  default:
    console.log(`
Usage: node migrate.js [command]

Commands:
  up      Run pending migrations
  down    Rollback last migration
  status  Show migration status

Examples:
  node migrate.js up
  node migrate.js status
  node migrate.js down
    `);
    process.exit(0);
}

export { runMigrations, rollbackMigration };
