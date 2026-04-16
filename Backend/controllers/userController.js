import * as UserModel from "../models/userModel.js";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/email.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import dotenv from "dotenv";
dotenv.config();

/* =============================================
   Create users table
============================================= */
export const createUserTableController = asyncHandler(async (req, res) => {
  await UserModel.createUsersTable();
  res.status(200).json({
    success: true,
    message: "Users table is ready.",
  });
});

export const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const user = await UserModel.getUserByToken(token);

  if (user.length === 0) {
    return res.status(400).send("<h3>Invalid or expired token.</h3>");
  }

  await UserModel.verifyUser(user[0].id);
  return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
});

/* =============================================
   Login user
============================================= */

/* =============================================
   Get user by ID
============================================= */
export const getUserByIdController = asyncHandler(async (req, res) => {
  const id = req.user.id || 10;
  const user = await UserModel.findUserById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

/* =============================================
   Update user profile
============================================= */
export const updateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params; // id from route /update/:id
  const { firstName, lastName, email, batch, department } = req.body;

  const userId = req.user.id;

  // Convert both to numbers for comparison
  if (parseInt(id) !== parseInt(userId)) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own account",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  const user = req.user;
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  let verificationToken = null;

  // If email is being changed, require verification
  if (email && email !== user.email) {
    verificationToken = crypto.randomBytes(32).toString("hex");

    await UserModel.updateUser(userId, {
      firstName,
      lastName,
      email,
      batch,
      department,
      verified: 0,
      verificationToken,
    });

    const verifyUrl = `${process.env.BACKEND_URL}/api/user/verify/${verificationToken}`;
    await sendEmail({
      email,
      subject: "Verify your new email address",
      verifyUrl,
      name: `${firstName || user.firstName} ${lastName || user.lastName}`,
    });

    return res.status(200).json({
      success: true,
      message:
        "Email updated. Please check your new email to verify your account.",
    });
  }

  // Update profile without email change
  await UserModel.updateUser(userId, {
    firstName,
    lastName,
    batch,
    department,
  });

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
  });
});

/* =============================================
   Change user password
============================================= */
export const changeUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Fetch user with password from database
  const user = await UserModel.findUserByIdWithPassword(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  // Verify current password
  if (!user.password) {
    return res.status(500).json({
      success: false,
      message: "User password not found in database",
      code: "PASSWORD_NOT_FOUND",
    });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect",
      code: "INVALID_PASSWORD",
    });
  }

  // Update password
  await UserModel.changePassword(user.id, newPassword);

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
// ✅ Search users
export const searchUsers = asyncHandler(async (req, res) => {
  const { q: query, limit = 10 } = req.query;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Search query must be at least 2 characters long",
      code: "INVALID_SEARCH_QUERY",
    });
  }

  const users = await UserModel.searchUsers(query.trim(), parseInt(limit));

  res.json({
    success: true,
    data: users,
  });
});

// ✅ Get user statistics (admin only)
export const getUserStats = asyncHandler(async (req, res) => {
  const userRole = req.user.role;

  if (userRole !== "admin" && userRole !== "super-admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can view user statistics",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  const stats = await UserModel.getUserStats();

  res.json({
    success: true,
    data: stats,
  });
});

// ✅ Get user activity
export const getUserActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestedUserId = id || req.user.id;
  const currentUserId = req.user.id;
  const userRole = req.user.role;

  // Users can only view their own activity unless they're admin
  if (
    requestedUserId != currentUserId &&
    userRole !== "admin" &&
    userRole !== "super-admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "You can only view your own activity",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  const activity = await UserModel.getUserActivity(requestedUserId);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "User not found",
      code: "USER_NOT_FOUND",
    });
  }

  res.json({
    success: true,
    data: activity,
  });
});

// ✅ Get user list with pagination (admin only)
export const getUserList = asyncHandler(async (req, res) => {
  const userRole = req.user.role;

  if (userRole !== "admin" && userRole !== "super-admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can view user list",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  const {
    page = 1,
    limit = 10,
    department,
    batch,
    role,
    verified,
    search,
  } = req.query;

  const filters = {
    department,
    batch,
    role,
    verified: verified !== undefined ? verified === "true" : undefined,
    search,
  };

  const result = await UserModel.getUsersWithPagination(
    parseInt(page),
    parseInt(limit),
    filters,
  );

  res.json({
    success: true,
    data: result.users,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

// ✅ Update user status (admin only)
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userRole = req.user.role;

  if (userRole !== "admin" && userRole !== "super-admin") {
    return res.status(403).json({
      success: false,
      message: "Only admins can update user status",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  const validStatuses = ["active", "suspended", "inactive"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      code: "INVALID_STATUS",
    });
  }

  // Prevent self-suspension
  if (id == req.user.id && status === "suspended") {
    return res.status(400).json({
      success: false,
      message: "You cannot suspend your own account",
      code: "CANNOT_SUSPEND_SELF",
    });
  }

  await UserModel.updateUserStatus(id, status);

  res.json({
    success: true,
    message: `User status updated to ${status}`,
  });
});

// ✅ Delete user account (soft delete)
export const deleteUserAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userRole = req.user.role;
  const currentUserId = req.user.id;

  // Users can delete their own account, or admins can delete others
  if (
    id != currentUserId &&
    userRole !== "admin" &&
    userRole !== "super-admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own account",
      code: "INSUFFICIENT_PERMISSIONS",
    });
  }

  // Prevent admins from deleting other admins (unless super-admin)
  if (userRole === "admin") {
    const targetUser = await UserModel.findUserById(id);
    if (
      targetUser &&
      (targetUser.role === "admin" || targetUser.role === "super-admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Admins cannot delete other admin accounts",
        code: "CANNOT_DELETE_ADMIN",
      });
    }
  }

  await UserModel.deleteUserAccount(id);

  // If user deleted their own account, clear their session
  if (id == currentUserId) {
    // In a real app, you might want to blacklist the JWT token
    res.json({
      success: true,
      message: "Account deleted successfully. Please log out.",
      shouldLogout: true,
    });
  } else {
    res.json({
      success: true,
      message: "User account deleted successfully",
    });
  }
});
