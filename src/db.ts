import Database from "better-sqlite3";

const db = new Database("database.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    full_name TEXT,
    is_verified INTEGER DEFAULT 0,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    code TEXT,
    expires_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    txid TEXT UNIQUE,
    status TEXT,
    amount TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Add is_admin column if it doesn't exist (for older databases)
try {
  db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0");
  console.log("Migration: Added is_admin column to users table.");
} catch (e: any) {
  if (e.message.includes("duplicate column name")) {
    // Column already exists, ignore
  } else if (e.message.includes("no such table")) {
    // Table doesn't exist yet, ignore (it will be created by CREATE TABLE)
  } else {
    console.error("Migration error:", e);
  }
}

// Ensure the specific user is an admin
try {
  db.prepare("UPDATE users SET is_admin = 1 WHERE email = ?").run("miguelsousa-3001@hotmail.com");
} catch (e) {
  console.log("Admin update skipped (user might not exist yet)");
}

export default db;
