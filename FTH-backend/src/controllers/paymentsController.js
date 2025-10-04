/**
 * Complete Payment Flow (Fixed for current schema)
 */
exports.initiatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { method, providerRef } = req.body;
    const buyerId = req.user.id;

    // Valid methods
    const validMethods = ["MOBILE_MONEY", "BANK_TRANSFER", "CASH", "ONLINE"];
    if (!method || !validMethods.includes(method)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    if (!providerRef) {
      return res.status(400).json({ error: "Provider reference is required" });
    }

    const result = await db.transaction(async (client) => {
      // 1. Get order
      const orderResult = await client.query(
        `SELECT o.*, h.manager_id as hub_manager_id, h.name as hub_name
         FROM orders o
         JOIN hubs h ON o.hub_id = h.id
         WHERE o.id = $1 AND o.buyer_id = $2`,
        [orderId, buyerId]
      );

      if (orderResult.rows.length === 0) {
        throw new Error("Order not found or unauthorized");
      }

      const order = orderResult.rows[0];
      if (order.status !== "PENDING") {
        throw new Error(`Cannot pay for order with status: ${order.status}`);
      }

      // 2. Get order items with farmer information
      const itemsResult = await client.query(
        `SELECT oi.*, l.farmer_id, l.price as price_per_unit, l.unit, l.produce_name
         FROM order_items oi
         JOIN lots l ON oi.lot_id = l.id
         WHERE oi.order_id = $1`,
        [orderId]
      );

      if (itemsResult.rows.length === 0) {
        throw new Error("Order has no items");
      }
      const orderItems = itemsResult.rows;

      // 3. Calculate fees
      const systemFeePercent = parseFloat(
        process.env.SYSTEM_FEE_PERCENT || 0.1
      );
      const hubFeePercent = parseFloat(process.env.HUB_FEE_PERCENT || 0.05);

      const totalAmount = parseFloat(order.total_amount);
      const systemFee = totalAmount * systemFeePercent;
      const hubFee = totalAmount * hubFeePercent;
      const farmersTotalAmount = totalAmount - systemFee - hubFee;

      // 4. Ensure providerRef is unique
      const existingPayment = await client.query(
        `SELECT id FROM payments WHERE provider_ref = $1`,
        [providerRef]
      );
      if (existingPayment.rows.length > 0) {
        throw new Error("Duplicate provider reference detected");
      }

      // 5. Create payment record
      const paymentResult = await client.query(
        `INSERT INTO payments (
          order_id, amount, system_fee, hub_fee, farmer_amount, 
          method, provider_ref, status, created_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING',NOW())
        RETURNING *`,
        [
          orderId,
          totalAmount,
          systemFee,
          hubFee,
          farmersTotalAmount,
          method,
          providerRef,
        ]
      );
      const payment = paymentResult.rows[0];

      // 6. Simulate payment
      const paymentSuccess = await simulatePaymentProcessing(
        method,
        totalAmount
      );
      if (!paymentSuccess) {
        await client.query(
          `UPDATE payments SET status = 'FAILED', processed_at = NOW() WHERE id = $1`,
          [payment.id]
        );
        throw new Error("Payment processing failed. Please try again.");
      }

      // 7. Mark success
      await client.query(
        `UPDATE payments SET status = 'SUCCESS', processed_at = NOW() WHERE id = $1`,
        [payment.id]
      );

      await client.query(
        `UPDATE orders SET status = 'PAID', paid_at = NOW() WHERE id = $1`,
        [orderId]
      );

      // 8. Account transactions (with safe balance update)
      // Debit buyer
      await client.query(
        `INSERT INTO account_transactions 
          (user_id,type,amount,reference_type,reference_id,description,balance_after)
         VALUES ($1,'DEBIT',$2,'PAYMENT',$3,$4,
           (SELECT COALESCE(balance,0) - $2 FROM user_accounts WHERE user_id = $1 FOR UPDATE))
         ON CONFLICT DO NOTHING`,
        [
          buyerId,
          totalAmount,
          payment.id,
          `Payment for Order #${orderId.substring(0, 8)}`,
        ]
      );

      // Credit hub (hub fee)
      await client.query(
        `INSERT INTO account_transactions 
          (user_id,type,amount,reference_type,reference_id,description,balance_after)
         VALUES ($1,'CREDIT',$2,'HUB_FEE',$3,$4,
           (SELECT COALESCE(balance,0) + $2 FROM user_accounts WHERE user_id = $1 FOR UPDATE))`,
        [
          order.hub_manager_id,
          hubFee,
          payment.id,
          `Hub fee for Order #${orderId.substring(0, 8)}`,
        ]
      );

      // Credit system (system fee)
      await client.query(
        `INSERT INTO account_transactions 
          (user_id,type,amount,reference_type,reference_id,description,balance_after)
         VALUES (
           (SELECT id FROM users WHERE role='ADMIN' LIMIT 1),
           'CREDIT',$1,'SYSTEM_FEE',$2,$3,
           (SELECT COALESCE(balance,0) + $1 
              FROM user_accounts WHERE user_id = (SELECT id FROM users WHERE role='ADMIN' LIMIT 1) FOR UPDATE)
         )`,
        [
          systemFee,
          payment.id,
          `System fee for Order #${orderId.substring(0, 8)}`,
        ]
      );

      // 9. Create payouts
      const farmerPayouts = {};
      for (const item of orderItems) {
        const itemTotal =
          parseFloat(item.price_per_unit) * parseFloat(item.quantity);
        if (!farmerPayouts[item.farmer_id]) {
          farmerPayouts[item.farmer_id] = { totalAmount: 0, items: [] };
        }
        farmerPayouts[item.farmer_id].totalAmount += itemTotal;
        farmerPayouts[item.farmer_id].items.push({
          produce: item.produce_name,
          quantity: item.quantity,
          unit: item.unit,
          amount: itemTotal,
        });
      }

      const payoutIds = [];
      for (const farmerId in farmerPayouts) {
        const f = farmerPayouts[farmerId];
        const payoutResult = await client.query(
          `INSERT INTO payouts (payment_id,farmer_id,amount,status,created_at,details)
           VALUES ($1,$2,$3,'PENDING',NOW(),$4)
           RETURNING id`,
          [payment.id, farmerId, f.totalAmount, JSON.stringify(f.items)]
        );
        payoutIds.push(payoutResult.rows[0].id);

        // Notify farmer (generic type)
        await client.query(
          `INSERT INTO notifications (user_id,type,title,message,data,created_at)
           VALUES ($1,'PAYOUT','Payment Received',$2,$3,NOW())`,
          [
            farmerId,
            `You have a pending payout of ${f.totalAmount.toFixed(
              2
            )} RWF for Order #${orderId.substring(0, 8)}.`,
            JSON.stringify({ subtype: "PENDING", orderId }),
          ]
        );
      }

      // 10. Notify buyer
      await client.query(
        `INSERT INTO notifications (user_id,type,title,message,data,created_at)
         VALUES ($1,'PAYMENT','Payment Successful',$2,$3,NOW())`,
        [
          buyerId,
          `Your payment of ${totalAmount.toFixed(
            2
          )} RWF for Order #${orderId.substring(0, 8)} was successful.`,
          JSON.stringify({ subtype: "SUCCESS", orderId }),
        ]
      );

      // 11. Notify hub manager
      await client.query(
        `INSERT INTO notifications (user_id,type,title,message,data,created_at)
         VALUES ($1,'ORDER','Order Paid',$2,$3,NOW())`,
        [
          order.hub_manager_id,
          `Order #${orderId.substring(
            0,
            8
          )} has been paid. Total: ${totalAmount.toFixed(2)} RWF.`,
          JSON.stringify({ subtype: "PAID", orderId }),
        ]
      );

      return {
        payment,
        payoutIds,
        breakdown: {
          total: totalAmount,
          systemFee,
          hubFee,
          farmersTotal: farmersTotalAmount,
        },
      };
    });

    res.json({
      success: true,
      message: "Payment processed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to process payment",
    });
  }
};

/**
 * Simulated payment gateway
 */
async function simulatePaymentProcessing(method, amount) {
  await new Promise((r) => setTimeout(r, 1000));
  return Math.random() > 0.05;
}
