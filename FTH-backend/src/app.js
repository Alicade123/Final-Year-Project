require("dotenv").config();
const express = require("express");
// const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const farmerRoutes = require("./routes/farmerRoutes");
const buyerRoutes = require("./routes/buyerRoutes");
const clerkRoutes = require("./routes/clerkRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes"); // ✅ added
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Middleware
// app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/clerks", clerkRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contacts", contactRoutes); // ✅ added
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🌱 Farmers Trade Hub API running..." });
});

module.exports = app;
