// src/controllers/buyerController.js
const db = require("../config/db");

/**
 * Get Buyer Dashboard Overview Statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const buyerId = req.user.id;

    // Get total orders
    const ordersResult = await db.query(
      "SELECT COUNT(*) as total FROM orders WHERE buyer_id = $1",
      [buyerId]
    );

    // Get pending orders
    const pendingResult = await db.query(
      `SELECT COUNT(*) as total FROM orders 
       WHERE buyer_id = $1 AND status = 'PENDING'`,
      [buyerId]
    );

    // Get completed orders
    const completedResult = await db.query(
      `SELECT COUNT(*) as total FROM orders 
       WHERE buyer_id = $1 AND status = 'FULFILLED'`,
      [buyerId]
    );

    // Get total spent this month
    const spentResult = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total
       FROM orders 
       WHERE buyer_id = $1 
       AND status IN ('PAID', 'FULFILLED')
       AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [buyerId]
    );

    res.json({
      totalOrders: parseInt(ordersResult.rows[0].total),
      pendingOrders: parseInt(pendingResult.rows[0].total),
      completedOrders: parseInt(completedResult.rows[0].total),
      monthlySpent: parseFloat(spentResult.rows[0].total),
    });
  } catch (error) {
    console.error("Error fetching buyer dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};

/**
 * Browse Available Products/Lots
 */
exports.browseProducts = async (req, res) => {
  try {
    const {
      category,
      hubId,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        l.*,
        h.name as hub_name,
        h.location as hub_location,
        u.full_name as farmer_name
      FROM lots l
      JOIN hubs h ON l.hub_id = h.id
      JOIN users u ON l.farmer_id = u.id
      WHERE l.status = 'AVAILABLE'
    `;

    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND l.category = $${paramCount++}`;
      params.push(category);
    }

    if (hubId) {
      query += ` AND l.hub_id = $${paramCount++}`;
      params.push(hubId);
    }

    if (minPrice) {
      query += ` AND l.price_per_unit >= $${paramCount++}`;
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ` AND l.price_per_unit <= $${paramCount++}`;
      params.push(maxPrice);
    }

    if (search) {
      query += ` AND (l.produce_name ILIKE $${paramCount++} OR l.category ILIKE $${paramCount})`;
      params.push(`%${search}%`, `%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY l.posted_at DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
    params.push(limit, offset);

    const products = await db.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM lots l WHERE l.status = 'AVAILABLE'`;
    const countParams = [];
    let countParamIndex = 1;

    if (category) {
      countQuery += ` AND l.category = $${countParamIndex++}`;
      countParams.push(category);
    }
    if (hubId) {
      countQuery += ` AND l.hub_id = $${countParamIndex++}`;
      countParams.push(hubId);
    }
    if (minPrice) {
      countQuery += ` AND l.price_per_unit >= $${countParamIndex++}`;
      countParams.push(minPrice);
    }
    if (maxPrice) {
      countQuery += ` AND l.price_per_unit <= $${countParamIndex++}`;
      countParams.push(maxPrice);
    }
    if (search) {
      countQuery += ` AND (l.produce_name ILIKE $${countParamIndex++} OR l.category ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await db.query(countQuery, countParams);

    res.json({
      products: products.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error browsing products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * Get Product Details
 */
exports.getProductDetails = async (req, res) => {
  try {
    const { lotId } = req.params;

    const product = await db.query(
      `SELECT 
        l.*,
        h.name as hub_name,
        h.location as hub_location,
        u.full_name as farmer_name,
        u.phone as farmer_phone
       FROM lots l
       JOIN hubs h ON l.hub_id = h.id
       JOIN users u ON l.farmer_id = u.id
       WHERE l.id = $1 AND l.status = 'AVAILABLE'`,
      [lotId]
    );

    if (product.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Product not found or unavailable" });
    }

    res.json(product.rows[0]);
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ error: "Failed to fetch product details" });
  }
};

/**
 * Get Available Hubs
 */
exports.getHubs = async (req, res) => {
  try {
    const hubs = await db.query(
      `SELECT 
        h.id,
        h.name,
        h.location,
        COUNT(DISTINCT l.id) as product_count
       FROM hubs h
       LEFT JOIN lots l ON h.id = l.hub_id AND l.status = 'AVAILABLE'
       GROUP BY h.id, h.name, h.location
       ORDER BY h.name`
    );

    res.json(hubs.rows);
  } catch (error) {
    console.error("Error fetching hubs:", error);
    res.status(500).json({ error: "Failed to fetch hubs" });
  }
};

/**
 * Get Product Categories
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await db.query(
      `SELECT DISTINCT category, COUNT(*) as count
       FROM lots 
       WHERE status = 'AVAILABLE' AND category IS NOT NULL
       GROUP BY category
       ORDER BY category`
    );

    res.json(categories.rows);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

/**
 * Create Order
 */
exports.createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { hubId, items } = req.body; // items: [{ lotId, quantity }]

    // Validate required fields
    if (!hubId || !items || items.length === 0) {
      return res.status(400).json({ error: "Hub ID and items are required" });
    }

    // Start transaction
    const result = await db.transaction(async (client) => {
      // Verify all lots are available and from the same hub
      const lotIds = items.map((item) => item.lotId);
      const lots = await client.query(
        `SELECT * FROM lots 
         WHERE id = ANY($1) AND hub_id = $2 AND status = 'AVAILABLE'`,
        [lotIds, hubId]
      );

      if (lots.rows.length !== items.length) {
        throw new Error(
          "Some products are not available or not from the specified hub"
        );
      }

      // Validate quantities
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const lot = lots.rows.find((l) => l.id === item.lotId);

        if (!lot) {
          throw new Error(`Lot ${item.lotId} not found`);
        }

        if (parseFloat(item.quantity) > parseFloat(lot.quantity)) {
          throw new Error(`Insufficient quantity for ${lot.produce_name}`);
        }

        if (parseFloat(item.quantity) <= 0) {
          throw new Error("Quantity must be greater than 0");
        }

        const subtotal =
          parseFloat(item.quantity) * parseFloat(lot.price_per_unit);
        totalAmount += subtotal;

        orderItems.push({
          lotId: item.lotId,
          quantity: item.quantity,
          unitPrice: lot.price_per_unit,
          subtotal: subtotal,
        });
      }

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (buyer_id, hub_id, total_amount)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [buyerId, hubId, totalAmount]
      );

      const order = orderResult.rows[0];

      // Create order items
      for (const item of orderItems) {
        await client.query(
          `INSERT INTO order_items (order_id, lot_id, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.lotId, item.quantity, item.unitPrice, item.subtotal]
        );

        // Update lot quantity
        await client.query(
          `UPDATE lots 
           SET quantity = quantity - $1,
               status = CASE 
                 WHEN quantity - $1 <= 0 THEN 'SOLD'::lot_status_enum
                 ELSE status 
               END
           WHERE id = $2`,
          [item.quantity, item.lotId]
        );
      }

      // Create notification for buyer
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'ORDER', 'Order Created', 
         'Your order #' || SUBSTRING($2::text, 1, 8) || ' has been created. Total: $' || $3)`,
        [buyerId, order.id, totalAmount]
      );

      return order;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
};

/**
 * Get Buyer's Orders
 */
exports.getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.*,
        h.name as hub_name,
        h.location as hub_location,
        p.status as payment_status,
        p.method as payment_method
      FROM orders o
      JOIN hubs h ON o.hub_id = h.id
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.buyer_id = $1
    `;

    const params = [buyerId];

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
          `SELECT 
            oi.*,
            l.produce_name,
            l.unit,
            l.category
           FROM order_items oi
           JOIN lots l ON oi.lot_id = l.id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: items.rows };
      })
    );

    // Get total count
    const countQuery = status
      ? "SELECT COUNT(*) as total FROM orders WHERE buyer_id = $1 AND status = $2"
      : "SELECT COUNT(*) as total FROM orders WHERE buyer_id = $1";

    const countParams = status ? [buyerId, status] : [buyerId];
    const countResult = await db.query(countQuery, countParams);

    res.json({
      orders: ordersWithItems,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit),
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
    const buyerId = req.user.id;

    const order = await db.query(
      `SELECT 
        o.*,
        h.name as hub_name,
        h.location as hub_location,
        p.status as payment_status,
        p.method as payment_method,
        p.paid_at,
        p.amount as payment_amount
       FROM orders o
       JOIN hubs h ON o.hub_id = h.id
       LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.id = $1 AND o.buyer_id = $2`,
      [orderId, buyerId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const items = await db.query(
      `SELECT 
        oi.*,
        l.produce_name,
        l.unit,
        l.category,
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
 * Cancel Order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const buyerId = req.user.id;

    await db.transaction(async (client) => {
      // Check if order exists and belongs to buyer
      const orderCheck = await client.query(
        "SELECT * FROM orders WHERE id = $1 AND buyer_id = $2",
        [orderId, buyerId]
      );

      if (orderCheck.rows.length === 0) {
        throw new Error("Order not found");
      }

      const order = orderCheck.rows[0];

      // Can only cancel pending orders
      if (order.status !== "PENDING") {
        throw new Error("Only pending orders can be cancelled");
      }

      // Get order items to restore quantities
      const items = await client.query(
        "SELECT * FROM order_items WHERE order_id = $1",
        [orderId]
      );

      // Restore lot quantities
      for (const item of items.rows) {
        await client.query(
          `UPDATE lots 
           SET quantity = quantity + $1,
               status = 'AVAILABLE'::lot_status_enum
           WHERE id = $2`,
          [item.quantity, item.lot_id]
        );
      }

      // Update order status
      await client.query(
        `UPDATE orders SET status = 'CANCELLED' WHERE id = $1`,
        [orderId]
      );

      // Create notification
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'ORDER', 'Order Cancelled', 
         'Your order #' || SUBSTRING($2::text, 1, 8) || ' has been cancelled.')`,
        [buyerId, orderId]
      );
    });

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(400).json({ error: error.message || "Failed to cancel order" });
  }
};

/**
 * Initiate Payment for Order
 */
// Buyer paying Hub (no farmer payout)
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { method, providerRef, description } = req.body;
    const buyerId = req.user.id;
    function generateProviderRef(method) {
      const number = Math.floor(100000000 + Math.random() * 900000000);
      const letters = Array.from({ length: 3 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
      ).join("");
      return `${method};${number}:${letters}`;
    }
    const result = await db.transaction(async (client) => {
      // 1️⃣ Validate order ownership and status
      const orderRes = await client.query(
        `SELECT o.*, h.id AS hub_id, h.manager_id AS hub_manager
         FROM orders o
         JOIN hubs h ON o.hub_id = h.id
         WHERE o.id = $1 AND o.buyer_id = $2`,
        [orderId, buyerId]
      );

      if (orderRes.rows.length === 0)
        throw new Error("Order not found or not owned by buyer.");

      const order = orderRes.rows[0];

      if (order.status !== "PENDING")
        throw new Error("Order is not in pending state.");

      // 2️⃣ Create payment record
      const paymentRes = await client.query(
        `INSERT INTO payments (
          order_id,
          amount,
          hub_fee,
          farmer_amount,
          method,
          status,
          provider_ref,
          payer_id,
          payer_role,
          payee_id,
          payee_role,
          target_entity,
          description,
          paid_at
        ) VALUES (
          $1, $2, $3, $4, $5, 'SUCCESS', $6,
          $7, 'BUYER', $8, 'HUB_MANAGER', $9, $10, NOW()
        )
        RETURNING *`,
        [
          orderId,
          order.total_amount,
          0, // hub_fee (no fee at this stage)
          0, // farmer_amount (will be computed later during payout)
          method,
          providerRef || generateProviderRef(method) || null,
          buyerId,
          order.hub_manager,
          order.hub_id,
          description || "Payment from buyer to hub",
        ]
      );

      const payment = paymentRes.rows[0];

      // 3️⃣ Mark order as PAID
      await client.query(`UPDATE orders SET status = 'PAID' WHERE id = $1`, [
        orderId,
      ]);

      // 4️⃣ Notify hub manager about payment
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'PAYMENT', 'New Payment Received',
         'Buyer has paid RWF ' || $2 || ' for order #' || SUBSTRING($3::text,1,8))`,
        [order.hub_manager, order.total_amount, orderId]
      );

      // 5️⃣ Notify buyer about success
      await client.query(
        `INSERT INTO notifications (user_id, type, title, message)
         VALUES ($1, 'PAYMENT', 'Payment Successful',
         'You successfully paid RWF ' || $2 || ' to the hub for order #' || SUBSTRING($3::text,1,8))`,
        [buyerId, order.total_amount, orderId]
      );

      return { payment };
    });

    res.json({
      message: "✅ Payment completed successfully",
      result,
    });
  } catch (error) {
    console.error("Error completing payment:", error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get Buyer Notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const notifications = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [buyerId, limit, offset]
    );

    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM notifications WHERE user_id = $1",
      [buyerId]
    );

    const unreadCount = await db.query(
      "SELECT COUNT(*) as total FROM notifications WHERE user_id = $1 AND is_read = FALSE",
      [buyerId]
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
    const buyerId = req.user.id;

    const result = await db.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [notificationId, buyerId]
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
 * Get Purchase History/Analytics
 */
exports.getPurchaseHistory = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { startDate, endDate } = req.query;

    const start = startDate || "2020-01-01";
    const end = endDate || new Date().toISOString().split("T")[0];

    // Monthly spending
    const monthlySpending = await db.query(
      `SELECT 
        DATE_TRUNC('month', o.created_at) as month,
        SUM(o.total_amount) as total_spent,
        COUNT(o.id) as order_count
       FROM orders o
       WHERE o.buyer_id = $1 
       AND o.status IN ('PAID', 'FULFILLED')
       AND o.created_at BETWEEN $2 AND $3
       GROUP BY DATE_TRUNC('month', o.created_at)
       ORDER BY month DESC`,
      [buyerId, start, end]
    );

    // Most purchased products
    const topProducts = await db.query(
      `SELECT 
        l.produce_name,
        l.category,
        SUM(oi.quantity) as total_quantity,
        l.unit,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.subtotal) as total_spent
       FROM order_items oi
       JOIN lots l ON oi.lot_id = l.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.buyer_id = $1
       AND o.created_at BETWEEN $2 AND $3
       GROUP BY l.produce_name, l.category, l.unit
       ORDER BY total_spent DESC
       LIMIT 10`,
      [buyerId, start, end]
    );

    res.json({
      period: { start, end },
      monthlySpending: monthlySpending.rows,
      topProducts: topProducts.rows,
    });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    res.status(500).json({ error: "Failed to fetch purchase history" });
  }
};

// GET /buyer/profile
exports.getProfile = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        full_name,
        email,
        phone,
        role,
        is_active
      FROM users
      WHERE id = $1
    `;
    const { rows } = await db.query(query, [req.user.id]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching buyer profile:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// PUT /buyer/profile
exports.updateProfile = async (req, res) => {
  const { full_name, email, phone } = req.body;
  try {
    await db.query(
      "UPDATE users SET full_name=$1, email=$2, phone=$3 WHERE id=$4",
      [full_name, email, phone, req.user.id]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating buyer profile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
