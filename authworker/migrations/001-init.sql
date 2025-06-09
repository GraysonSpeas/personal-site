CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  name TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  verification_token_expiry TEXT,
  reset_token TEXT,
  reset_token_expiry TEXT
);