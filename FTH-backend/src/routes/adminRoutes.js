// src/routes/adminRoutes
const express = require("express");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

const router = express.Router();

// Secure all routes: only ADMIN role can access
router.use(authenticate, authorizeRoles("ADMIN"));

// Users management
router.get("/users", adminController.getAllUsers);
router.post("/users", adminController.createUser);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// Hubs management
router.get("/hubs", adminController.getAllHubs);
router.post("/hubs", adminController.createHub);
router.put("/hubs/:id", adminController.updateHub);
router.get("/clerks", adminController.getClerks);

module.exports = router;
