// src/controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

/**
 * Generate JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Register new user
 */
exports.register = async (req, res) => {
  try {
    const { fullName, phone, email, password, role, metadata } = req.body;

    // Validate required fields
    if (!fullName || !phone || !password || !role) {
      return res.status(400).json({
        error: "Missing required fields: fullName, phone, password, role",
      });
    }

    // Validate role
    if (!["FARMER", "CLERK", "BUYER"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Must be FARMER, CLERK, or BUYER",
      });
    }

    // Check if user already exists
    const existingUser = await db.query(
      "SELECT id FROM users WHERE phone = $1 OR email = $2",
      [phone, email || null]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "User with this phone or email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.query(
      `INSERT INTO users (full_name, phone, email, password_hash, role, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, phone, email, role, created_at`,
      [fullName, phone, email || null, passwordHash, role, metadata || {}]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

exports.registerFarmer = async (req, res) => {
  try {
    const { full_name, phone, email, password } = req.body;

    const exists = await db.query(
      "SELECT id FROM users WHERE phone = $1 OR email = $2",
      [phone, email]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newFarmer = await db.query(
      `INSERT INTO users (full_name, phone, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, 'BUYER', TRUE)
       RETURNING id, full_name, phone, email, role`,
      [full_name, phone, email, password_hash]
    );

    res.status(201).json({
      message: "Farmer account created successfully!",
      user: newFarmer.rows[0],
    });
  } catch (err) {
    console.error("Farmer signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate required fields
    if (!phone || !password) {
      return res.status(400).json({
        error: "Phone and password are required",
      });
    }

    // Find user
    const result = await db.query(
      `SELECT id, full_name, phone, email, password_hash, role, is_active 
       FROM users 
       WHERE phone = $1`,
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ error: "Account is inactive" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Remove password hash from response
    delete user.password_hash;

    res.json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT id, full_name, phone, email, role, metadata, is_active, created_at
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, email, metadata } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (fullName) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (metadata) {
      updates.push(`metadata = $${paramCount++}`);
      values.push(metadata);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(userId);

    const result = await db.query(
      `UPDATE users 
       SET ${updates.join(", ")}
       WHERE id = $${paramCount}
       RETURNING id, full_name, phone, email, role, metadata, created_at`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long",
      });
    }

    // Get current password hash
    const result = await db.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newPasswordHash,
      userId,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

/**
 * Logout (token blacklist can be implemented here)
 */
exports.logout = async (req, res) => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return a success message
    // The client should delete the token

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};
