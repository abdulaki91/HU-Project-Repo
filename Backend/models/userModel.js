import db from "../config/db.config.js";
import bcrypt from "bcryptjs";

// ✅ Create users table
export const createUsersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(100) NOT NULL,
      lastName VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      batch VARCHAR(50) DEFAULT NULL,
      department VARCHAR(100) DEFAULT NULL,
      verificationToken VARCHAR(255) DEFAULT NULL,
      role ENUM('admin', 'lecturer','student','super-admin') NOT NULL DEFAULT 'student',
      verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  return db.execute(sql);
};
// ✅ Insert new user
export const insertUser = async (
  firstName,
  lastName,
  email,
  password,
  batch,
  department,
  verificationToken,
  role = "lecturer"
) => {
  const sql = `
    INSERT INTO users 
    (firstName, lastName, email, password, batch, department, verificationToken, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  return db.execute(sql, [
    firstName,
    lastName,
    email,
    password,
    batch,
    department,
    verificationToken,
    role,
  ]);
};

// ✅ Get user by email
export const getUserByEmail = (email) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  return db.execute(sql, [email]);
};

// ✅ Get user by verification token
export const getUserByToken = async (token) => {
  const sql = `SELECT * FROM users WHERE verificationToken = ?`;
  const [rows] = await db.execute(sql, [token]);
  return rows;
};

// ✅ Verify user
export const verifyUser = (id) => {
  const sql = `
    UPDATE users 
    SET verified = TRUE, verificationToken = NULL 
    WHERE id = ?
  `;
  return db.execute(sql, [id]);
};

// ✅ Update user info
export const updateUser = async (
  id,
  {
    firstName,
    lastName,
    email,
    batch,
    department,
    verified,
    verificationToken,
    role,
  }
) => {
  const fields = [];
  const params = [];

  if (firstName) {
    fields.push("firstName = ?");
    params.push(firstName);
  }
  if (lastName) {
    fields.push("lastName = ?");
    params.push(lastName);
  }
  if (email) {
    fields.push("email = ?");
    params.push(email);
  }
  if (batch) {
    fields.push("batch = ?");
    params.push(batch);
  }
  if (department) {
    fields.push("department = ?");
    params.push(department);
  }
  if (typeof verified !== "undefined") {
    fields.push("verified = ?");
    params.push(verified);
  }
  if (verificationToken) {
    fields.push("verificationToken = ?");
    params.push(verificationToken);
  }
  if (role) {
    fields.push("role = ?");
    params.push(role);
  }

  if (fields.length === 0) throw new Error("No fields provided for update");

  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  params.push(id);
  return db.execute(sql, params);
};

// ✅ Change password
export const changePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const sql = `UPDATE users SET password = ? WHERE id = ?`;
  return db.execute(sql, [hashedPassword, id]);
};

// ✅ Login query
export const loginQuery = (email) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  return db.execute(sql, [email]);
};

export const findUserById = async (id) => {
  try {
    const sql = `SELECT firstName, lastName, email, batch, department, role, verified 
                 FROM users 
                 WHERE id = ?`;
    const [results] = await db.execute(sql, [id]);
    if (!results[0]) return null; // User not found
    return results[0];
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    throw new Error("Database error");
  }
};

// ✅ Get all projects created by a user (1-to-many relation)
export const getUserProjects = async (userId) => {
  const sql = `SELECT * FROM projects WHERE author_id = ? ORDER BY date DESC`;
  const [rows] = await db.execute(sql, [userId]);
  return rows;
};
