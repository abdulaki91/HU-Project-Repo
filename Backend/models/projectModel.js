// models/projectModel.js
import db from "../config/db.config.js";
import fs from "fs";
import path from "path";

export const createProjectsTable = () => {
  const sql = `
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
    (title, description, course, department, author_name, batch, tags, author_id, file_path, downloads, views)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let {
    title,
    description,
    course,
    department,
    author_name,
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
  if (typeof department === "undefined") department = null;
  if (typeof author_name === "undefined") author_name = null;

  return db.execute(sql, [
    title,
    description,
    course,
    department,
    author_name,
    batch,
    JSON.stringify(tags),
    author_id,
    file_path,
    downloads,
    views,
  ]);
};

export const updateProject = async (id, project) => {
  // Build dynamic update statement from provided fields
  const fields = [];
  const params = [];

  if (project.title !== undefined) {
    fields.push("title = ?");
    params.push(project.title);
  }
  if (project.description !== undefined) {
    fields.push("description = ?");
    params.push(project.description);
  }
  if (project.course !== undefined) {
    fields.push("course = ?");
    params.push(project.course);
  }
  if (project.batch !== undefined) {
    fields.push("batch = ?");
    params.push(project.batch);
  }
  if (project.tags !== undefined) {
    fields.push("tags = ?");
    params.push(JSON.stringify(project.tags));
  }
  if (project.author_id !== undefined) {
    fields.push("author_id = ?");
    params.push(project.author_id);
  }
  if (project.author_name !== undefined) {
    fields.push("author_name = ?");
    params.push(project.author_name);
  }
  if (project.department !== undefined) {
    fields.push("department = ?");
    params.push(project.department);
  }
  if (project.file_path !== undefined) {
    fields.push("file_path = ?");
    params.push(project.file_path);
  }
  if (project.downloads !== undefined) {
    fields.push("downloads = ?");
    params.push(project.downloads);
  }
  if (project.status !== undefined) {
    fields.push("status = ?");
    params.push(project.status);
  }
  if (project.views !== undefined) {
    fields.push("views = ?");
    params.push(project.views);
  }

  if (fields.length === 0) {
    // nothing to update
    return Promise.resolve();
  }

  const sql = `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`;
  params.push(id);
  return db.execute(sql, params);
};
export const deleteProject = (id) => {
  return db.execute("DELETE FROM projects WHERE id = ?", [id]);
};

export const getUserProjects = async (filters = {}) => {
  // Build dynamic WHERE clause based on filters; fetch projects from all users
  let sql = "SELECT * FROM projects";
  const conditions = [];
  const params = [];

  if (filters.course && filters.course !== "all") {
    conditions.push("course = ?");
    params.push(filters.course);
  }

  if (filters.batch && filters.batch !== "all") {
    conditions.push("batch = ?");
    params.push(filters.batch);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY created_at DESC";

  const [rows] = await db.execute(sql, params);

  // Enrich rows: parse tags and compute file size (in bytes) when possible
  const projects = await Promise.all(
    rows.map(async (p) => {
      let tags = p.tags;
      if (typeof tags === "string") {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          tags = tags
            .replace(/\[|\]|\"/g, "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
      if (!Array.isArray(tags)) tags = [];

      let file_size = null;
      if (p.file_path) {
        try {
          const uploadsDir = path.resolve("uploads", "projects");
          const requestedPath = path.resolve(p.file_path);
          if (
            requestedPath.startsWith(uploadsDir) &&
            fs.existsSync(requestedPath)
          ) {
            const stat = await fs.promises.stat(requestedPath);
            file_size = stat.size;
          }
        } catch (e) {
          // ignore file size failures
          file_size = null;
        }
      }

      return {
        ...p,
        tags,
        file_size,
      };
    })
  );

  return projects;
};

export const getProjectsByAuthor = async (authorId, filters = {}) => {
  let sql = "SELECT * FROM projects WHERE author_id = ?";
  const params = [authorId];

  if (filters.course && filters.course !== "all") {
    sql += " AND course = ?";
    params.push(filters.course);
  }

  if (filters.batch && filters.batch !== "all") {
    sql += " AND batch = ?";
    params.push(filters.batch);
  }

  sql += " ORDER BY created_at DESC";

  const [rows] = await db.execute(sql, params);

  // Enrich rows: parse tags and compute file size (in bytes) when possible
  const projects = await Promise.all(
    rows.map(async (p) => {
      let tags = p.tags;
      if (typeof tags === "string") {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          tags = tags
            .replace(/\[|\]|\"/g, "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        }
      }
      if (!Array.isArray(tags)) tags = [];

      let file_size = null;
      if (p.file_path) {
        try {
          const uploadsDir = path.resolve("uploads", "projects");
          const requestedPath = path.resolve(p.file_path);
          if (
            requestedPath.startsWith(uploadsDir) &&
            fs.existsSync(requestedPath)
          ) {
            const stat = await fs.promises.stat(requestedPath);
            file_size = stat.size;
          }
        } catch (e) {
          file_size = null;
        }
      }

      return { ...p, tags, file_size };
    })
  );

  return projects;
};

export const incrementDownloads = (projectId) => {
  const sql = `UPDATE projects SET downloads = downloads + 1 WHERE id = ?`;
  return db.execute(sql, [projectId]);
};
