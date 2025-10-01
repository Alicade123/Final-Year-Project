// src/routes/buyerRoutes.js
const express = require("express");
const router = express.Router();
const buyerController = require("../controllers/buyerController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const {
  validatePagination,
  validateDateRange,
  validateUUID,
} = require("../middleware/validation");

// All routes require authentication and BUYER role
router.use(authenticate);
router.use(authorizeRoles("BUYER"));

// Dashboard
router.get("/dashboard/stats", buyerController.getDashboardStats);

// Browse Products (Marketplace)
router.get("/products", validatePagination, buyerController.browseProducts);

router.get(
  "/products/:lotId",
  validateUUID("lotId"),
  buyerController.getProductDetails
);

// Hubs & Categories
router.get("/hubs", buyerController.getHubs);
router.get("/categories", buyerController.getCategories);

// Orders Management
router.post("/orders", buyerController.createOrder);

router.get("/orders", validatePagination, buyerController.getMyOrders);

router.get(
  "/orders/:orderId",
  validateUUID("orderId"),
  buyerController.getOrderDetails
);

router.post(
  "/orders/:orderId/cancel",
  validateUUID("orderId"),
  buyerController.cancelOrder
);

// Payment
router.post(
  "/orders/:orderId/payment",
  validateUUID("orderId"),
  buyerController.initiatePayment
);

// Purchase History & Analytics
router.get(
  "/purchase-history",
  validateDateRange,
  buyerController.getPurchaseHistory
);

// Notifications
router.get(
  "/notifications",
  validatePagination,
  buyerController.getNotifications
);

router.patch(
  "/notifications/:notificationId/read",
  validateUUID("notificationId"),
  buyerController.markNotificationRead
);

module.exports = router;
