import bcrypt from "bcryptjs";
import * as UserModel from "../models/userModel.js";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middleware/errorHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, batch, department } =
    req.body;

  // Check if user already exists
  const [existingUser] = await UserModel.getUserByEmail(email);
  if (existingUser.length > 0) {
    return res.status(409).json({
      success: false,
      message: "User already exists with this email address",
      code: "USER_EXISTS",
    });
  }

  // Hash password with higher rounds for production
  const saltRounds = process.env.NODE_ENV === "production" ? 12 : 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Insert user into DB
  await UserModel.insertUser(
    firstName,
    lastName,
    email,
    hashedPassword,
    batch,
    department,
    verificationToken,
    role || "student",
  );

  // Send verification email
  try {
    const verifyUrl = `${process.env.BACKEND_URL}/api/user/verify/${verificationToken}`;
    await sendEmail({
      email,
      subject: "Verify your account - Haramaya University Project Store",
      verifyUrl,
      name: `${firstName} ${lastName}`,
    });
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
    // Don't fail registration if email fails, but log it
  }

  res.status(201).json({
    success: true,
    message:
      "User registered successfully. Please check your email to verify your account.",
    data: {
      email,
      firstName,
      lastName,
      role: role || "student",
    },
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await UserModel.loginQuery(email);
  const user = rows[0];

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
      code: "INVALID_CREDENTIALS",
    });
  }

  if (!user.verified) {
    return res.status(403).json({
      success: false,
      message:
        "Please verify your email before logging in. Check your inbox for the verification link.",
      code: "EMAIL_NOT_VERIFIED",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
      code: "INVALID_CREDENTIALS",
    });
  }

  // Update last login timestamp
  await UserModel.updateLastLogin(user.id);

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        batch: user.batch,
        department: user.department,
        verified: user.verified,
      },
    },
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const [rows] = await UserModel.getUserByEmail(email);
  const user = rows[0];

  if (!user) {
    // Don't reveal if email exists or not for security
    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  // Save reset token to database
  await UserModel.savePasswordResetToken(user.id, resetToken, resetTokenExpiry);

  // Send reset email
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: "Password Reset - Haramaya University Project Store",
      resetUrl,
      name: `${user.firstName} ${user.lastName}`,
      type: "password-reset",
    });
  } catch (emailError) {
    console.error("Password reset email failed:", emailError);
    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email. Please try again later.",
      code: "EMAIL_SEND_FAILED",
    });
  }

  res.status(200).json({
    success: true,
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await UserModel.getUserByResetToken(token);

  if (!user || new Date() > user.resetTokenExpiry) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
      code: "INVALID_RESET_TOKEN",
    });
  }

  // Hash new password
  const saltRounds = process.env.NODE_ENV === "production" ? 12 : 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Update password and clear reset token
  await UserModel.updatePasswordAndClearResetToken(user.id, hashedPassword);

  res.status(200).json({
    success: true,
    message:
      "Password has been reset successfully. You can now log in with your new password.",
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is required",
      code: "NO_REFRESH_TOKEN",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const [rows] = await UserModel.findUserById(decoded.id);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Generate new access token
    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token",
      code: "INVALID_REFRESH_TOKEN",
    });
  }
});
