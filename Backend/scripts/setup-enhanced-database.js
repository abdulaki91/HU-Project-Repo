#!/usr/bin/env node

// scripts/setup-enhanced-database.js
import dotenv from "dotenv";
import {
  setupNewDatabase,
  getDatabaseStatus,
} from "../controllers/databaseController.js";

// Load environment variables
dotenv.config();

console.log("🚀 Enhanced Database Setup Script");
console.log("==================================");

async function main() {
  try {
    // Get current status
    console.log("\n📊 Checking current database status...");
    const currentStatus = await getDatabaseStatus();

    if (currentStatus.overall) {
      console.log("✅ Database is already properly configured!");
      console.log("\n📋 Current Status:");
      console.log(
        `- Connection: ${currentStatus.connection.connected ? "✅ Connected" : "❌ Disconnected"}`,
      );

      Object.entries(currentStatus.tables).forEach(([tableName, info]) => {
        console.log(
          `- Table '${tableName}': ${info.exists ? "✅" : "❌"} (${info.columns} columns, ${info.recordCount || 0} records)`,
        );
      });

      console.log(
        "\n💡 If you want to force recreation, delete the database first.",
      );
      return;
    }

    // Setup database
    console.log("\n🔧 Setting up database...");
    const setupResult = await setupNewDatabase();

    if (setupResult.success) {
      console.log("\n🎉 Database setup completed successfully!");

      console.log("\n📋 Setup Summary:");
      console.log(`- MySQL Version: ${setupResult.connection.version}`);
      console.log(`- Character Set: ${setupResult.connection.charset}`);
      console.log(`- Collation: ${setupResult.connection.collation}`);

      Object.entries(setupResult.tables).forEach(([tableName, info]) => {
        console.log(
          `- Table '${tableName}': ${info.status === "created" ? "🆕 Created" : "✅ Verified"}`,
        );
      });

      console.log("\n🚀 Your database is ready for use!");
      console.log("💡 Next steps:");
      console.log("   1. Start the server: npm start");
      console.log("   2. Seed sample data: npm run seed");
      console.log("   3. Access the application: http://localhost:5173");
    } else {
      console.error("\n❌ Database setup completed with errors:");
      setupResult.errors.forEach((error) => {
        console.error(
          `   - ${error.table ? `[${error.table}]` : ""} ${error.error || error}`,
        );
      });

      console.log("\n🔧 Troubleshooting:");
      console.log("   1. Check MySQL server is running");
      console.log("   2. Verify database credentials in .env file");
      console.log("   3. Ensure user has CREATE DATABASE privileges");
      console.log("   4. Check MySQL error logs for details");

      process.exit(1);
    }
  } catch (error) {
    console.error("\n💥 Setup failed with error:", error.message);
    console.error("\n🔧 Common solutions:");
    console.error(
      "   1. Make sure MySQL is running: brew services start mysql (macOS) or sudo service mysql start (Linux)",
    );
    console.error("   2. Check connection settings in .env file");
    console.error("   3. Verify database user permissions");
    console.error("   4. Try connecting manually: mysql -u root -p");

    process.exit(1);
  }
}

// Handle script arguments
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: npm run setup-enhanced-db [options]

Options:
  --help, -h     Show this help message
  --force, -f    Force recreation of existing database
  --status, -s   Show current database status only

Examples:
  npm run setup-enhanced-db          # Setup database if needed
  npm run setup-enhanced-db --status # Check current status
  npm run setup-enhanced-db --force  # Force complete recreation

Environment Variables:
  DB_HOST        Database host (default: localhost)
  DB_USER        Database user (default: root)
  DB_PASS        Database password (default: empty)
  DB_NAME        Database name (default: projectrepo)
  DB_PORT        Database port (default: 3306)
`);
  process.exit(0);
}

if (args.includes("--status") || args.includes("-s")) {
  // Status only mode
  getDatabaseStatus()
    .then((status) => {
      console.log("\n📊 Database Status:");
      console.log(JSON.stringify(status, null, 2));
      process.exit(status.overall ? 0 : 1);
    })
    .catch((error) => {
      console.error("Failed to get status:", error.message);
      process.exit(1);
    });
} else {
  // Run main setup
  main();
}
