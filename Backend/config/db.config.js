import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database configuration with valid MySQL2 options only
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "projectrepo",
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
};

console.log(
  `🔄 Connecting to MySQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
);

const db = mysql.createPool(dbConfig);

// Test connection with retry logic
const testConnection = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await db.getConnection();
      console.log("✅ Connected to MySQL successfully!");
      connection.release();
      return true;
    } catch (err) {
      console.error(
        `❌ MySQL connection attempt ${i + 1}/${retries} failed:`,
        err.message,
      );

      if (i === retries - 1) {
        console.error("💡 Troubleshooting tips:");
        console.error("1. Make sure MySQL server is running");
        console.error("2. Check database credentials in .env file");
        console.error(
          "3. Verify database exists or run: npm run setup-local-db",
        );
        console.error("4. For local development, use: DB_HOST=localhost");
        console.error("5. For Docker deployment, use: DB_HOST=mysql");
        throw err;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

// Initialize connection
testConnection().catch((err) => {
  console.error("❌ Failed to establish database connection:", err.message);
});

export default db;
