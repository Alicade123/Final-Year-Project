const express = require("express");
const router = express.Router();
const farmerController = require("../controllers/farmerController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const {
  validatePagination,
  validateDateRange,
  validateUUID,
} = require("../middleware/validation");

// 🔒 Require login + FARMER role for all routes
router.use(authenticate);
router.use(authorizeRoles("FARMER"));

// ======================
// 📊 Dashboard
// ======================
router.get("/dashboard/stats", farmerController.getDashboardStats);

// ======================
// 🌾 Product / Lot Management
// ======================
router.get("/products", validatePagination, farmerController.getMyProducts);
router.get("/hubs", farmerController.getAvailableHubs);
router.post("/deliveries", farmerController.requestDelivery);
router.get(
  "/deliveries/history",
  validateDateRange,
  farmerController.getDeliveryHistory
);

// ======================
// 💰 Sales, Payouts & Earnings
// ======================
router.get("/sales", farmerController.getSalesSummary);
router.get("/payouts", validatePagination, farmerController.getPayouts);
router.get(
  "/payouts/:payoutId",
  validateUUID("payoutId"),
  farmerController.getPayoutDetails
);
router.get(
  "/earnings/analytics",
  validateDateRange,
  farmerController.getEarningsAnalytics
);

// ======================
// 🧾 Market Info & Notifications
// ======================
router.get("/market-prices", farmerController.getMarketPrices);
router.get(
  "/notifications",
  validatePagination,
  farmerController.getNotifications
);
router.patch(
  "/notifications/:notificationId/read",
  validateUUID("notificationId"),
  farmerController.markNotificationRead
);
router.patch(
  "/notifications/read-all",
  farmerController.markAllNotificationsRead
);

// ======================
// 👤 Profile Management
// ======================
router.get("/profile", farmerController.getProfile);
router.put("/profile", farmerController.updateProfile);

module.exports = router;
