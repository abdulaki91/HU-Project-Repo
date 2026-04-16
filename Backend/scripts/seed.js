import db from "../config/db.config.js";
import bcrypt from "bcryptjs";

// Sample data
const sampleUsers = [
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@haramaya.edu.et",
    password: "Admin123!",
    role: "super-admin",
    department: "Computer Science",
    batch: "2020",
    verified: true,
  },
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@haramaya.edu.et",
    password: "Student123!",
    role: "student",
    department: "Computer Science",
    batch: "2024",
    verified: true,
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@haramaya.edu.et",
    password: "Student123!",
    role: "student",
    department: "Information Technology",
    batch: "2023",
    verified: true,
  },
  {
    firstName: "Dr. Ahmed",
    lastName: "Hassan",
    email: "ahmed.hassan@haramaya.edu.et",
    password: "Admin123!",
    role: "admin",
    department: "Computer Science",
    batch: "2015",
    verified: true,
  },
  {
    firstName: "Prof. Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@haramaya.edu.et",
    password: "Admin123!",
    role: "admin",
    department: "Information Technology",
    batch: "2010",
    verified: true,
  },
];

const sampleProjects = [
  {
    title: "Student Management System",
    description:
      "A comprehensive web-based student management system built with React and Node.js. Features include student registration, grade management, attendance tracking, and reporting.",
    course: "Software Engineering",
    department: "Computer Science",
    batch: "2024",
    tags: ["react", "nodejs", "mysql", "web-development"],
    status: "approved",
    downloads: 45,
    views: 120,
    featured: true,
  },
  {
    title: "E-Commerce Mobile App",
    description:
      "A mobile e-commerce application developed using React Native. Includes user authentication, product catalog, shopping cart, and payment integration.",
    course: "Mobile Application Development",
    department: "Computer Science",
    batch: "2023",
    tags: ["react-native", "mobile", "ecommerce", "firebase"],
    status: "approved",
    downloads: 32,
    views: 89,
    featured: false,
  },
  {
    title: "Library Management System",
    description:
      "A desktop application for managing library operations including book cataloging, member management, and borrowing/returning processes.",
    course: "Database Systems",
    department: "Information Technology",
    batch: "2024",
    tags: ["java", "mysql", "desktop", "library"],
    status: "approved",
    downloads: 28,
    views: 67,
    featured: false,
  },
  {
    title: "Weather Prediction System",
    description:
      "A machine learning project that predicts weather patterns using historical data. Implemented using Python and scikit-learn.",
    course: "Artificial Intelligence",
    department: "Computer Science",
    batch: "2023",
    tags: ["python", "machine-learning", "weather", "data-science"],
    status: "pending",
    downloads: 0,
    views: 15,
    featured: false,
  },
  {
    title: "Hospital Management System",
    description:
      "A comprehensive hospital management system with patient records, appointment scheduling, and billing features.",
    course: "Systems Analysis and Design",
    department: "Information Technology",
    batch: "2024",
    tags: ["php", "mysql", "healthcare", "web"],
    status: "pending",
    downloads: 0,
    views: 15,
    featured: false,
  },
  {
    title: "AI Chatbot Assistant",
    description:
      "An intelligent chatbot built with natural language processing capabilities. Uses machine learning to understand user queries and provide helpful responses.",
    course: "Artificial Intelligence",
    department: "Computer Science",
    batch: "2024",
    tags: ["python", "nlp", "tensorflow", "chatbot", "ai"],
    status: "pending",
    downloads: 0,
    views: 8,
    featured: false,
  },
];

// Seed functions
const seedUsers = async () => {
  console.log("👥 Seeding users...");

  for (const user of sampleUsers) {
    try {
      // Check if user already exists
      const [existing] = await db.execute(
        "SELECT id FROM users WHERE email = ?",
        [user.email],
      );

      if (existing.length > 0) {
        console.log(`⏭️  User ${user.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 12);

      // Insert user
      await db.execute(
        `
        INSERT INTO users (firstName, lastName, email, password, role, department, batch, verified, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `,
        [
          user.firstName,
          user.lastName,
          user.email,
          hashedPassword,
          user.role,
          user.department,
          user.batch,
          user.verified,
        ],
      );

      console.log(`✅ Created user: ${user.email} (${user.role})`);
    } catch (error) {
      console.error(`❌ Failed to create user ${user.email}:`, error.message);
    }
  }
};

const seedProjects = async () => {
  console.log("📁 Seeding projects...");

  // Get user IDs for author assignment
  const [users] = await db.execute(
    'SELECT id, email, role FROM users WHERE role IN ("student", "admin")',
  );
  const studentUsers = users.filter((u) => u.role === "student");

  if (studentUsers.length === 0) {
    console.log("⚠️  No student users found, skipping project seeding");
    return;
  }

  for (let i = 0; i < sampleProjects.length; i++) {
    const project = sampleProjects[i];
    const author = studentUsers[i % studentUsers.length]; // Cycle through students

    try {
      // Check if project already exists
      const [existing] = await db.execute(
        "SELECT id FROM projects WHERE title = ?",
        [project.title],
      );

      if (existing.length > 0) {
        console.log(
          `⏭️  Project "${project.title}" already exists, skipping...`,
        );
        continue;
      }

      // Get author name
      const [authorData] = await db.execute(
        "SELECT firstName, lastName FROM users WHERE id = ?",
        [author.id],
      );
      const authorName = `${authorData[0].firstName} ${authorData[0].lastName}`;

      // Insert project
      await db.execute(
        `
        INSERT INTO projects (
          title, description, course, department, author_name, batch, tags, 
          author_id, status, downloads, views, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          project.title,
          project.description,
          project.course,
          project.department,
          authorName,
          project.batch,
          JSON.stringify(project.tags),
          author.id,
          project.status,
          project.downloads,
          project.views,
          project.featured,
        ],
      );

      console.log(`✅ Created project: "${project.title}" by ${authorName}`);
    } catch (error) {
      console.error(
        `❌ Failed to create project "${project.title}":`,
        error.message,
      );
    }
  }
};

const seedComments = async () => {
  console.log("💬 Seeding comments...");

  // Get approved projects and users
  const [projects] = await db.execute(
    'SELECT id, title FROM projects WHERE status = "approved" LIMIT 3',
  );
  const [users] = await db.execute(
    'SELECT id, firstName, lastName FROM users WHERE role = "student" LIMIT 3',
  );

  if (projects.length === 0 || users.length === 0) {
    console.log("⚠️  No projects or users found, skipping comment seeding");
    return;
  }

  const sampleComments = [
    "Great project! Very well documented and easy to understand.",
    "This helped me a lot with my own project. Thank you for sharing!",
    "Excellent implementation. The code is clean and well-structured.",
    "Could you add more details about the installation process?",
    "Amazing work! I learned a lot from your approach.",
    "The user interface is very intuitive and user-friendly.",
  ];

  for (const project of projects) {
    // Add 2-3 comments per project
    const commentCount = Math.floor(Math.random() * 2) + 2;

    for (let i = 0; i < commentCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const comment =
        sampleComments[Math.floor(Math.random() * sampleComments.length)];

      try {
        await db.execute(
          `
          INSERT INTO comments (project_id, user_id, content)
          VALUES (?, ?, ?)
        `,
          [project.id, user.id, comment],
        );

        console.log(
          `✅ Added comment to "${project.title}" by ${user.firstName}`,
        );
      } catch (error) {
        console.error(`❌ Failed to add comment:`, error.message);
      }
    }
  }
};

const seedRatings = async () => {
  console.log("⭐ Seeding ratings...");

  // Get approved projects and users
  const [projects] = await db.execute(
    'SELECT id, title FROM projects WHERE status = "approved"',
  );
  const [users] = await db.execute(
    'SELECT id, firstName FROM users WHERE role = "student"',
  );

  if (projects.length === 0 || users.length === 0) {
    console.log("⚠️  No projects or users found, skipping rating seeding");
    return;
  }

  for (const project of projects) {
    // Add ratings from random users (not all users rate all projects)
    const ratingCount =
      Math.floor(Math.random() * Math.min(users.length, 5)) + 1;
    const shuffledUsers = users
      .sort(() => 0.5 - Math.random())
      .slice(0, ratingCount);

    for (const user of shuffledUsers) {
      const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars mostly
      const reviews = [
        "Excellent project with great documentation!",
        "Very helpful and well-implemented.",
        "Good work, learned a lot from this.",
        "Clean code and good practices.",
        "Impressive implementation!",
      ];
      const review =
        Math.random() > 0.5
          ? reviews[Math.floor(Math.random() * reviews.length)]
          : null;

      try {
        await db.execute(
          `
          INSERT INTO ratings (project_id, user_id, rating, review)
          VALUES (?, ?, ?, ?)
        `,
          [project.id, user.id, rating, review],
        );

        console.log(
          `✅ Added ${rating}-star rating to "${project.title}" by ${user.firstName}`,
        );
      } catch (error) {
        // Skip if duplicate (user already rated this project)
        if (!error.message.includes("Duplicate entry")) {
          console.error(`❌ Failed to add rating:`, error.message);
        }
      }
    }
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Skip migrations since they're already run
    console.log("⏭️  Skipping migrations (already executed)");

    // Seed data
    await seedUsers();
    await seedProjects();
    await seedComments();
    await seedRatings();

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Sample Accounts Created:");
    console.log("Super Admin: admin@haramaya.edu.et / Admin123!");
    console.log("CS Admin: ahmed.hassan@haramaya.edu.et / Admin123!");
    console.log("IT Admin: sarah.johnson@haramaya.edu.et / Admin123!");
    console.log("Student: john.doe@haramaya.edu.et / Student123!");
    console.log("Student: jane.smith@haramaya.edu.et / Student123!");
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  }
};

// CLI interface
const command = process.argv[2];

switch (command) {
  case "all":
    seedDatabase().then(() => process.exit(0));
    break;
  case "users":
    seedUsers().then(() => process.exit(0));
    break;
  case "projects":
    seedProjects().then(() => process.exit(0));
    break;
  case "comments":
    seedComments().then(() => process.exit(0));
    break;
  case "ratings":
    seedRatings().then(() => process.exit(0));
    break;
  default:
    console.log(`
Usage: node seed.js [command]

Commands:
  all       Seed all data (recommended)
  users     Seed only users
  projects  Seed only projects
  comments  Seed only comments
  ratings   Seed only ratings

Examples:
  node seed.js all
  node seed.js users
    `);
    process.exit(0);
}

export { seedDatabase, seedUsers, seedProjects };
