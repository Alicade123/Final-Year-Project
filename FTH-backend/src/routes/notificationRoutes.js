const express = require("express");
const router = express.Router();
const { notifyUser } = require("../controllers/notificationController");

router.post("/sms", notifyUser);

module.exports = router;
