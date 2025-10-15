const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// 📨 Public route — anyone can send a message
router.post("/", contactController.createContact);

// 👑 Admin-only routes
router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  contactController.listContacts
);
router.get(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  contactController.getContact
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  contactController.updateContact
);

module.exports = router;
