#!/usr/bin/env node

/**
 * Fix Department Matching Script
 * Updates project departments to match admin departments
 */

import db from "./config/db.config.js";
import dotenv from "dotenv";

dotenv.config();

async function fixDepartments() {
  try {
    console.log("🔧 Fixing department matching issues...\n");

    // Update Hospital Management System to match IT admin department
    const [result1] = await db.execute(`
      UPDATE projects 
      SET department = 'Information Technology', status = 'pending' 
      WHERE title = 'Hospital Management System'
    `);

    console.log(
      "✅ Updated Hospital Management System:",
      result1.affectedRows,
      "rows affected",
    );

    // Check current pending projects by department
    const [pendingProjects] = await db.execute(`
      SELECT title, department, status, author_name 
      FROM projects 
      WHERE status = 'pending' 
      ORDER BY department, title
    `);

    console.log("\n📋 Current Pending Projects:");
    pendingProjects.forEach((project) => {
      console.log(
        `  • ${project.title} (${project.department}) - ${project.status}`,
      );
    });

    // Check admin departments
    const [admins] = await db.execute(`
      SELECT firstName, lastName, email, department, role 
      FROM users 
      WHERE role IN ('admin', 'super-admin') 
      ORDER BY department
    `);

    console.log("\n👥 Admin Users:");
    admins.forEach((admin) => {
      console.log(
        `  • ${admin.firstName} ${admin.lastName} (${admin.email}) - ${admin.department} - ${admin.role}`,
      );
    });

    // Show matching summary
    console.log("\n🎯 Department Matching Summary:");

    const [csPending] = await db.execute(`
      SELECT COUNT(*) as count FROM projects 
      WHERE status = 'pending' AND department = 'Computer Science'
    `);

    const [itPending] = await db.execute(`
      SELECT COUNT(*) as count FROM projects 
      WHERE status = 'pending' AND department = 'Information Technology'
    `);

    console.log(
      `  • Computer Science Admin can see: ${csPending[0].count} pending projects`,
    );
    console.log(
      `  • Information Technology Admin can see: ${itPending[0].count} pending projects`,
    );

    console.log("\n🎉 Department matching fixed successfully!");
  } catch (error) {
    console.error("❌ Error fixing departments:", error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

fixDepartments();
