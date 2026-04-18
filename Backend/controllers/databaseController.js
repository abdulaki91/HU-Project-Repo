// controllers/databaseController.js
import mysql from "mysql2/promise";
import db from "../config/db.config.js";
import { createUsersTable } from "../models/userModel.js";
import { createProjectsTable } from "../models/projectModel.js";
import { createRatingsTable } from "../models/ratingModel.js";

/**
 * Enhanced database initialization controller
 * Ensures proper setup on new databases with comprehensive error handling
 */

// Check if database exists and create if needed
export const ensureDatabaseExists = async () => {
  try {
    const dbName = process.env.DB_NAME || "projectrepo";

    // Create connection without specifying database
    const tempConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      port: parseInt(process.env.DB_PORT) || 3306,
    };

    const tempConnection = await mysql.createConnection(tempConfig);

    // Create database if it doesn't exist
    await tempConnection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`✅ Database '${dbName}' ensured to exist`);

    await tempConnection.end();
    return true;
  } catch (error) {
    console.error("❌ Failed to ensure database exists:", error.message);
    throw error;
  }
};

// Check database connection and basic setup
export const checkDatabaseConnection = async () => {
  try {
    const connection = await db.getConnection();

    // Test basic query
    const [rows] = await connection.execute("SELECT 1 as test");

    // Check database version and settings
    const [versionRows] = await connection.execute(
      "SELECT VERSION() as version",
    );
    const [charsetRows] = await connection.execute(
      "SELECT @@character_set_database as charset, @@collation_database as collation",
    );

    connection.release();

    console.log("✅ Database connection successful");
    console.log(`📊 MySQL Version: ${versionRows[0].version}`);
    console.log(`🔤 Character Set: ${charsetRows[0].charset}`);
    console.log(`🔤 Collation: ${charsetRows[0].collation}`);

    return {
      connected: true,
      version: versionRows[0].version,
      charset: charsetRows[0].charset,
      collation: charsetRows[0].collation,
    };
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
};

// Check if a table exists
export const checkTableExists = async (tableName) => {
  try {
    const [rows] = await db.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?",
      [process.env.DB_NAME || "projectrepo", tableName],
    );
    return rows[0].count > 0;
  } catch (error) {
    console.error(
      `❌ Failed to check if table '${tableName}' exists:`,
      error.message,
    );
    return false;
  }
};

// Get table structure information
export const getTableInfo = async (tableName) => {
  try {
    const [columns] = await db.execute(`DESCRIBE \`${tableName}\``);
    const [indexes] = await db.execute(`SHOW INDEX FROM \`${tableName}\``);

    return {
      columns: columns.map((col) => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key,
        default: col.Default,
        extra: col.Extra,
      })),
      indexes: indexes.map((idx) => ({
        name: idx.Key_name,
        column: idx.Column_name,
        unique: idx.Non_unique === 0,
      })),
    };
  } catch (error) {
    console.error(
      `❌ Failed to get table info for '${tableName}':`,
      error.message,
    );
    return null;
  }
};

// Create all tables with proper error handling and validation
export const initializeAllTables = async () => {
  const tables = [
    { name: "users", createFunction: createUsersTable },
    { name: "projects", createFunction: createProjectsTable },
    { name: "ratings", createFunction: createRatingsTable },
  ];

  const results = {
    success: true,
    tables: {},
    errors: [],
  };

  for (const table of tables) {
    try {
      console.log(`🔄 Initializing ${table.name} table...`);

      // Check if table exists
      const exists = await checkTableExists(table.name);

      if (exists) {
        console.log(
          `ℹ️  Table '${table.name}' already exists, verifying structure...`,
        );
        const info = await getTableInfo(table.name);
        results.tables[table.name] = {
          status: "exists",
          columns: info?.columns?.length || 0,
          indexes: info?.indexes?.length || 0,
        };
      } else {
        console.log(`🆕 Creating new table '${table.name}'...`);
        await table.createFunction();
        results.tables[table.name] = {
          status: "created",
          columns: 0,
          indexes: 0,
        };
      }

      console.log(`✅ Table '${table.name}' ready`);
    } catch (error) {
      console.error(
        `❌ Failed to initialize table '${table.name}':`,
        error.message,
      );
      results.errors.push({
        table: table.name,
        error: error.message,
      });
      results.success = false;
    }
  }

  return results;
};

// Comprehensive database setup for new installations
export const setupNewDatabase = async () => {
  try {
    console.log("🚀 Starting comprehensive database setup...");

    // Step 1: Ensure database exists
    console.log("📋 Step 1: Ensuring database exists...");
    await ensureDatabaseExists();

    // Step 2: Test connection
    console.log("📋 Step 2: Testing database connection...");
    const connectionInfo = await checkDatabaseConnection();

    // Step 3: Initialize all tables
    console.log("📋 Step 3: Initializing database tables...");
    const tableResults = await initializeAllTables();

    // Step 4: Verify setup
    console.log("📋 Step 4: Verifying database setup...");
    const verification = await verifyDatabaseSetup();

    const setupResult = {
      success: tableResults.success && verification.success,
      connection: connectionInfo,
      tables: tableResults.tables,
      verification: verification,
      errors: [...tableResults.errors, ...verification.errors],
    };

    if (setupResult.success) {
      console.log("🎉 Database setup completed successfully!");
    } else {
      console.error(
        "❌ Database setup completed with errors:",
        setupResult.errors,
      );
    }

    return setupResult;
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    throw error;
  }
};

// Verify database setup is complete and functional
export const verifyDatabaseSetup = async () => {
  const results = {
    success: true,
    checks: {},
    errors: [],
  };

  try {
    // Check all required tables exist
    const requiredTables = ["users", "projects", "ratings"];

    for (const tableName of requiredTables) {
      try {
        const exists = await checkTableExists(tableName);
        const info = exists ? await getTableInfo(tableName) : null;

        results.checks[tableName] = {
          exists,
          columns: info?.columns?.length || 0,
          indexes: info?.indexes?.length || 0,
          valid: exists && info?.columns?.length > 0,
        };

        if (!exists) {
          results.errors.push(`Table '${tableName}' does not exist`);
          results.success = false;
        }
      } catch (error) {
        results.errors.push(
          `Failed to verify table '${tableName}': ${error.message}`,
        );
        results.success = false;
      }
    }

    // Test basic operations
    try {
      // Test users table
      const [userCount] = await db.execute(
        "SELECT COUNT(*) as count FROM users",
      );
      results.checks.users.recordCount = userCount[0].count;

      // Test projects table
      const [projectCount] = await db.execute(
        "SELECT COUNT(*) as count FROM projects",
      );
      results.checks.projects.recordCount = projectCount[0].count;

      // Test ratings table
      const [ratingCount] = await db.execute(
        "SELECT COUNT(*) as count FROM ratings",
      );
      results.checks.ratings.recordCount = ratingCount[0].count;

      console.log(
        `📊 Database contains: ${userCount[0].count} users, ${projectCount[0].count} projects, ${ratingCount[0].count} ratings`,
      );
    } catch (error) {
      results.errors.push(`Failed to count records: ${error.message}`);
      results.success = false;
    }
  } catch (error) {
    results.errors.push(`Verification failed: ${error.message}`);
    results.success = false;
  }

  return results;
};

// Get comprehensive database status
export const getDatabaseStatus = async () => {
  try {
    const connection = await checkDatabaseConnection();
    const verification = await verifyDatabaseSetup();

    return {
      connection,
      tables: verification.checks,
      overall: verification.success,
      errors: verification.errors,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      connection: { connected: false },
      tables: {},
      overall: false,
      errors: [error.message],
      timestamp: new Date().toISOString(),
    };
  }
};

// Express route handlers
export const handleDatabaseStatus = async (req, res) => {
  try {
    const status = await getDatabaseStatus();

    res.status(status.overall ? 200 : 500).json({
      success: status.overall,
      message: status.overall ? "Database is healthy" : "Database has issues",
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get database status",
      error: error.message,
    });
  }
};

export const handleDatabaseSetup = async (req, res) => {
  try {
    const result = await setupNewDatabase();

    res.status(result.success ? 200 : 500).json({
      success: result.success,
      message: result.success
        ? "Database setup completed successfully"
        : "Database setup completed with errors",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database setup failed",
      error: error.message,
    });
  }
};

export default {
  ensureDatabaseExists,
  checkDatabaseConnection,
  checkTableExists,
  getTableInfo,
  initializeAllTables,
  setupNewDatabase,
  verifyDatabaseSetup,
  getDatabaseStatus,
  handleDatabaseStatus,
  handleDatabaseSetup,
};
