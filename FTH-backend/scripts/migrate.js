const { exec } = require("child_process");
const path = require("path");
require("dotenv").config();

const migrationFile = path.join(__dirname, "../migrations/001_init.sql");

exec(
  `psql ${process.env.DATABASE_URL} -f ${migrationFile}`,
  (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Migration failed:", stderr);
      process.exit(1);
    }
    console.log("✅ Migration completed:\n", stdout);
  }
);
