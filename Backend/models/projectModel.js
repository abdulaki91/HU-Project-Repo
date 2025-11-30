// models/projectModel.js
import db from "../config/db.config.js";

export const createProjectsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      course VARCHAR(100),
      batch VARCHAR(50),
      tags JSON,
      author_id INT NOT NULL,
      file_path VARCHAR(255),  -- <--- ADD THIS
      downloads INT DEFAULT 0,
      status ENUM('pending', 'approved','rejected') DEFAULT 'pending',
      views INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_author FOREIGN KEY (author_id) 
        REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  return db.execute(sql);
};

export const getProjectById = (id) =>
  db.execute("SELECT * FROM projects WHERE id = ?", [id]);

export const createProject = (project) => {
  const sql = `
    INSERT INTO projects 
    (title, description, course, batch, tags, author_id, file_path, downloads, views)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let {
    title,
    description,
    course,
    batch,
    tags,
    author_id,
    file_path,
    downloads,
    views,
  } = project;

  // Ensure no undefined bind params (use null where appropriate)
  if (typeof tags === "undefined" || tags === null) tags = [];
  if (typeof file_path === "undefined") file_path = null;
  if (typeof downloads === "undefined" || downloads === null) downloads = 0;
  if (typeof views === "undefined" || views === null) views = 0;

  return db.execute(sql, [
    title,
    description,
    course,
    batch,
    JSON.stringify(tags),
    author_id,
    file_path,
    downloads,
    views,
  ]);
};

export const updateProject = (id, project) => {
  const sql = `
    UPDATE projects SET
      title = ?, description = ?, course = ?, batch = ?, tags = ?, author_id = ?, file_path = ?, downloads = ?, views = ?
    WHERE id = ?
  `;
  const {
    title,
    description,
    course,
    batch,
    tags,
    author_id,
    file_path,
    downloads,
    views,
  } = project;
  return db.execute(sql, [
    title,
    description,
    course,
    batch,
    JSON.stringify(tags),
    author_id,
    file_path,
    downloads,
    views,
    id,
  ]);
};
export const deleteProject = (id) => {
  return db.execute("DELETE FROM projects WHERE id = ?", [id]);
};

export const getUserProjects = async (userId, filters = {}) => {
  let sql = "SELECT * FROM projects WHERE author_id = ?";
  const params = [userId];

  if (filters.course && filters.course !== "all") {
    sql += " AND course = ?";
    params.push(filters.course);
  }

  if (filters.batch && filters.batch !== "all") {
    sql += " AND batch = ?";
    params.push(filters.batch);
  }

  if (filters.date) {
    sql += " AND date >= ?";
    params.push(filters.date);
  }

  sql += " ORDER BY date DESC";

  const [rows] = await db.execute(sql, params);
  return rows.map((p) => ({
    ...p,
    tags: typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags,
  }));
};

export const incrementDownloads = (projectId) => {
  const sql = `UPDATE projects SET downloads = downloads + 1 WHERE id = ?`;
  return db.execute(sql, [projectId]);
};
