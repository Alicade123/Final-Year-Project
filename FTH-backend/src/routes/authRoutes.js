const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const passport = require("../config/passport");

// Regular login & register
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);
router.post("/change-password", authenticate, authController.changePassword);
router.post("/logout", authenticate, authController.logout);

// 🌐 Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login?error=google_auth_failed",
  }),
  (req, res) => {
    try {
      const { user, token } = req.user;
      const frontendURL = process.env.CLIENT_URL || "http://localhost:5173";

      // redirect with token and role
      const redirectURL = `${frontendURL}/login-success?token=${token}&role=${user.role}`;
      res.redirect(redirectURL);
    } catch (err) {
      console.error("Google callback error:", err);
      res.redirect("/login?error=google_auth_failed");
    }
  }
);

module.exports = router;
