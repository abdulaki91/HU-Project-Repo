import db from "../config/db.config.js";

const approveAllProjects = async () => {
  try {
    const sql =
      "UPDATE projects SET status = 'approved' WHERE status = 'pending'";
    const [result] = await db.execute(sql);
    console.log(`Approved ${result.affectedRows} projects.`);
  } catch (err) {
    console.error("Error approving projects:", err);
  } finally {
    process.exit();
  }
};

approveAllProjects();
