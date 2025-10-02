// src/routes/farmerRoutes.js
const express = require("express");
const router = express.Router();
const farmerController = require("../controllers/farmerController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const {
  validatePagination,
  validateDateRange,
  validateUUID,
} = require("../middleware/validation");

// All routes require authentication and FARMER role
router.use(authenticate);
router.use(authorizeRoles("FARMER"));

// Dashboard
router.get("/dashboard/stats", farmerController.getDashboardStats);

// Products/Lots Management
router.get("/products", validatePagination, farmerController.getMyProducts);

router.get("/hubs", farmerController.getAvailableHubs);

router.post("/deliveries", farmerController.requestDelivery);

router.get(
  "/deliveries/history",
  validateDateRange,
  farmerController.getDeliveryHistory
);

// Sales
router.get("/sales", farmerController.getSalesSummary);

// Payouts & Earnings
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

// Market Information
router.get("/market-prices", farmerController.getMarketPrices);

// Notifications
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

module.exports = router;
