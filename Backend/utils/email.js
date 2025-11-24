import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "Haramaya University Project Repository <no-reply@haramaya.edu.et>",
      to: options.email,
      subject: options.subject,
      text: options.message, // fallback for non-HTML clients
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
          <p style="font-size: 16px; color: #555;">
            Hello <b>${options.name || "User"}</b>,<br/><br/>
            Thank you for registering with <b>Haramaya University Project Repository</b>. Please verify your email address by clicking the button below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              options.verifyUrl
            }" style="background-color: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Verify My Account
            </a>
          </div>
          <p style="font-size: 14px; color: #777;">
            Or copy & paste this link into your browser: <br/>
            <a href="${options.verifyUrl}" style="color: #007bff;">${
        options.verifyUrl
      }</a>
          </p>
          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent!");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};
