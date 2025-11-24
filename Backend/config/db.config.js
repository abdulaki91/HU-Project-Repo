import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection once at startup
(async () => {
  try {
    await db.getConnection();
    console.log("✅ Connected to MySQL successfully!");
  } catch (err) {
    console.error("❌ Failed to connect to MySQL:", err);
  }
})();

export default db;
