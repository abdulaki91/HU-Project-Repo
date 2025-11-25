import bcrypt from "bcryptjs";
import * as UserModel from "../models/userModel.js";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, batch, department } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const [existingUser] = await UserModel.getUserByEmail(email);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

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
      role
    );

    // Send verification email
    const verifyUrl = `${process.env.BACKEND_URL}/api/user/verify/${verificationToken}`;
    await sendEmail({
      email,
      subject: "Verify your account",
      verifyUrl,
      name: `${firstName} ${lastName}`,
    });

    res.status(201).json({
      message: `User registered successfully. Please check your email to verify.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await UserModel.loginQuery(email);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        batch: user.batch,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
