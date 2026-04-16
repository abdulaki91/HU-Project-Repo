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
      file_path VARCHAR(255),
      file_size BIGINT DEFAULT NULL,
      file_type VARCHAR(100) DEFAULT NULL,
      downloads INT DEFAULT 0,
      status ENUM('pending', 'approved','rejected') DEFAULT 'pending',
      rejectionReason TEXT DEFAULT NULL,
      views INT DEFAULT 0,
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_author FOREIGN KEY (author_id) 
        REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_status (status),
      INDEX idx_department (department),
      INDEX idx_batch (batch),
      INDEX idx_course (course),
      INDEX idx_author_id (author_id),
      INDEX idx_created_at (created_at),
      FULLTEXT INDEX idx_search (title, description, author_name)
    );
  `;
  return db.execute(sql);
};

export const getProjectById = (id) =>
  db.execute("SELECT * FROM projects WHERE id = ?", [id]);

export const createProject = (project) => {
  const sql = `
    INSERT INTO projects 
    (title, description, course, department, author_name, batch, tags, author_id, file_path, downloads, status, views)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    status,
    views,
  } = project;

  // Ensure no undefined bind params (use null where appropriate)
  if (typeof title === "undefined") title = null;
  if (typeof description === "undefined") description = null;
  if (typeof course === "undefined") course = null;
  if (typeof department === "undefined") department = null;
  if (typeof author_name === "undefined") author_name = null;
  if (typeof batch === "undefined") batch = null;
  if (typeof tags === "undefined" || tags === null) tags = [];
  if (typeof author_id === "undefined") author_id = null;
  if (typeof file_path === "undefined") file_path = null;
  if (typeof downloads === "undefined" || downloads === null) downloads = 0;
  if (typeof status === "undefined") status = "pending";
  if (typeof views === "undefined" || views === null) views = 0;

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
    status,
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

export const getUserProjects = async (filters = {}, options = {}) => {
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

  if (filters.department && filters.department !== "all") {
    conditions.push("department = ?");
    params.push(filters.department);
  }

  // Only return approved projects for public browsing
  if (!options.includePending) {
    conditions.push("status = 'approved'");
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
    }),
  );

  return projects;
};

export const getProjectsByAuthor = async (
  authorId,
  filters = {},
  options = {},
) => {
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

  if (filters.status && filters.status !== "all") {
    sql += " AND status = ?";
    params.push(filters.status);
  }

  // Get total count for pagination
  const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as total");
  const [countRows] = await db.execute(countSql, params);
  const total = countRows[0].total;

  // Add pagination
  const page = options.page || 1;
  const limit = options.limit || 10;
  const offset = (page - 1) * limit;

  sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

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
    }),
  );

  return {
    projects,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const incrementDownloads = (projectId) => {
  const sql = `UPDATE projects SET downloads = downloads + 1 WHERE id = ?`;
  return db.execute(sql, [projectId]);
};

// getting pending projects from the same department as admin
export const getPendingProjectsModel = (department) => {
  const sql = `SELECT * FROM projects WHERE status = 'pending' AND department = ? ORDER BY created_at DESC`;
  return db.execute(sql, [department]);
};
// ✅ Get projects with pagination and advanced filtering
export const getProjectsWithPagination = async (filters = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const params = [];

  if (filters.course && filters.course !== "all") {
    whereClause += " AND p.course = ?";
    params.push(filters.course);
  }

  if (filters.batch && filters.batch !== "all") {
    whereClause += " AND p.batch = ?";
    params.push(filters.batch);
  }

  if (filters.department && filters.department !== "all") {
    whereClause += " AND p.department = ?";
    params.push(filters.department);
  }

  if (filters.status) {
    whereClause += " AND p.status = ?";
    params.push(filters.status);
  }

  if (filters.search) {
    whereClause +=
      " AND (MATCH(p.title, p.description, p.author_name) AGAINST(? IN NATURAL LANGUAGE MODE) OR p.title LIKE ? OR p.description LIKE ?)";
    const searchTerm = `%${filters.search}%`;
    params.push(filters.search, searchTerm, searchTerm);
  }

  if (filters.featured) {
    whereClause += " AND p.featured = TRUE";
  }

  // Validate sort parameters
  const allowedSortFields = [
    "created_at",
    "updated_at",
    "title",
    "downloads",
    "views",
  ];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
  const sortDirection = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

  const countSql = `SELECT COUNT(*) as total FROM projects p ${whereClause}`;
  const dataSql = `
    SELECT p.*, u.firstName, u.lastName, u.email as author_email
    FROM projects p
    LEFT JOIN users u ON p.author_id = u.id
    ${whereClause}
    ORDER BY p.${sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `;

  const [countResult] = await db.execute(countSql, params);
  const [dataResult] = await db.execute(dataSql, [...params, limit, offset]);

  // Process results
  const projects = await Promise.all(
    dataResult.map(async (p) => {
      let tags = p.tags;
      if (typeof tags === "string") {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          tags = [];
        }
      }
      if (!Array.isArray(tags)) tags = [];

      // Get file info if file exists
      let fileInfo = null;
      if (p.file_path) {
        try {
          const uploadsDir = path.resolve("uploads", "projects");
          const requestedPath = path.resolve(p.file_path);
          if (
            requestedPath.startsWith(uploadsDir) &&
            fs.existsSync(requestedPath)
          ) {
            const stat = await fs.promises.stat(requestedPath);
            fileInfo = {
              size: stat.size,
              type: path.extname(requestedPath),
              exists: true,
            };
          }
        } catch (e) {
          fileInfo = { exists: false };
        }
      }

      return {
        ...p,
        tags,
        fileInfo,
        author: {
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.author_email,
        },
      };
    }),
  );

  return {
    projects,
    total: countResult[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult[0].total / limit),
  };
};

// ✅ Search projects with full-text search
export const searchProjects = async (searchTerm, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const offset = (page - 1) * limit;

  const countSql = `
    SELECT COUNT(*) as total 
    FROM projects 
    WHERE status = 'approved' 
    AND (MATCH(title, description, author_name) AGAINST(? IN NATURAL LANGUAGE MODE) 
         OR title LIKE ? OR description LIKE ? OR author_name LIKE ?)
  `;

  const dataSql = `
    SELECT p.*, u.firstName, u.lastName,
           MATCH(p.title, p.description, p.author_name) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
    FROM projects p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.status = 'approved' 
    AND (MATCH(p.title, p.description, p.author_name) AGAINST(? IN NATURAL LANGUAGE MODE) 
         OR p.title LIKE ? OR p.description LIKE ? OR p.author_name LIKE ?)
    ORDER BY relevance DESC, p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const searchPattern = `%${searchTerm}%`;
  const countParams = [searchTerm, searchPattern, searchPattern, searchPattern];
  const dataParams = [
    searchTerm,
    searchTerm,
    searchPattern,
    searchPattern,
    searchPattern,
    limit,
    offset,
  ];

  const [countResult] = await db.execute(countSql, countParams);
  const [dataResult] = await db.execute(dataSql, dataParams);

  const projects = dataResult.map((p) => ({
    ...p,
    tags:
      typeof p.tags === "string" ? JSON.parse(p.tags || "[]") : p.tags || [],
    author: {
      firstName: p.firstName,
      lastName: p.lastName,
    },
  }));

  return {
    projects,
    total: countResult[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult[0].total / limit),
  };
};

// ✅ Increment views
export const incrementViews = (projectId) => {
  const sql = `UPDATE projects SET views = views + 1 WHERE id = ?`;
  return db.execute(sql, [projectId]);
};

// ✅ Get project statistics
export const getGlobalProjectStats = async () => {
  const sql = `
    SELECT 
      COUNT(*) as totalProjects,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedProjects,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingProjects,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedProjects,
      SUM(downloads) as totalDownloads,
      SUM(views) as totalViews,
      COUNT(DISTINCT author_id) as uniqueAuthors,
      COUNT(DISTINCT department) as departments,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as newProjectsThisMonth
    FROM projects
  `;
  const [rows] = await db.execute(sql);
  return rows[0];
};

// ✅ Get department-specific statistics
export const getDepartmentProjectStats = async (department) => {
  const sql = `
    SELECT 
      COUNT(*) as totalProjects,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedProjects,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingProjects,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedProjects,
      SUM(downloads) as totalDownloads,
      SUM(views) as totalViews,
      COUNT(DISTINCT author_id) as uniqueAuthors,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as newProjectsThisMonth
    FROM projects
    WHERE department = ?
  `;
  const [rows] = await db.execute(sql, [department]);
  return rows[0];
};

// ✅ Get user-specific statistics
export const getUserProjectStats = async (userId) => {
  const sql = `
    SELECT 
      COUNT(*) as totalProjects,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedProjects,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingProjects,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedProjects,
      SUM(downloads) as totalDownloads,
      SUM(views) as totalViews,
      MAX(created_at) as lastProjectDate
    FROM projects
    WHERE author_id = ?
  `;
  const [rows] = await db.execute(sql, [userId]);
  return rows[0];
};

// ✅ Get trending projects (most downloaded/viewed recently)
export const getTrendingProjects = async (limit = 10, days = 7) => {
  const sql = `
    SELECT p.*, u.firstName, u.lastName,
           (p.downloads + p.views) as popularity_score
    FROM projects p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.status = 'approved' 
    AND p.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    ORDER BY popularity_score DESC, p.created_at DESC
    LIMIT ?
  `;
  const [rows] = await db.execute(sql, [days, limit]);

  return rows.map((p) => ({
    ...p,
    tags:
      typeof p.tags === "string" ? JSON.parse(p.tags || "[]") : p.tags || [],
    author: {
      firstName: p.firstName,
      lastName: p.lastName,
    },
  }));
};

// ✅ Get featured projects
export const getFeaturedProjects = async (limit = 5) => {
  const sql = `
    SELECT p.*, u.firstName, u.lastName
    FROM projects p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.status = 'approved' AND p.featured = TRUE
    ORDER BY p.created_at DESC
    LIMIT ?
  `;
  const [rows] = await db.execute(sql, [limit]);

  return rows.map((p) => ({
    ...p,
    tags:
      typeof p.tags === "string" ? JSON.parse(p.tags || "[]") : p.tags || [],
    author: {
      firstName: p.firstName,
      lastName: p.lastName,
    },
  }));
};

// ✅ Toggle featured status (admin only)
export const toggleFeaturedStatus = (projectId, featured = true) => {
  const sql = `UPDATE projects SET featured = ? WHERE id = ?`;
  return db.execute(sql, [featured, projectId]);
};

// ✅ Get projects by multiple IDs
export const getProjectsByIds = async (projectIds) => {
  if (!projectIds || projectIds.length === 0) return [];

  const placeholders = projectIds.map(() => "?").join(",");
  const sql = `
    SELECT p.*, u.firstName, u.lastName
    FROM projects p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.id IN (${placeholders})
    ORDER BY p.created_at DESC
  `;

  const [rows] = await db.execute(sql, projectIds);

  return rows.map((p) => ({
    ...p,
    tags:
      typeof p.tags === "string" ? JSON.parse(p.tags || "[]") : p.tags || [],
    author: {
      firstName: p.firstName,
      lastName: p.lastName,
    },
  }));
};

// ✅ Get related projects (same department/course)
export const getRelatedProjects = async (projectId, limit = 5) => {
  const sql = `
    SELECT p2.*, u.firstName, u.lastName
    FROM projects p1
    JOIN projects p2 ON (p1.department = p2.department OR p1.course = p2.course)
    LEFT JOIN users u ON p2.author_id = u.id
    WHERE p1.id = ? AND p2.id != ? AND p2.status = 'approved'
    ORDER BY 
      CASE WHEN p1.department = p2.department THEN 1 ELSE 2 END,
      CASE WHEN p1.course = p2.course THEN 1 ELSE 2 END,
      p2.created_at DESC
    LIMIT ?
  `;

  const [rows] = await db.execute(sql, [projectId, projectId, limit]);

  return rows.map((p) => ({
    ...p,
    tags:
      typeof p.tags === "string" ? JSON.parse(p.tags || "[]") : p.tags || [],
    author: {
      firstName: p.firstName,
      lastName: p.lastName,
    },
  }));
};

// ✅ Bulk update project status
export const bulkUpdateProjectStatus = async (
  projectIds,
  status,
  rejectionReason = null,
) => {
  if (!projectIds || projectIds.length === 0) return;

  const placeholders = projectIds.map(() => "?").join(",");
  let sql = `UPDATE projects SET status = ?`;
  const params = [status];

  if (status === "rejected" && rejectionReason) {
    sql += ", rejectionReason = ?";
    params.push(rejectionReason);
  }

  sql += ` WHERE id IN (${placeholders})`;
  params.push(...projectIds);

  return db.execute(sql, params);
};
// ✅ Get advanced analytics
export const getAdvancedAnalytics = async (
  timeframe = "30d",
  department = null,
) => {
  const days = parseInt(timeframe.replace("d", ""));
  let whereClause = `WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`;
  const params = [];

  if (department) {
    whereClause += " AND department = ?";
    params.push(department);
  }

  const sql = `
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as total_projects,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_projects,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_projects,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_projects,
      SUM(downloads) as total_downloads,
      SUM(views) as total_views,
      COUNT(DISTINCT author_id) as unique_authors,
      AVG(downloads) as avg_downloads_per_project,
      AVG(views) as avg_views_per_project
    FROM projects 
    ${whereClause}
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;

  const [rows] = await db.execute(sql, params);

  // Get department breakdown
  const deptSql = `
    SELECT 
      department,
      COUNT(*) as project_count,
      SUM(downloads) as total_downloads,
      SUM(views) as total_views,
      AVG(downloads) as avg_downloads,
      AVG(views) as avg_views
    FROM projects 
    ${whereClause}
    GROUP BY department
    ORDER BY project_count DESC
  `;

  const [deptRows] = await db.execute(deptSql, params);

  // Get top projects
  const topSql = `
    SELECT 
      id, title, author_name, department, downloads, views,
      (downloads * 2 + views) as popularity_score
    FROM projects 
    ${whereClause}
    ORDER BY popularity_score DESC
    LIMIT 10
  `;

  const [topRows] = await db.execute(topSql, params);

  return {
    timeline: rows,
    departmentBreakdown: deptRows,
    topProjects: topRows,
    summary: {
      totalProjects: rows.reduce((sum, row) => sum + row.total_projects, 0),
      totalDownloads: rows.reduce((sum, row) => sum + row.total_downloads, 0),
      totalViews: rows.reduce((sum, row) => sum + row.total_views, 0),
      uniqueAuthors: Math.max(...rows.map((row) => row.unique_authors), 0),
    },
  };
};

// ✅ Get projects for export
export const getProjectsForExport = async (filters = {}) => {
  let whereClause = "WHERE 1=1";
  const params = [];

  if (filters.department) {
    whereClause += " AND p.department = ?";
    params.push(filters.department);
  }

  if (filters.status) {
    whereClause += " AND p.status = ?";
    params.push(filters.status);
  }

  if (filters.dateFrom) {
    whereClause += " AND p.created_at >= ?";
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    whereClause += " AND p.created_at <= ?";
    params.push(filters.dateTo);
  }

  const sql = `
    SELECT 
      p.id,
      p.title,
      p.description,
      p.course,
      p.department,
      p.batch,
      p.author_name,
      p.downloads,
      p.views,
      p.status,
      p.created_at,
      p.updated_at,
      u.email as author_email,
      u.firstName as author_first_name,
      u.lastName as author_last_name
    FROM projects p
    LEFT JOIN users u ON p.author_id = u.id
    ${whereClause}
    ORDER BY p.created_at DESC
  `;

  const [rows] = await db.execute(sql, params);

  return rows.map((row) => ({
    ...row,
    tags:
      typeof row.tags === "string"
        ? JSON.parse(row.tags || "[]")
        : row.tags || [],
  }));
};

// ✅ Convert projects to CSV
export const convertToCSV = async (projects) => {
  const headers = [
    "ID",
    "Title",
    "Description",
    "Course",
    "Department",
    "Batch",
    "Author Name",
    "Author Email",
    "Downloads",
    "Views",
    "Status",
    "Created At",
    "Updated At",
    "Tags",
  ];

  const csvRows = [headers.join(",")];

  projects.forEach((project) => {
    const row = [
      project.id,
      `"${(project.title || "").replace(/"/g, '""')}"`,
      `"${(project.description || "").replace(/"/g, '""')}"`,
      project.course || "",
      project.department || "",
      project.batch || "",
      `"${project.author_name || ""}"`,
      project.author_email || "",
      project.downloads || 0,
      project.views || 0,
      project.status || "",
      project.created_at || "",
      project.updated_at || "",
      `"${Array.isArray(project.tags) ? project.tags.join(";") : ""}"`,
    ];
    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
};

// ===== DASHBOARD STATISTICS =====

// Get overall dashboard statistics
export const getDashboardStats = async () => {
  const sql = `
    SELECT 
      COUNT(*) as total_projects,
      COUNT(DISTINCT author_id) as active_students,
      SUM(downloads) as total_downloads,
      SUM(views) as total_views,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_projects,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_projects,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_projects
    FROM projects
  `;

  const [rows] = await db.execute(sql);
  return rows[0];
};

// Get monthly upload trends (last 6 months)
export const getUploadTrends = async () => {
  const sql = `
    SELECT 
      DATE_FORMAT(created_at, '%b') as month,
      COUNT(*) as uploads
    FROM projects 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY created_at ASC
  `;

  const [rows] = await db.execute(sql);
  return rows;
};

// Get course distribution
export const getCourseDistribution = async () => {
  const sql = `
    SELECT 
      course as name,
      COUNT(*) as value
    FROM projects 
    WHERE status = 'approved'
    GROUP BY course
    ORDER BY value DESC
    LIMIT 10
  `;

  const [rows] = await db.execute(sql);

  // Add colors for the pie chart
  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#6b7280",
    "#ec4899",
    "#14b8a6",
    "#f97316",
    "#84cc16",
  ];

  return rows.map((row, index) => ({
    ...row,
    color: colors[index % colors.length],
  }));
};

// Get weekly activity data (last 7 days)
export const getWeeklyActivity = async () => {
  const sql = `
    SELECT 
      DAYNAME(created_at) as day,
      SUM(views) as views,
      SUM(downloads) as downloads
    FROM projects 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY DAYOFWEEK(created_at), DAYNAME(created_at)
    ORDER BY DAYOFWEEK(created_at)
  `;

  const [rows] = await db.execute(sql);

  // Ensure all days are present
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayMap = {};

  rows.forEach((row) => {
    dayMap[row.day] = {
      day: row.day.substring(0, 3), // Shorten day names
      views: parseInt(row.views) || 0,
      downloads: parseInt(row.downloads) || 0,
    };
  });

  return daysOfWeek.map(
    (day) =>
      dayMap[day] || {
        day: day.substring(0, 3),
        views: 0,
        downloads: 0,
      },
  );
};

// Get department-specific dashboard stats (for admins)
export const getDepartmentDashboardStats = async (department) => {
  const sql = `
    SELECT 
      COUNT(*) as total_projects,
      COUNT(DISTINCT author_id) as active_students,
      SUM(downloads) as total_downloads,
      SUM(views) as total_views,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_projects,
      COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_projects,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_projects
    FROM projects
    WHERE department = ?
  `;

  const [rows] = await db.execute(sql, [department]);
  return rows[0];
};
