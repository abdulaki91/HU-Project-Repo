import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email templates
const emailTemplates = {
  verification: (name, verifyUrl) => ({
    subject: "Verify Your Email - Haramaya University Project Store",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">HUPS</h1>
          <p style="color: #666; margin: 5px 0;">Haramaya University Project Store</p>
        </div>
        
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Hello <b>${name}</b>,<br/><br/>
          Thank you for registering with <b>Haramaya University Project Store</b>. 
          To complete your registration and start sharing your projects, please verify your email address.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #4f46e5; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
            Verify My Account
          </a>
        </div>
        
        <p style="font-size: 14px; color: #777; line-height: 1.5;">
          Or copy and paste this link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #4f46e5; word-break: break-all;">${verifyUrl}</a>
        </p>
        
        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            This verification link will expire in 24 hours.<br/>
            If you did not create an account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: "Password Reset - Haramaya University Project Store",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">HUPS</h1>
          <p style="color: #666; margin: 5px 0;">Haramaya University Project Store</p>
        </div>
        
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Hello <b>${name}</b>,<br/><br/>
          We received a request to reset your password for your HUPS account. 
          If you made this request, click the button below to reset your password.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc2626; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="font-size: 14px; color: #777; line-height: 1.5;">
          Or copy and paste this link into your browser:<br/>
          <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px;">
          <p style="font-size: 12px; color: #999; text-align: center;">
            This password reset link will expire in 1 hour.<br/>
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  }),

  projectApproved: (name, projectTitle, projectUrl) => ({
    subject: "Project Approved - Haramaya University Project Store",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">HUPS</h1>
          <p style="color: #666; margin: 5px 0;">Haramaya University Project Store</p>
        </div>
        
        <h2 style="color: #16a34a; text-align: center;">🎉 Project Approved!</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Hello <b>${name}</b>,<br/><br/>
          Great news! Your project "<b>${projectTitle}</b>" has been approved and is now live on the platform.
          Other students can now discover and download your project.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${projectUrl}" style="background-color: #16a34a; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
            View Your Project
          </a>
        </div>
        
        <p style="font-size: 14px; color: #777; text-align: center;">
          Thank you for contributing to the HUPS community!
        </p>
      </div>
    `,
  }),

  projectRejected: (name, projectTitle, reason) => ({
    subject: "Project Review Update - Haramaya University Project Store",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">HUPS</h1>
          <p style="color: #666; margin: 5px 0;">Haramaya University Project Store</p>
        </div>
        
        <h2 style="color: #dc2626; text-align: center;">Project Review Update</h2>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          Hello <b>${name}</b>,<br/><br/>
          Thank you for submitting your project "<b>${projectTitle}</b>" to HUPS. 
          After review, we need you to make some adjustments before we can approve it.
        </p>
        
        ${
          reason
            ? `
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin: 0 0 10px 0;">Feedback:</h3>
            <p style="color: #555; margin: 0;">${reason}</p>
          </div>
        `
            : ""
        }
        
        <p style="font-size: 14px; color: #777; line-height: 1.5;">
          Please review the feedback above and resubmit your project with the necessary changes. 
          We're here to help you succeed!
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/profile/projects" style="background-color: #4f46e5; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">
            Edit Project
          </a>
        </div>
      </div>
    `,
  }),
};

export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    let emailContent;

    // Use template if specified
    if (options.template) {
      switch (options.template) {
        case "verification":
          emailContent = emailTemplates.verification(
            options.name,
            options.verifyUrl,
          );
          break;
        case "password-reset":
          emailContent = emailTemplates.passwordReset(
            options.name,
            options.resetUrl,
          );
          break;
        case "project-approved":
          emailContent = emailTemplates.projectApproved(
            options.name,
            options.projectTitle,
            options.projectUrl,
          );
          break;
        case "project-rejected":
          emailContent = emailTemplates.projectRejected(
            options.name,
            options.projectTitle,
            options.reason,
          );
          break;
        default:
          throw new Error(`Unknown email template: ${options.template}`);
      }
    } else {
      // Fallback to legacy format
      emailContent = emailTemplates.verification(
        options.name || "User",
        options.verifyUrl,
      );
    }

    const mailOptions = {
      from: `"Haramaya University Project Store" <${process.env.EMAIL_USERNAME}>`,
      to: options.email,
      subject: options.subject || emailContent.subject,
      html: options.html || emailContent.html,
      text: options.text || stripHtml(emailContent.html), // Fallback text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

// Utility function to strip HTML for text version
const stripHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
};

// Send bulk emails (for notifications)
export const sendBulkEmails = async (emails) => {
  const results = [];
  const batchSize = 10; // Send in batches to avoid rate limiting

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const batchPromises = batch.map((emailOptions) =>
      sendEmail(emailOptions).catch((error) => ({
        error,
        email: emailOptions.email,
      })),
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Wait between batches to avoid rate limiting
    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
};
