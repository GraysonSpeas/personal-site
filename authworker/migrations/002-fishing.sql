CREATE TABLE IF NOT EXISTS fish (
  id INTEGER PRIMARY KEY,
  user_email TEXT NOT NULL,
  name TEXT NOT NULL,
  rarity TEXT NOT NULL,
  length INTEGER NOT NULL,
  weight INTEGER NOT NULL,
  caught_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);