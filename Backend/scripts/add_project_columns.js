import db from "../config/db.config.js";

async function ensureColumn(table, column, definition) {
  const [rows] = await db.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [process.env.DB_NAME, table, column]
  );

  if (rows.length === 0) {
    console.log(`Adding column ${column} to ${table}...`);
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`Added column ${column}`);
  } else {
    console.log(`Column ${column} already exists on ${table}`);
  }
}

(async () => {
  try {
    await ensureColumn("projects", "department", "VARCHAR(100) NULL");
    await ensureColumn("projects", "author_name", "VARCHAR(255) NULL");
    console.log("Migration finished");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed", err);
    process.exit(1);
  }
})();
