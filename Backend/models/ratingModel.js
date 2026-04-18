// models/ratingModel.js
import db from "../config/db.config.js";

// ✅ Create ratings table
export const createRatingsTable = () => {
  const sql = `
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
  `;
  return db.execute(sql);
};

// ✅ Add or update a rating
export const addOrUpdateRating = async (
  projectId,
  userId,
  rating,
  review = null,
) => {
  const sql = `
    INSERT INTO ratings (project_id, user_id, rating, review)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      rating = VALUES(rating),
      review = VALUES(review),
      updated_at = CURRENT_TIMESTAMP
  `;
  return db.execute(sql, [projectId, userId, rating, review]);
};

// ✅ Get user's rating for a specific project
export const getUserRating = async (projectId, userId) => {
  const sql = `
    SELECT rating, review, created_at, updated_at
    FROM ratings
    WHERE project_id = ? AND user_id = ?
  `;
  const [rows] = await db.execute(sql, [projectId, userId]);
  return rows[0] || null;
};

// ✅ Get project rating statistics
export const getProjectRatingStats = async (projectId) => {
  const sql = `
    SELECT 
      COUNT(*) as totalRatings,
      AVG(rating) as averageRating,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStars,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStars,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStars,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStars,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStar
    FROM ratings
    WHERE project_id = ?
  `;
  const [rows] = await db.execute(sql, [projectId]);
  const stats = rows[0];

  return {
    totalRatings: parseInt(stats.totalRatings) || 0,
    averageRating: parseFloat(stats.averageRating) || 0,
    distribution: {
      5: parseInt(stats.fiveStars) || 0,
      4: parseInt(stats.fourStars) || 0,
      3: parseInt(stats.threeStars) || 0,
      2: parseInt(stats.twoStars) || 0,
      1: parseInt(stats.oneStar) || 0,
    },
  };
};

// ✅ Get project ratings with user details
export const getProjectRatings = async (projectId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT 
      r.id,
      r.rating,
      r.review,
      r.created_at,
      r.updated_at,
      u.firstName,
      u.lastName,
      u.department,
      u.batch
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    WHERE r.project_id = ?
    ORDER BY ${sortBy} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.execute(sql, [projectId, limit, offset]);

  // Get total count for pagination
  const countSql = `SELECT COUNT(*) as total FROM ratings WHERE project_id = ?`;
  const [countRows] = await db.execute(countSql, [projectId]);
  const total = countRows[0].total;

  return {
    ratings: rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      review: row.review,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        name: `${row.firstName} ${row.lastName}`,
        department: row.department,
        batch: row.batch,
      },
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ✅ Delete a rating
export const deleteRating = async (projectId, userId) => {
  const sql = `DELETE FROM ratings WHERE project_id = ? AND user_id = ?`;
  return db.execute(sql, [projectId, userId]);
};

// ✅ Get user's recent ratings
export const getUserRecentRatings = async (userId, limit = 10) => {
  const sql = `
    SELECT 
      r.rating,
      r.review,
      r.created_at,
      p.id as project_id,
      p.title as project_title,
      p.author_name
    FROM ratings r
    JOIN projects p ON r.project_id = p.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
    LIMIT ?
  `;
  const [rows] = await db.execute(sql, [userId, limit]);
  return rows;
};

// ✅ Get top rated projects
export const getTopRatedProjects = async (limit = 10, minRatings = 3) => {
  const sql = `
    SELECT 
      p.*,
      AVG(r.rating) as averageRating,
      COUNT(r.rating) as totalRatings
    FROM projects p
    JOIN ratings r ON p.id = r.project_id
    WHERE p.status = 'approved'
    GROUP BY p.id
    HAVING COUNT(r.rating) >= ?
    ORDER BY AVG(r.rating) DESC, COUNT(r.rating) DESC
    LIMIT ?
  `;
  const [rows] = await db.execute(sql, [minRatings, limit]);
  return rows.map((row) => ({
    ...row,
    averageRating: parseFloat(row.averageRating),
    totalRatings: parseInt(row.totalRatings),
  }));
};
