// src/helpers/googleUserHelper.js
const db = require("../config/db"); // your database client
const { v4: uuidv4 } = require("uuid");

async function findOrCreateUserByGoogle({ googleId, email, name }) {
  // Check if user exists by google_id
  const result = await db.query("SELECT * FROM users WHERE google_id = $1", [
    googleId,
  ]);
  if (result.rows.length > 0) return result.rows[0];

  // Check if user exists by email (optional: link account)
  const emailCheck = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (emailCheck.rows.length > 0) {
    // Link Google ID to existing user
    const user = emailCheck.rows[0];
    await db.query("UPDATE users SET google_id = $1 WHERE id = $2", [
      googleId,
      user.id,
    ]);
    return { ...user, google_id: googleId };
  }

  // If not, create new BUYER user
  const newUser = {
    id: uuidv4(),
    full_name: name || "Google User",
    phone: null,
    email: email || null,
    password_hash: null,
    role: "BUYER",
    google_id: googleId,
    is_active: true,
    metadata: JSON.stringify({ signup_via: "google" }),
  };

  const insertQuery = `
    INSERT INTO users
    (id, full_name, phone, email, password_hash, role, google_id, is_active, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`;

  const insertResult = await db.query(insertQuery, [
    newUser.id,
    newUser.full_name,
    newUser.phone,
    newUser.email,
    newUser.password_hash,
    newUser.role,
    newUser.google_id,
    newUser.is_active,
    newUser.metadata,
  ]);

  return insertResult.rows[0];
}

module.exports = { findOrCreateUserByGoogle };
