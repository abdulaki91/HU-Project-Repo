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
     date DATE DEFAULT CURRENT_DATE,  -- <-- default current date
      downloads INT DEFAULT 0,
      views INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      CONSTRAINT fk_author FOREIGN KEY (author_id) 
        REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  return db.execute(sql);
};

export const getAllProjects = () =>
  db.execute("SELECT * FROM projects ORDER BY date DESC");
export const getProjectById = (id) =>
  db.execute("SELECT * FROM projects WHERE id = ?", [id]);

export const createProject = (project) => {
  const sql = `
    INSERT INTO projects 
    (title, description, course, batch, tags, author_id, file_path, date, downloads, views)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const {
    title,
    description,
    course,
    batch,
    tags,
    author_id,
    file_path,
    date,
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
    date,
    downloads,
    views,
  ]);
};

export const updateProject = (id, project) => {
  const sql = `
    UPDATE projects SET
      title = ?, description = ?, course = ?, batch = ?, tags = ?, author = ?, date = ?, downloads = ?, views = ?
    WHERE id = ?
  `;
  const {
    title,
    description,
    course,
    batch,
    tags,
    author,
    date,
    downloads,
    views,
  } = project;
  return db.execute(sql, [
    title,
    description,
    course,
    batch,
    JSON.stringify(tags),
    author,
    date,
    downloads,
    views,
    id,
  ]);
};
export const deleteProject = (id) => {
  return db.execute("DELETE FROM projects WHERE id = ?", [id]);
};
