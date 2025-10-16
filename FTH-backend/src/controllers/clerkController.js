// src/controllers/clerkController.js
const db = require("../config/db");

/**
 * Get Dashboard Overview Statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const clerkId = req.user.id;

    // Get clerk's hub
    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found for this clerk" });
    }

    const hubId = hubResult.rows[0].id;

    // Get total farmers
    const farmersResult = await db.query(
      `SELECT COUNT(DISTINCT farmer_id) as total 
       FROM lots WHERE hub_id = $1`,
      [hubId]
    );

    // Get total products
    const productsResult = await db.query(
      `SELECT COUNT(*) as total 
       FROM lots WHERE hub_id = $1 AND status = 'AVAILABLE'`,
      [hubId]
    );

    // Get active orders
    const ordersResult = await db.query(
      `SELECT COUNT(*) as total 
       FROM orders WHERE hub_id = $1 AND status IN ('PENDING', 'PAID')`,
      [hubId]
    );

    // Get monthly revenue
    const revenueResult = await db.query(
      `SELECT COALESCE(SUM(p.hub_fee), 0) as total
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE o.hub_id = $1 
       AND p.status = 'SUCCESS'
       AND p.created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [hubId]
    );

    res.json({
      farmers: parseInt(farmersResult.rows[0].total),
      products: parseInt(productsResult.rows[0].total),
      orders: parseInt(ordersResult.rows[0].total),
      revenue: parseFloat(revenueResult.rows[0].total),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};

/**
 * Get Recent Activity
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const clerkId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;

    // Get recent activities (orders, deliveries, payments)
    const activities = await db.query(
      `(SELECT 'order' as type, o.id, u.full_name as actor, 
        'Placed order #' || SUBSTRING(o.id::text, 1, 8) as description,
        o.created_at as timestamp
       FROM orders o
       JOIN users u ON o.buyer_id = u.id
       WHERE o.hub_id = $1
       ORDER BY o.created_at DESC
       LIMIT $2)
       UNION ALL
       (SELECT 'delivery' as type, l.id, u.full_name as actor,
        'Delivered ' || l.quantity || ' ' || l.unit || ' ' || l.produce_name as description,
        l.posted_at as timestamp
       FROM lots l
       JOIN users u ON l.farmer_id = u.id
       WHERE l.hub_id = $1
       ORDER BY l.posted_at DESC
       LIMIT $2)
       ORDER BY timestamp DESC
       LIMIT $2`,
      [hubId, limit]
    );

    res.json(activities.rows);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
};

/**
 * Get All Farmers for the Hub (including those with 0 deliveries)
 */
exports.getFarmers = async (req, res) => {
  try {
    const clerkId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // find hub managed by this clerk
    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;

    // list all farmers assigned to this hub, deliveries optional
    const farmers = await db.query(
      `SELECT
         u.id,
         u.full_name,
         u.phone,
         u.email,
         u.metadata->>'location' as location,
         u.is_active,
         u.created_at as joined,
         COUNT(l.id) as total_deliveries,
         COALESCE(SUM(l.quantity), 0) as total_quantity
       FROM users u
       LEFT JOIN lots l
         ON u.id = l.farmer_id
        AND l.hub_id = $1
       WHERE u.role = 'FARMER'
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $2 OFFSET $3`,
      [hubId, limit, offset]
    );

    // get total count of farmers for this hub
    const countResult = await db.query(
      `SELECT COUNT(*) as total
       FROM users u
       WHERE u.role = 'FARMER'`
    );

    res.json({
      farmers: farmers.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
};

/**
 * Get Farmer Details
 */
exports.getFarmerDetails = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const clerkId = req.user.id;

    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;

    // Get farmer details
    const farmer = await db.query(
      `SELECT u.id, u.full_name, u.phone, u.email, u.metadata, u.created_at
       FROM users u
       WHERE u.id = $1 AND u.role = 'FARMER'`,
      [farmerId]
    );

    if (farmer.rows.length === 0) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    // Get farmer's lots at this hub
    const lots = await db.query(
      `SELECT * FROM lots 
       WHERE farmer_id = $1 AND hub_id = $2
       ORDER BY posted_at DESC`,
      [farmerId, hubId]
    );

    // Get farmer's payouts
    const payouts = await db.query(
      `SELECT po.*, p.created_at as payment_date
       FROM payouts po
       JOIN payments p ON po.payment_id = p.id
       WHERE po.farmer_id = $1
       ORDER BY po.created_at DESC
       LIMIT 10`,
      [farmerId]
    );

    res.json({
      farmer: farmer.rows[0],
      lots: lots.rows,
      payouts: payouts.rows,
    });
  } catch (error) {
    console.error("Error fetching farmer details:", error);
    res.status(500).json({ error: "Failed to fetch farmer details" });
  }
};

/**
 * Add New Farmer
 */
const bcrypt = require("bcrypt");

exports.addFarmer = async (req, res) => {
  try {
    const { fullName, phone, email, password, location } = req.body;

    // Validate required fields
    if (!fullName || !phone || !password) {
      return res.status(400).json({
        error: "Full name, phone, and password are required",
      });
    }

    // Check if user already exists
    let existingUser;
    if (email) {
      existingUser = await db.query(
        "SELECT id FROM users WHERE phone = $1 OR email = $2",
        [phone, email]
      );
    } else {
      existingUser = await db.query("SELECT id FROM users WHERE phone = $1", [
        phone,
      ]);
    }

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Farmer with this phone or email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create metadata with location
    const metadata = location ? { location } : {};

    // Insert farmer
    const result = await db.query(
      `INSERT INTO users (full_name, phone, email, password_hash, role, metadata)
       VALUES ($1, $2, $3, $4, 'FARMER', $5)
       RETURNING id, full_name, phone, email, role, metadata, is_active, created_at`,
      [fullName, phone, email || null, passwordHash, JSON.stringify(metadata)]
    );

    // Create notification for the farmer
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'GENERAL', 'Welcome!', 
       'Your farmer account has been created. You can now start delivering produce.')`,
      [result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding farmer:", error);
    res.status(500).json({ error: "Failed to add farmer" });
  }
};

/*
Farmer update
*/
exports.updateFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { fullName, email, location, isActive } = req.body;

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
    if (location !== undefined) {
      updates.push(`metadata = metadata || $${paramCount++}::jsonb`);
      values.push(JSON.stringify({ location }));
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(isActive);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(farmerId);

    const result = await db.query(
      `UPDATE users 
       SET ${updates.join(", ")}
       WHERE id = $${paramCount} AND role = 'FARMER'
       RETURNING id, full_name, phone, email, role, metadata, is_active, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating farmer:", error);
    res.status(500).json({ error: "Failed to update farmer" });
  }
};

/*
Delete Farmer
*/
exports.deleteFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Check if farmer has any lots
    const lotsCheck = await db.query(
      "SELECT COUNT(*) as count FROM lots WHERE farmer_id = $1",
      [farmerId]
    );

    if (parseInt(lotsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error:
          "Cannot delete farmer with existing product deliveries. Please deactivate instead.",
      });
    }

    // Soft delete farmer
    const result = await db.query(
      "UPDATE users SET is_active = FALSE WHERE id = $1 AND role = 'FARMER' RETURNING *",
      [farmerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    // Return the updated farmer data (optional)
    res.status(200).json({
      message: "Farmer deleted successfully",
      farmer: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting farmer:", error);
    res.status(500).json({ error: "Failed to delete farmer" });
  }
};

/**
 * Get All Products/Lots in Hub
 */
exports.getProducts = async (req, res) => {
  try {
    const clerkId = req.user.id;
    const status = req.query.status || "AVAILABLE";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;

    const products = await db.query(
      `SELECT l.*, u.full_name as farmer_name, u.phone as farmer_phone
       FROM lots l
       JOIN users u ON l.farmer_id = u.id
       WHERE l.hub_id = $1 AND l.status = $2
       ORDER BY l.posted_at DESC
       LIMIT $3 OFFSET $4`,
      [hubId, status, limit, offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM lots 
       WHERE hub_id = $1 AND status = $2`,
      [hubId, status]
    );

    res.json({
      products: products.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * Register New Product/Lot
 */
// exports.registerProduct = async (req, res) => {
//   try {
//     const clerkId = req.user.id;
//     const {
//       farmerId,
//       produceName,
//       category,
//       quantity,
//       unit,
//       pricePerUnit,
//       expiryDate,
//       notes,
//     } = req.body;

//     // Validate required fields
//     if (!farmerId || !produceName || !quantity || !unit || !pricePerUnit) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const hubResult = await db.query(
//       "SELECT id FROM hubs WHERE manager_id = $1",
//       [clerkId]
//     );

//     if (hubResult.rows.length === 0) {
//       return res.status(404).json({ error: "Hub not found" });
//     }

//     const hubId = hubResult.rows[0].id;

//     // Generate lot code
//     const lotCode = `LOT-${Date.now()}-${Math.random()
//       .toString(36)
//       .substr(2, 9)
//       .toUpperCase()}`;

//     const result = await db.query(
//       `INSERT INTO lots (
//         hub_id, farmer_id, lot_code, produce_name, category,
//         quantity, unit, price_per_unit, expiry_date, notes
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//       RETURNING *`,
//       [
//         hubId,
//         farmerId,
//         lotCode,
//         produceName,
//         category,
//         quantity,
//         unit,
//         pricePerUnit,
//         expiryDate,
//         notes,
//       ]
//     );

//     // Create notification for farmer
//     await db.query(
//       `INSERT INTO notifications (user_id, type, title, message)
//        VALUES ($1, 'DELIVERY', 'Product Registered',
//        'Your delivery of ' || $2 || ' ' || $3 || ' ' || $4 || ' has been registered at the hub.')`,
//       [farmerId, quantity, unit, produceName]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error("Error registering product:", error);
//     res.status(500).json({ error: "Failed to register product" });
//   }
// };

exports.registerProduct = async (req, res) => {
  try {
    const clerkId = req.user.id;
    const {
      farmerId,
      produceName,
      category,
      quantity,
      unit,
      pricePerUnit,
      expiryDate,
      notes,
    } = req.body;

    if (!farmerId || !produceName || !quantity || !unit || !pricePerUnit) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await db.transaction(async (client) => {
      // 🏢 1. Find hub managed by clerk
      const hubRes = await client.query(
        `SELECT id, name FROM hubs WHERE manager_id = $1`,
        [clerkId]
      );
      if (hubRes.rows.length === 0) throw new Error("Hub not found");
      const hub = hubRes.rows[0];

      // 🔢 2. Generate unique lot code
      const lotCode = `LOT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`;

      // 📦 3. Insert product/lot
      const lotRes = await client.query(
        `INSERT INTO lots (
          hub_id, farmer_id, lot_code, produce_name, category,
          quantity, unit, price_per_unit, expiry_date, notes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *`,
        [
          hub.id,
          farmerId,
          lotCode,
          produceName,
          category,
          quantity,
          unit,
          pricePerUnit,
          expiryDate,
          notes,
        ]
      );

      const lot = lotRes.rows[0];
      const totalValue = parseFloat(quantity) * parseFloat(pricePerUnit);

      // 💰 4. Compute payment details
      const hubFeeRate = 0.1; // 10% commission (adjust as needed)
      const hubFee = totalValue * hubFeeRate;
      const farmerAmount = totalValue - hubFee;

      // 🧾 5. Create a minimal order record (auto-generated)
      const orderRes = await client.query(
        `INSERT INTO orders (buyer_id, hub_id, total_amount, status)
         VALUES ($1, $2, $3, 'PAID')
         RETURNING id`,
        [clerkId, hub.id, totalValue]
      );
      const orderId = orderRes.rows[0].id;

      // 💳 6. Insert payment record (fully compliant with schema)
      const paymentRes = await client.query(
        `INSERT INTO payments (
          order_id, amount, hub_fee, farmer_amount,
          method, status, payer_id, payer_role, payee_id, payee_role,
          target_entity, description, paid_at
        ) VALUES ($1,$2,$3,$4,'ONLINE','SUCCESS',$5,'CLERK',$6,'FARMER',$7,$8,NOW())
        RETURNING *`,
        [
          orderId,
          totalValue,
          hubFee,
          farmerAmount,
          clerkId,
          farmerId,
          hub.id,
          `Payment for ${quantity} ${unit} of ${produceName} from ${hub.name}`,
        ]
      );

      // 👩‍🌾 7. Record payout (completed instantly)
      await client.query(
        `INSERT INTO payouts (payment_id, farmer_id, amount, status, created_at)
         VALUES ($1, $2, $3, 'SENT', NOW())`,
        [paymentRes.rows[0].id, farmerId, farmerAmount]
      );

      // 🔔 8. Notify farmer
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'PAYMENT', 'Payment Received',
         'You have received $' || $2 || ' for your registered product: ' || $3)`,
        [farmerId, farmerAmount.toFixed(2), produceName]
      );

      return { lot, payment: paymentRes.rows[0] };
    });

    res.status(201).json({
      message: "✅ Product registered and payment processed successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error registering product and payment:", error);
    res.status(500).json({
      error: error.message || "Failed to register product and process payment",
    });
  }
};

/**
 * Update Product/Lot
 */
exports.updateProduct = async (req, res) => {
  try {
    const { lotId } = req.params;
    const { quantity, pricePerUnit, status, notes } = req.body;
    const clerkId = req.user.id;

    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;

    // Verify lot belongs to this hub
    const lotCheck = await db.query(
      "SELECT * FROM lots WHERE id = $1 AND hub_id = $2",
      [lotId, hubId]
    );

    if (lotCheck.rows.length === 0) {
      return res.status(404).json({ error: "Lot not found" });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (quantity !== undefined) {
      updates.push(`quantity = $${paramCount++}`);
      values.push(quantity);
    }
    if (pricePerUnit !== undefined) {
      updates.push(`price_per_unit = $${paramCount++}`);
      values.push(pricePerUnit);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(lotId);

    const result = await db.query(
      `UPDATE lots SET ${updates.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

/**
 * Delete Product/Lot
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { lotId } = req.params;
    const clerkId = req.user.id;

    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;

    // Check if lot has orders
    const orderCheck = await db.query(
      "SELECT * FROM order_items WHERE lot_id = $1",
      [lotId]
    );

    if (orderCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete lot with existing orders" });
    }

    await db.query("DELETE FROM lots WHERE id = $1 AND hub_id = $2", [
      lotId,
      hubId,
    ]);

    res.json({ message: "Product deleted successfully" }); // <-- send JSON
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

/**
 * Get All Orders
 */
exports.getOrders = async (req, res) => {
  try {
    const clerkId = req.user.id;
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;

    let query = `
      SELECT o.*, 
        u.full_name as buyer_name, 
        u.phone as buyer_phone,
        p.status as payment_status,
        p.method as payment_method
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.hub_id = $1
    `;

    const params = [hubId];

    if (status) {
      query += ` AND o.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const orders = await db.query(query, params);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.rows.map(async (order) => {
        const items = await db.query(
          `SELECT oi.*, l.produce_name, l.unit
           FROM order_items oi
           JOIN lots l ON oi.lot_id = l.id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: items.rows };
      })
    );

    const countQuery = status
      ? "SELECT COUNT(*) as total FROM orders WHERE hub_id = $1 AND status = $2"
      : "SELECT COUNT(*) as total FROM orders WHERE hub_id = $1";

    const countParams = status ? [hubId, status] : [hubId];
    const countResult = await db.query(countQuery, countParams);

    res.json({
      orders: ordersWithItems,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

/**
 * Get Order Details
 */
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const clerkId = req.user.id;

    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;

    const order = await db.query(
      `SELECT o.*, 
        u.full_name as buyer_name, 
        u.phone as buyer_phone,
        u.email as buyer_email,
        p.status as payment_status,
        p.method as payment_method,
        p.paid_at,
        p.hub_fee,
        p.farmer_amount
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.id = $1 AND o.hub_id = $2`,
      [orderId, hubId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await db.query(
      `SELECT oi.*, 
        l.produce_name, 
        l.unit, 
        l.lot_code,
        u.full_name as farmer_name
       FROM order_items oi
       JOIN lots l ON oi.lot_id = l.id
       JOIN users u ON l.farmer_id = u.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    res.json({
      ...order.rows[0],
      items: items.rows,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
};

/**
 * Update Order Status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const clerkId = req.user.id;

    if (!["PENDING", "PAID", "FULFILLED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;

    const result = await db.query(
      `UPDATE orders SET status = $1 
       WHERE id = $2 AND hub_id = $3 
       RETURNING *`,
      [status, orderId, hubId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Notify buyer
    const order = result.rows[0];
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'ORDER', 'Order Status Updated', 
       'Your order #' || SUBSTRING($2::text, 1, 8) || ' status: ' || $3)`,
      [order.buyer_id, orderId, status]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

/**
 * Get Payouts
 */
exports.getPayouts = async (req, res) => {
  try {
    const clerkId = req.user.id;
    const status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;

    let query = `
      SELECT po.*, 
        u.full_name as farmer_name,
        u.phone as farmer_phone,
        p.created_at as payment_date,
        o.id as order_id
      FROM payouts po
      JOIN users u ON po.farmer_id = u.id
      JOIN payments p ON po.payment_id = p.id
      JOIN orders o ON p.order_id = o.id
      WHERE o.hub_id = $1
    `;

    const params = [hubId];

    if (status) {
      query += ` AND po.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY po.created_at DESC LIMIT $${
      params.length + 1
    } OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const payouts = await db.query(query, params);

    const countQuery = status
      ? `SELECT COUNT(*) as total FROM payouts po 
         JOIN payments p ON po.payment_id = p.id
         JOIN orders o ON p.order_id = o.id
         WHERE o.hub_id = $1 AND po.status = $2`
      : `SELECT COUNT(*) as total FROM payouts po
         JOIN payments p ON po.payment_id = p.id
         JOIN orders o ON p.order_id = o.id
         WHERE o.hub_id = $1`;

    const countParams = status ? [hubId, status] : [hubId];
    const countResult = await db.query(countQuery, countParams);

    res.json({
      payouts: payouts.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    res.status(500).json({ error: "Failed to fetch payouts" });
  }
};

/**
 * Process Payout (mark as sent)
 */
exports.processPayout = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { providerRef } = req.body;
    const clerkId = req.user.id;

    const hubResult = await db.query(
      "SELECT id FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const result = await db.query(
      `UPDATE payouts 
       SET status = 'SENT', provider_ref = $1, paid_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [providerRef, payoutId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Payout not found" });
    }

    // Notify farmer
    const payout = result.rows[0];
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'PAYOUT', 'Payment Sent', 
       'Your payment of $' || $2 || ' has been processed.')`,
      [payout.farmer_id, payout.amount]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error processing payout:", error);
    res.status(500).json({ error: "Failed to process payout" });
  }
};

/**
 * Get Reports Data
 */
exports.getReports = async (req, res) => {
  try {
    const clerkId = req.user.id;
    const { startDate, endDate, type } = req.query;

    const hubResult = await db.query(
      "SELECT id, name FROM hubs WHERE manager_id = $1",
      [clerkId]
    );

    if (hubResult.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubId = hubResult.rows[0].id;
    const hubName = hubResult.rows[0].name;

    const start = startDate || "2020-01-01";
    const end = endDate || new Date().toISOString().split("T")[0];

    let reportData = {};

    // Revenue Report
    if (!type || type === "revenue") {
      const revenue = await db.query(
        `SELECT 
          DATE_TRUNC('month', p.created_at) as month,
          SUM(p.hub_fee) as hub_revenue,
          SUM(p.farmer_amount) as farmer_amount,
          SUM(p.amount) as total_amount,
          COUNT(p.id) as transaction_count
         FROM payments p
         JOIN orders o ON p.order_id = o.id
         WHERE o.hub_id = $1 
         AND p.status = 'SUCCESS'
         AND p.created_at BETWEEN $2 AND $3
         GROUP BY DATE_TRUNC('month', p.created_at)
         ORDER BY month DESC`,
        [hubId, start, end]
      );
      reportData.revenue = revenue.rows;
    }

    // Sales Report
    if (!type || type === "sales") {
      const sales = await db.query(
        `SELECT 
          l.produce_name,
          l.category,
          SUM(oi.quantity) as total_quantity,
          l.unit,
          COUNT(DISTINCT oi.order_id) as order_count,
          SUM(oi.subtotal) as total_revenue
         FROM order_items oi
         JOIN lots l ON oi.lot_id = l.id
         JOIN orders o ON oi.order_id = o.id
         WHERE l.hub_id = $1
         AND o.created_at BETWEEN $2 AND $3
         GROUP BY l.produce_name, l.category, l.unit
         ORDER BY total_revenue DESC`,
        [hubId, start, end]
      );
      reportData.sales = sales.rows;
    }

    // Farmer Report
    if (!type || type === "farmers") {
      const farmers = await db.query(
        `SELECT 
          u.id,
          u.full_name,
          COUNT(DISTINCT l.id) as total_deliveries,
          SUM(l.quantity) as total_quantity,
          SUM(po.amount) as total_earned
         FROM users u
         JOIN lots l ON u.id = l.farmer_id
         LEFT JOIN payouts po ON u.id = po.farmer_id
         WHERE l.hub_id = $1
         AND l.posted_at BETWEEN $2 AND $3
         GROUP BY u.id, u.full_name
         ORDER BY total_earned DESC`,
        [hubId, start, end]
      );
      reportData.farmers = farmers.rows;
    }

    res.json({
      hubName,
      period: { start, end },
      ...reportData,
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    res.status(500).json({ error: "Failed to generate reports" });
  }
};

/**
 * Get Notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const clerkId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const notifications = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [clerkId, limit, offset]
    );

    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM notifications WHERE user_id = $1",
      [clerkId]
    );

    const unreadCount = await db.query(
      "SELECT COUNT(*) as total FROM notifications WHERE user_id = $1 AND is_read = FALSE",
      [clerkId]
    );

    res.json({
      notifications: notifications.rows,
      total: parseInt(countResult.rows[0].total),
      unread: parseInt(unreadCount.rows[0].total),
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

/**
 * Mark Notification as Read
 */
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const clerkId = req.user.id;

    const result = await db.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [notificationId, clerkId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
};

/**
 * Mark All Notifications as Read
 */
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const clerkId = req.user.id;

    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
      [clerkId]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

/**
 * Get Hub Settings
 */
exports.getHubSettings = async (req, res) => {
  try {
    const clerkId = req.user.id;

    const hub = await db.query(
      `SELECT h.*, u.full_name as manager_name, u.email as manager_email, u.phone as manager_phone
       FROM hubs h
       JOIN users u ON h.manager_id = u.id
       WHERE h.manager_id = $1`,
      [clerkId]
    );

    if (hub.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    res.json(hub.rows[0]);
  } catch (error) {
    console.error("Error fetching hub settings:", error);
    res.status(500).json({ error: "Failed to fetch hub settings" });
  }
};

/**
 * Update Hub Settings
 */
exports.updateHubSettings = async (req, res) => {
  try {
    const clerkId = req.user.id;
    const { name, location } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = ${paramCount++}`);
      values.push(name);
    }
    if (location) {
      updates.push(`location = ${paramCount++}`);
      values.push(location);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(clerkId);

    const result = await db.query(
      `UPDATE hubs SET ${updates.join(", ")} 
       WHERE manager_id = ${paramCount} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hub not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating hub settings:", error);
    res.status(500).json({ error: "Failed to update hub settings" });
  }
};
