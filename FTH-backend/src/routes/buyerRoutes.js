const express = require("express");
const router = express.Router();
const {
  listAvailableLots,
  createOrder,
} = require("../controllers/buyerController");

router.get("/lots", listAvailableLots);
router.post("/orders", createOrder); // expects buyer_id, hub_id, items: [{lot_id, quantity}, ...]

module.exports = router;
