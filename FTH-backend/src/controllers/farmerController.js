// src/controllers/farmerController.js
const db = require("../config/db");

/**
 * Get Farmer Dashboard Overview Statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Get total deliveries
    const deliveriesResult = await db.query(
      "SELECT COUNT(*) as total FROM lots WHERE farmer_id = $1",
      [farmerId]
    );

    // Get available products
    const availableResult = await db.query(
      `SELECT COUNT(*) as total, COALESCE(SUM(quantity), 0) as total_quantity
       FROM lots WHERE farmer_id = $1 AND status = 'AVAILABLE'`,
      [farmerId]
    );

    // Get sold products
    const soldResult = await db.query(
      `SELECT COUNT(*) as total, COALESCE(SUM(quantity), 0) as total_quantity
       FROM lots WHERE farmer_id = $1 AND status = 'SOLD'`,
      [farmerId]
    );

    // Get total earnings (from payouts)
    const earningsResult = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM payouts WHERE farmer_id = $1 AND status = 'SENT'`,
      [farmerId]
    );

    // Get pending earnings
    const pendingResult = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM payouts WHERE farmer_id = $1 AND status = 'PENDING'`,
      [farmerId]
    );

    res.json({
      totalDeliveries: parseInt(deliveriesResult.rows[0].total),
      availableProducts: parseInt(availableResult.rows[0].total),
      availableQuantity: parseFloat(availableResult.rows[0].total_quantity),
      soldProducts: parseInt(soldResult.rows[0].total),
      soldQuantity: parseFloat(soldResult.rows[0].total_quantity),
      totalEarnings: parseFloat(earningsResult.rows[0].total),
      pendingEarnings: parseFloat(pendingResult.rows[0].total),
    });
  } catch (error) {
    console.error("Error fetching farmer dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};

/**
 * Get Farmer's Products/Lots
 */
exports.getMyProducts = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        l.*,
        h.name as hub_name,
        h.location as hub_location
      FROM lots l
      JOIN hubs h ON l.hub_id = h.id
      WHERE l.farmer_id = $1
    `;

    const params = [farmerId];

    if (status) {
      query += ` AND l.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY l.posted_at DESC LIMIT $${params.length + 1} OFFSET $${
      params.length + 2
    }`;
    params.push(limit, offset);

    const products = await db.query(query, params);

    // Get total count
    const countQuery = status
      ? "SELECT COUNT(*) as total FROM lots WHERE farmer_id = $1 AND status = $2"
      : "SELECT COUNT(*) as total FROM lots WHERE farmer_id = $1";

    const countParams = status ? [farmerId, status] : [farmerId];
    const countResult = await db.query(countQuery, countParams);

    res.json({
      products: products.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching farmer products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * Get Available Hubs for Delivery
 */
exports.getAvailableHubs = async (req, res) => {
  try {
    const hubs = await db.query(
      `SELECT 
        h.id,
        h.name,
        h.location,
        u.full_name as manager_name,
        u.phone as manager_phone
       FROM hubs h
       LEFT JOIN users u ON h.manager_id = u.id
       ORDER BY h.name`
    );

    res.json(hubs.rows);
  } catch (error) {
    console.error("Error fetching hubs:", error);
    res.status(500).json({ error: "Failed to fetch hubs" });
  }
};

/**
 * Register New Delivery (Create Lot)
 * This would typically be done by clerk, but farmer can request/initiate
 */
exports.requestDelivery = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const {
      hubId,
      produceName,
      category,
      quantity,
      unit,
      pricePerUnit,
      expiryDate,
      notes,
    } = req.body;

    // Validate required fields
    if (!hubId || !produceName || !quantity || !unit || !pricePerUnit) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate lot code
    const lotCode = `LOT-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const result = await db.query(
      `INSERT INTO lots (
        hub_id, farmer_id, lot_code, produce_name, category,
        quantity, unit, price_per_unit, expiry_date, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'AVAILABLE')
      RETURNING *`,
      [
        hubId,
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

    // Create notification for farmer
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, 'DELIVERY', 'Delivery Registered', 
       'Your delivery of ' || $2 || ' ' || $3 || ' ' || $4 || ' has been registered.')`,
      [farmerId, quantity, unit, produceName]
    );

    // Notify hub manager
    const hub = await db.query("SELECT manager_id FROM hubs WHERE id = $1", [
      hubId,
    ]);
    if (hub.rows[0] && hub.rows[0].manager_id) {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'DELIVERY', 'New Delivery', 
         'New delivery of ' || $2 || ' ' || $3 || ' ' || $4 || ' received.')`,
        [hub.rows[0].manager_id, quantity, unit, produceName]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error registering delivery:", error);
    res.status(500).json({ error: "Failed to register delivery" });
  }
};

/**
 * Get Delivery History
 */
exports.getDeliveryHistory = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate || "2020-01-01";
    const end = endDate || new Date().toISOString().split("T")[0];

    const deliveries = await db.query(
      `SELECT 
        l.*,
        h.name as hub_name,
        h.location as hub_location
       FROM lots l
       JOIN hubs h ON l.hub_id = h.id
       WHERE l.farmer_id = $1
       AND l.posted_at BETWEEN $2 AND $3
       ORDER BY l.posted_at DESC`,
      [farmerId, start, end]
    );

    res.json({
      period: { start, end },
      deliveries: deliveries.rows,
    });
  } catch (error) {
    console.error("Error fetching delivery history:", error);
    res.status(500).json({ error: "Failed to fetch delivery history" });
  }
};

/**
 * Get Payouts
 */
exports.getPayouts = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        po.*,
        p.created_at as payment_date,
        o.id as order_id,
        o.total_amount as order_total
      FROM payouts po
      JOIN payments p ON po.payment_id = p.id
      JOIN orders o ON p.order_id = o.id
      WHERE po.farmer_id = $1
    `;

    const params = [farmerId];

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
      ? "SELECT COUNT(*) as total FROM payouts WHERE farmer_id = $1 AND status = $2"
      : "SELECT COUNT(*) as total FROM payouts WHERE farmer_id = $1";

    const countParams = status ? [farmerId, status] : [farmerId];
    const countResult = await db.query(countQuery, countParams);

    res.json({
      payouts: payouts.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    res.status(500).json({ error: "Failed to fetch payouts" });
  }
};

/**
 * Get Payout Details
 */
exports.getPayoutDetails = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const farmerId = req.user.id;

    const payout = await db.query(
      `SELECT 
        po.*,
        p.amount as payment_amount,
        p.hub_fee,
        p.method as payment_method,
        p.created_at as payment_date,
        o.id as order_id,
        o.total_amount as order_total,
        h.name as hub_name
       FROM payouts po
       JOIN payments p ON po.payment_id = p.id
       JOIN orders o ON p.order_id = o.id
       JOIN hubs h ON o.hub_id = h.id
       WHERE po.id = $1 AND po.farmer_id = $2`,
      [payoutId, farmerId]
    );

    if (payout.rows.length === 0) {
      return res.status(404).json({ error: "Payout not found" });
    }

    // Get related order items from this farmer
    const items = await db.query(
      `SELECT 
        oi.*,
        l.produce_name,
        l.unit,
        l.lot_code
       FROM order_items oi
       JOIN lots l ON oi.lot_id = l.id
       WHERE oi.order_id = (
         SELECT order_id FROM payments WHERE id = $1
       )
       AND l.farmer_id = $2`,
      [payout.rows[0].payment_id, farmerId]
    );

    res.json({
      ...payout.rows[0],
      items: items.rows,
    });
  } catch (error) {
    console.error("Error fetching payout details:", error);
    res.status(500).json({ error: "Failed to fetch payout details" });
  }
};

/**
 * Get Earnings Analytics
 */
exports.getEarningsAnalytics = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate || "2020-01-01";
    const end = endDate || new Date().toISOString().split("T")[0];

    // Monthly earnings
    const monthlyEarnings = await db.query(
      `SELECT 
        DATE_TRUNC('month', po.created_at) as month,
        SUM(po.amount) as total_earned,
        COUNT(po.id) as payout_count
       FROM payouts po
       WHERE po.farmer_id = $1 
       AND po.status = 'SENT'
       AND po.created_at BETWEEN $2 AND $3
       GROUP BY DATE_TRUNC('month', po.created_at)
       ORDER BY month DESC`,
      [farmerId, start, end]
    );

    // Product performance
    const productPerformance = await db.query(
      `SELECT 
        l.produce_name,
        l.category,
        SUM(l.quantity) as total_delivered,
        l.unit,
        COUNT(DISTINCT l.id) as delivery_count,
        AVG(l.price_per_unit) as avg_price,
        SUM(
          CASE WHEN l.status = 'SOLD' 
          THEN l.quantity * l.price_per_unit 
          ELSE 0 END
        ) as total_revenue
       FROM lots l
       WHERE l.farmer_id = $1
       AND l.posted_at BETWEEN $2 AND $3
       GROUP BY l.produce_name, l.category, l.unit
       ORDER BY total_revenue DESC`,
      [farmerId, start, end]
    );

    // Hub breakdown
    const hubBreakdown = await db.query(
      `SELECT 
        h.name as hub_name,
        h.location,
        COUNT(l.id) as delivery_count,
        SUM(CASE WHEN l.status = 'SOLD' THEN 1 ELSE 0 END) as sold_count,
        SUM(l.quantity) as total_quantity
       FROM lots l
       JOIN hubs h ON l.hub_id = h.id
       WHERE l.farmer_id = $1
       AND l.posted_at BETWEEN $2 AND $3
       GROUP BY h.id, h.name, h.location
       ORDER BY delivery_count DESC`,
      [farmerId, start, end]
    );

    res.json({
      period: { start, end },
      monthlyEarnings: monthlyEarnings.rows,
      productPerformance: productPerformance.rows,
      hubBreakdown: hubBreakdown.rows,
    });
  } catch (error) {
    console.error("Error fetching earnings analytics:", error);
    res.status(500).json({ error: "Failed to fetch earnings analytics" });
  }
};

/**
 * Get Sales Summary
 */
exports.getSalesSummary = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Get sold lots with order details
    const sales = await db.query(
      `SELECT 
        l.*,
        h.name as hub_name,
        oi.order_id,
        oi.quantity as sold_quantity,
        oi.unit_price,
        oi.subtotal,
        o.created_at as order_date,
        o.status as order_status
       FROM lots l
       JOIN hubs h ON l.hub_id = h.id
       LEFT JOIN order_items oi ON l.id = oi.lot_id
       LEFT JOIN orders o ON oi.order_id = o.id
       WHERE l.farmer_id = $1 AND l.status = 'SOLD'
       ORDER BY o.created_at DESC
       LIMIT 50`,
      [farmerId]
    );

    res.json(sales.rows);
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    res.status(500).json({ error: "Failed to fetch sales summary" });
  }
};

/**
 * Get Farmer Notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [farmerId, limit, offset]
    );

    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM notifications WHERE user_id = $1",
      [farmerId]
    );

    const unreadCount = await db.query(
      "SELECT COUNT(*) as total FROM notifications WHERE user_id = $1 AND is_read = FALSE",
      [farmerId]
    );

    res.json({
      notifications: notifications.rows,
      total: parseInt(countResult.rows[0].total),
      unread: parseInt(unreadCount.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
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
    const farmerId = req.user.id;

    const result = await db.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [notificationId, farmerId]
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
    const farmerId = req.user.id;

    await db.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
      [farmerId]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

/**
 * Get Market Prices (for reference)
 */
exports.getMarketPrices = async (req, res) => {
  try {
    // Get average prices by product category from recent lots
    const prices = await db.query(
      `SELECT 
        produce_name,
        category,
        unit,
        AVG(price_per_unit) as avg_price,
        MIN(price_per_unit) as min_price,
        MAX(price_per_unit) as max_price,
        COUNT(*) as sample_count
       FROM lots
       WHERE status = 'AVAILABLE'
       AND posted_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY produce_name, category, unit
       ORDER BY produce_name`
    );

    res.json(prices.rows);
  } catch (error) {
    console.error("Error fetching market prices:", error);
    res.status(500).json({ error: "Failed to fetch market prices" });
  }
};
