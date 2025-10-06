// src/controllers/adminController.js
const db = require("../config/db");
const bcrypt = require("bcrypt");
// ✅ Users
// ✅ Users with filtering, searching & pagination
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    let conditions = [];
    let values = [];
    let idx = 1;

    // Filter by role
    if (role) {
      conditions.push(`role = $${idx++}`);
      values.push(role.toUpperCase());
    }

    // Search by name, email, or phone
    if (search) {
      conditions.push(
        `(full_name ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx})`
      );
      values.push(`%${search}%`);
      idx++;
    }

    // Build WHERE clause
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total
    const countQuery = `SELECT COUNT(*) FROM users ${where}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count, 10);

    // Paginated query
    const query = `
      SELECT id, full_name, phone, email, role, is_active
      FROM users
      ${where}
      ORDER BY created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    const result = await db.query(query, [...values, limit, offset]);

    res.json({
      users: result.rows,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10); // hash the password

    const result = await db.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, is_active) 
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, full_name, email, role, is_active`,
      [full_name, email, phone, hash, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT id, full_name, email, role, is_active FROM users WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { full_name, email, phone, role, is_active, password } = req.body;

    let query, params;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      query = `
        UPDATE users
        SET full_name=$1, email=$2, phone=$3, role=$4, is_active=$5, password_hash=$6
        WHERE id=$7
        RETURNING id, full_name, email, role, is_active
      `;
      params = [full_name, email, phone, role, is_active, hash, req.params.id];
    } else {
      query = `
        UPDATE users
        SET full_name=$1, email=$2, phone=$3, role=$4, is_active=$5
        WHERE id=$6
        RETURNING id, full_name, email, role, is_active
      `;
      params = [full_name, email, phone, role, is_active, req.params.id];
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ✅ Hubs
exports.getAllHubs = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT h.id, h.name, h.location, h.manager_id, u.full_name AS manager_name
      FROM hubs h
      LEFT JOIN users u ON h.manager_id = u.id
      ORDER BY h.id DESC
    `);
    res.json({
      hubs: result.rows,
      total: result.rowCount,
    });
  } catch (err) {
    next(err);
  }
};

// Check if the selected clerk is already assigned to a hub
const checkClerkAssigned = async (manager_id) => {
  if (!manager_id) return false; // no manager selected
  const res = await db.query("SELECT id FROM hubs WHERE manager_id = $1", [
    manager_id,
  ]);
  return res.rows.length > 0;
};

exports.createHub = async (req, res, next) => {
  try {
    const { name, location, manager_id } = req.body;

    // Restrict clerk if already assigned
    if (await checkClerkAssigned(manager_id)) {
      return res
        .status(400)
        .json({ error: "This clerk is already managing another hub" });
    }

    const result = await db.query(
      `INSERT INTO hubs (name, location, manager_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, location, manager_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateHub = async (req, res, next) => {
  try {
    const { name, location, manager_id } = req.body;

    // Restrict clerk if already assigned to another hub (excluding current hub)
    if (manager_id) {
      const resCheck = await db.query(
        "SELECT id FROM hubs WHERE manager_id=$1 AND id <> $2",
        [manager_id, req.params.id]
      );
      if (resCheck.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "This clerk is already managing another hub" });
      }
    }

    const result = await db.query(
      "UPDATE hubs SET name=$1, location=$2, manager_id=$3 WHERE id=$4 RETURNING *",
      [name, location, manager_id || null, req.params.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Hub not found" });

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.deleteHub = async (req, res, next) => {
  try {
    const result = await db.query(
      "DELETE FROM hubs WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Hub not found" });
    res.json({ message: "Hub deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// backend: adminController.js
exports.getClerks = async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT id, full_name FROM users WHERE role = 'CLERK'"
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
