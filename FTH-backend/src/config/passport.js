const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.SERVER_URL || "http://localhost:5000"
      }/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value || null;
        const name = profile.displayName || "Google User";

        if (!email) {
          return done(null, false, {
            message: "Google account must have an email address.",
          });
        }

        // 1️⃣ Check if user exists by Google ID or email
        const existingUser = await db.query(
          "SELECT * FROM users WHERE google_id = $1 OR email = $2",
          [googleId, email]
        );

        let user = existingUser.rows[0];

        // 2️⃣ If user doesn't exist → create new BUYER only
        if (!user) {
          const uniqueSuffix = Math.floor(100000 + Math.random() * 900000);
          const autoPhone = `+250GOOG${uniqueSuffix}`;
          const defaultPassword = await bcrypt.hash("hubbuyer@2025", 10);

          const insertQuery = `
            INSERT INTO users (id, full_name, phone, email, password_hash, role, google_id, is_active, metadata)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *;
          `;

          const result = await db.query(insertQuery, [
            uuidv4(),
            name,
            autoPhone,
            email,
            defaultPassword,
            "BUYER",
            googleId,
            true,
            JSON.stringify({ signup_via: "google" }),
          ]);

          user = result.rows[0];
        } else {
          // Update google_id if it was missing before
          if (!user.google_id) {
            await db.query("UPDATE users SET google_id = $1 WHERE id = $2", [
              googleId,
              user.id,
            ]);
          }

          // Only allow login if user is active
          if (!user.is_active) {
            return done(null, false, {
              message: "Your account is inactive. Contact admin.",
            });
          }
        }

        // 3️⃣ Generate JWT token
        const token = jwt.sign(
          { userId: user.id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        done(null, { user, token });
      } catch (err) {
        console.error("❌ Error in GoogleStrategy:", err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((obj, done) => done(null, obj));
passport.deserializeUser((obj, done) => done(null, obj));

module.exports = passport;
