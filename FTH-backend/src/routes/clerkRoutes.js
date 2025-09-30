// src/routes/clerkRoutes.js
const express = require("express");
const router = express.Router();
const clerkController = require("../controllers/clerkController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// All routes require authentication and CLERK role
router.use(authenticate);
router.use(authorizeRoles("CLERK"));

// Dashboard
router.get("/dashboard/stats", clerkController.getDashboardStats);
router.get("/dashboard/activity", clerkController.getRecentActivity);

// Farmers Management
router.get("/farmers", clerkController.getFarmers);
router.get("/farmers/:farmerId", clerkController.getFarmerDetails);

// Products/Lots Management
router.get("/products", clerkController.getProducts);
router.post("/products", clerkController.registerProduct);
router.put("/products/:lotId", clerkController.updateProduct);
router.delete("/products/:lotId", clerkController.deleteProduct);

// Orders Management
router.get("/orders", clerkController.getOrders);
router.get("/orders/:orderId", clerkController.getOrderDetails);
router.patch("/orders/:orderId/status", clerkController.updateOrderStatus);

// Payouts Management
router.get("/payouts", clerkController.getPayouts);
router.post("/payouts/:payoutId/process", clerkController.processPayout);

// Reports
router.get("/reports", clerkController.getReports);

// Notifications
router.get("/notifications", clerkController.getNotifications);
router.patch(
  "/notifications/:notificationId/read",
  clerkController.markNotificationRead
);
router.patch(
  "/notifications/read-all",
  clerkController.markAllNotificationsRead
);

// Hub Settings
router.get("/settings", clerkController.getHubSettings);
router.put("/settings", clerkController.updateHubSettings);

module.exports = router;
