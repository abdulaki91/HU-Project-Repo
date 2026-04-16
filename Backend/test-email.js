#!/usr/bin/env node

/**
 * Email Configuration Test Script
 * Tests the email system in development mode
 */

import { sendEmail } from "./utils/email.js";
import dotenv from "dotenv";

dotenv.config();

async function testEmail() {
  console.log("🧪 Testing Email Configuration...\n");

  console.log("Environment:", process.env.NODE_ENV);
  console.log("Email Username:", process.env.EMAIL_USERNAME);
  console.log(
    "Email configured:",
    process.env.EMAIL_USERNAME !== "your_email@domain.com",
  );
  console.log("");

  try {
    // Test verification email
    console.log("📧 Testing verification email...");
    const result1 = await sendEmail({
      email: "test@example.com",
      template: "verification",
      name: "Test User",
      verifyUrl: "http://localhost:5173/verify?token=test123",
    });
    console.log("✅ Verification email test:", result1.messageId);
    console.log("");

    // Test project approval email
    console.log("📧 Testing project approval email...");
    const result2 = await sendEmail({
      email: "student@example.com",
      template: "project-approved",
      name: "John Doe",
      projectTitle: "Test Project",
      projectUrl: "http://localhost:5173/project/1",
    });
    console.log("✅ Project approval email test:", result2.messageId);
    console.log("");

    console.log("🎉 All email tests completed successfully!");
    console.log("");

    if (
      process.env.NODE_ENV === "development" &&
      process.env.EMAIL_USERNAME === "your_email@domain.com"
    ) {
      console.log(
        "ℹ️  Email service is running in simulation mode for development.",
      );
      console.log(
        "ℹ️  No actual emails are sent, but the system works correctly.",
      );
      console.log(
        "ℹ️  For production, configure real email credentials in .env file.",
      );
    }
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
    process.exit(1);
  }
}

testEmail();
