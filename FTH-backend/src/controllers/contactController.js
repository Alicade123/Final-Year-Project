const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Public: create contact message
exports.createContact = async (req, res) => {
  try {
    const { full_name, email, phone, subject, message } = req.body;
    if (!full_name || !message)
      return res
        .status(400)
        .json({ message: "Name and message are required." });

    const result = await db.query(
      `INSERT INTO contacts (id, full_name, email, phone, subject, message, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        uuidv4(),
        full_name,
        email || null,
        phone || null,
        subject || null,
        message,
        JSON.stringify({ source: "web" }),
      ]
    );

    res.status(201).json({ message: "Message sent.", contact: result.rows[0] });
  } catch (err) {
    console.error("createContact error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin: list contacts (paginated)
exports.listContacts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 1000; // default: return all for admin
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const offset = (page - 1) * limit;

    const totalRes = await db.query("SELECT count(*) FROM contacts");
    const total = parseInt(totalRes.rows[0].count, 10);

    const dataRes = await db.query(
      `SELECT c.*, u.full_name as assigned_name
       FROM contacts c
       LEFT JOIN users u ON u.id = c.assigned_to
       ORDER BY c.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ total, page, limit, data: dataRes.rows });
  } catch (err) {
    console.error("listContacts error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin: get single contact
exports.getContact = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM contacts WHERE id = $1", [id]);
    if (!result.rows.length)
      return res.status(404).json({ message: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("getContact error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin: update contact
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;

    const updates = [];
    const values = [];
    let idx = 1;

    if (status) {
      updates.push(`status = $${idx++}`);
      values.push(status);
    }
    if (assigned_to) {
      updates.push(`assigned_to = $${idx++}`);
      values.push(assigned_to);
    }
    if (!updates.length)
      return res.status(400).json({ message: "No updates provided" });

    values.push(id);
    const sql = `UPDATE contacts SET ${updates.join(
      ", "
    )} WHERE id = $${idx} RETURNING *`;
    const result = await db.query(sql, values);

    res.json({ message: "Updated", contact: result.rows[0] });
  } catch (err) {
    console.error("updateContact error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
