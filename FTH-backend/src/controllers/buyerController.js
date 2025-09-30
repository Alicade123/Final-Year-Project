const { pool } = require("../config/db");

exports.listAvailableLots = async (req, res) => {
  const q = `SELECT l.*, u.full_name as farmer_name FROM lots l JOIN users u ON u.id = l.farmer_id WHERE l.status = 'AVAILABLE' AND l.quantity > 0 ORDER BY posted_at DESC`;
  try {
    const { rows } = await pool.query(q);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch lots" });
  }
};

/**
 * createOrder: expects { buyer_id, hub_id, items: [{lot_id, quantity}] }
 * This function:
 *  - checks availability
 *  - creates order row
 *  - creates order_items
 *  - decreases lot quantities or flags RESERVED
 *  - returns created order
 */
exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { buyer_id, hub_id, items } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ error: "No items" });

    await client.query("BEGIN");

    // compute totals and validate availability
    let total = 0;
    const orderItems = [];

    for (const it of items) {
      const { lot_id, quantity } = it;
      const lotRes = await client.query(
        "SELECT quantity, price_per_unit, status FROM lots WHERE id = $1 FOR UPDATE",
        [lot_id]
      );
      if (lotRes.rowCount === 0) throw new Error("Lot not found");
      const lot = lotRes.rows[0];
      if (lot.status !== "AVAILABLE" || Number(lot.quantity) < Number(quantity))
        throw new Error("Insufficient quantity or lot not available");

      const subtotal = Number(quantity) * Number(lot.price_per_unit);
      total += subtotal;
      orderItems.push({
        lot_id,
        quantity,
        unit_price: lot.price_per_unit,
        subtotal,
      });

      // reduce lot quantity (simple approach)
      const newQty = Number(lot.quantity) - Number(quantity);
      const newStatus = newQty <= 0 ? "RESERVED" : "AVAILABLE";
      await client.query(
        "UPDATE lots SET quantity = $1, status = $2 WHERE id = $3",
        [newQty, newStatus, lot_id]
      );
    }

    const orderRes = await client.query(
      "INSERT INTO orders(buyer_id, hub_id, total_amount) VALUES($1,$2,$3) RETURNING id, buyer_id, hub_id, total_amount, status",
      [buyer_id, hub_id, total]
    );

    const orderId = orderRes.rows[0].id;
    for (const oi of orderItems) {
      await client.query(
        "INSERT INTO order_items(order_id, lot_id, quantity, unit_price, subtotal) VALUES($1,$2,$3,$4,$5)",
        [orderId, oi.lot_id, oi.quantity, oi.unit_price, oi.subtotal]
      );
    }

    await client.query("COMMIT");
    return res.status(201).json(orderRes.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res
      .status(400)
      .json({ error: err.message || "Failed to create order" });
  } finally {
    client.release();
  }
};
