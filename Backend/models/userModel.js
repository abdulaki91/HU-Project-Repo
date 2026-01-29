import db from "../config/db.config.js";
import bcrypt from "bcryptjs";

// ✅ Create users table with additional fields
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
  role = "student",
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
  },
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
    const sql = `SELECT id, firstName, lastName, email, batch, department, role, verified, created_at 
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
// ✅ Update last login timestamp
export const updateLastLogin = (id) => {
  const sql = `UPDATE users SET lastLogin = NOW() WHERE id = ?`;
  return db.execute(sql, [id]);
};

// ✅ Save password reset token
export const savePasswordResetToken = (id, resetToken, resetTokenExpiry) => {
  const sql = `
    UPDATE users 
    SET resetToken = ?, resetTokenExpiry = ? 
    WHERE id = ?
  `;
  return db.execute(sql, [resetToken, resetTokenExpiry, id]);
};

// ✅ Get user by reset token
export const getUserByResetToken = async (resetToken) => {
  const sql = `
    SELECT id, firstName, lastName, email, resetTokenExpiry 
    FROM users 
    WHERE resetToken = ? AND resetTokenExpiry > NOW()
  `;
  const [rows] = await db.execute(sql, [resetToken]);
  return rows[0];
};

// ✅ Update password and clear reset token
export const updatePasswordAndClearResetToken = (id, hashedPassword) => {
  const sql = `
    UPDATE users 
    SET password = ?, resetToken = NULL, resetTokenExpiry = NULL 
    WHERE id = ?
  `;
  return db.execute(sql, [hashedPassword, id]);
};

// ✅ Get users with pagination
export const getUsersWithPagination = async (
  page = 1,
  limit = 10,
  filters = {},
) => {
  const offset = (page - 1) * limit;
  let whereClause = "WHERE 1=1";
  const params = [];

  if (filters.department) {
    whereClause += " AND department = ?";
    params.push(filters.department);
  }

  if (filters.batch) {
    whereClause += " AND batch = ?";
    params.push(filters.batch);
  }

  if (filters.role) {
    whereClause += " AND role = ?";
    params.push(filters.role);
  }

  if (filters.verified !== undefined) {
    whereClause += " AND verified = ?";
    params.push(filters.verified);
  }

  if (filters.search) {
    whereClause += " AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)";
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
  const dataSql = `
    SELECT id, firstName, lastName, email, batch, department, role, verified, 
           lastLogin, status, created_at, updated_at
    FROM users 
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [countResult] = await db.execute(countSql, params);
  const [dataResult] = await db.execute(dataSql, [...params, limit, offset]);

  return {
    users: dataResult,
    total: countResult[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult[0].total / limit),
  };
};

// ✅ Search users
export const searchUsers = async (searchTerm, limit = 10) => {
  const sql = `
    SELECT id, firstName, lastName, email, department, batch, role
    FROM users 
    WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?) 
    AND verified = TRUE AND status = 'active'
    ORDER BY firstName, lastName
    LIMIT ?
  `;
  const searchPattern = `%${searchTerm}%`;
  const [rows] = await db.execute(sql, [
    searchPattern,
    searchPattern,
    searchPattern,
    limit,
  ]);
  return rows;
};

// ✅ Update user status
export const updateUserStatus = (id, status) => {
  const sql = `UPDATE users SET status = ? WHERE id = ?`;
  return db.execute(sql, [status, id]);
};

// ✅ Get user statistics
export const getUserStats = async () => {
  const sql = `
    SELECT 
      COUNT(*) as totalUsers,
      SUM(CASE WHEN verified = TRUE THEN 1 ELSE 0 END) as verifiedUsers,
      SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeUsers,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as newUsersThisMonth
    FROM users
  `;
  const [rows] = await db.execute(sql);
  return rows[0];
};

// ✅ Delete user account (soft delete)
export const deleteUserAccount = (id) => {
  const sql = `UPDATE users SET status = 'inactive', email = CONCAT(email, '_deleted_', id) WHERE id = ?`;
  return db.execute(sql, [id]);
};

// ✅ Get user activity summary
export const getUserActivity = async (userId) => {
  const sql = `
    SELECT 
      u.id, u.firstName, u.lastName, u.email, u.lastLogin, u.created_at,
      COUNT(p.id) as totalProjects,
      SUM(CASE WHEN p.status = 'approved' THEN 1 ELSE 0 END) as approvedProjects,
      SUM(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) as pendingProjects,
      SUM(p.downloads) as totalDownloads,
      SUM(p.views) as totalViews
    FROM users u
    LEFT JOIN projects p ON u.id = p.author_id
    WHERE u.id = ?
    GROUP BY u.id
  `;
  const [rows] = await db.execute(sql, [userId]);
  return rows[0];
};
