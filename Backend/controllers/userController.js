import * as UserModel from "../models/userModel.js";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/email.js";
import dotenv from "dotenv";
dotenv.config();

/* =============================================
   Create users table
============================================= */
export const createUserTableController = async (req, res, next) => {
  try {
    await UserModel.createUsersTable();
    res.status(200).json({ message: "Users table is ready." });
  } catch (err) {
    next(err);
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await UserModel.getUserByToken(token);

    if (user.length === 0) {
      return res.status(400).send("<h3>Invalid or expired token.</h3>");
    }

    await verifyUser(user[0].id);
    return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (err) {
    console.error(err);
    return res.status(404).send("<h3>Verification failed. Try again.</h3>");
  }
};

/* =============================================
   Login user
============================================= */

/* =============================================
   Get user by ID
============================================= */
export const getUserByIdController = async (req, res) => {
  try {
    const id = req.user.id || 10;
    const user = await UserModel.findUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
};

/* =============================================
   Update user profile
============================================= */
export const updateUserController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, batch, department } = req.body;

    const userId = req.user.id;
    if (parseInt(id) !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own account" });
    }

    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let verificationToken = null;

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
        message:
          "Email updated. Please check your new email to verify your account.",
      });
    }

    await UserModel.updateUser(userId, {
      firstName,
      lastName,
      batch,
      department,
    });
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    next(err);
  }
};

/* =============================================
   Change user password
============================================= */
export const changeUserPassword = async (req, res, next) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    await UserModel.changePassword(user.id, newPassword);

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    next(err);
  }
};
