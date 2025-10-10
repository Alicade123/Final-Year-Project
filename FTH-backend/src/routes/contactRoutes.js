// routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { authenticate } = require("../middleware/auth");
const { authorizeRole } = require("../middleware/authorize");

// Public: submit contact
router.post("/", contactController.createContact);

// Admin: list, get, update
router.get(
  "/",
  authenticate,
  authorizeRole(["ADMIN"]),
  contactController.listContacts
);
router.get(
  "/:id",
  authenticate,
  authorizeRole(["ADMIN"]),
  contactController.getContact
);
router.put(
  "/:id",
  authenticate,
  authorizeRole(["ADMIN"]),
  contactController.updateContact
);

module.exports = router;
