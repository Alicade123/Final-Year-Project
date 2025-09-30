// require("dotenv").config();
// const { Pool } = require("pg");

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   ssl: {
//     rejectUnauthorized: false, // required for Render
//   },
// });

// pool
//   .connect()
//   .then(() => console.log("✅ Connected to PostgreSQL"))
//   .catch((err) => console.error("❌ PostgreSQL connection error:", err));

// module.exports = pool;

// src/config/db.js
const { Pool } = require("pg");

// Create PostgreSQL connection pool
// const pool = new Pool({
//   host: process.env.DB_HOST || "localhost",
//   port: process.env.DB_PORT || 5432,
//   database: process.env.DB_NAME || "farmers_hub",
//   user: process.env.DB_USER || "postgres",
//   password: process.env.DB_PASSWORD || "",
//   max: 20, // Maximum number of clients in the pool
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render
  },
});

// Test database connection
pool.on("connect", () => {
  console.log("✅ Database connected successfully");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
  process.exit(-1);
});

/**
 * Query wrapper with error handling
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries in development
    if (process.env.NODE_ENV === "development" && duration > 1000) {
      console.warn(`⚠️  Slow query detected (${duration}ms):`, text);
    }

    return res;
  } catch (error) {
    console.error("Database query error:", {
      text,
      params,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Transaction wrapper
 */
const transaction = async (callback) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get a client from the pool for manual transaction handling
 */
const getClient = async () => {
  return await pool.connect();
};

/**
 * Graceful shutdown
 */
const close = async () => {
  await pool.end();
  console.log("Database pool closed");
};

module.exports = {
  query,
  transaction,
  getClient,
  close,
  pool,
};
