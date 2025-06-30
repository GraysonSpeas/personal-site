-- DROP TABLES in order respecting foreign keys
DROP TABLE IF EXISTS equipped;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS biggest_fish;
DROP TABLE IF EXISTS fish;
DROP TABLE IF EXISTS bait;
DROP TABLE IF EXISTS gear;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS permits;
DROP TABLE IF EXISTS currencies;
DROP TABLE IF EXISTS fishingSessions;
DROP TABLE IF EXISTS fishTypeZones;
DROP TABLE IF EXISTS resourceTypeZones;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS fishTypes;
DROP TABLE IF EXISTS resourceTypes;
DROP TABLE IF EXISTS zoneTypes;
DROP TABLE IF EXISTS weatherTypes;

-- CREATE base reference tables first
CREATE TABLE IF NOT EXISTS weatherTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS zoneTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS resourceTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  base_weight REAL,
  base_length REAL,
  stamina INTEGER,
  tugStrength INTEGER,
  changeRate INTEGER,
  changeStrength INTEGER,
  sell_price INTEGER,
  rarity TEXT,
  barType TEXT
);

CREATE TABLE IF NOT EXISTS fishTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  species TEXT UNIQUE NOT NULL,
  base_weight REAL NOT NULL,
  base_length REAL NOT NULL,
  stamina INTEGER NOT NULL,
  tugStrength INTEGER NOT NULL,
  changeRate INTEGER NOT NULL,
  changeStrength INTEGER NOT NULL DEFAULT 100,
  sell_price INTEGER NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  barType TEXT NOT NULL DEFAULT 'middle'
);

-- Linking table for resourceTypes and zoneTypes
CREATE TABLE IF NOT EXISTS resourceTypeZones (
  resource_type_id INTEGER NOT NULL,
  zone_id INTEGER NOT NULL,
  FOREIGN KEY (resource_type_id) REFERENCES resourceTypes(id) ON DELETE CASCADE,
  FOREIGN KEY (zone_id) REFERENCES zoneTypes(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_type_id, zone_id)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT,
  name TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  verification_token TEXT,
  verification_token_expiry TEXT,
  reset_token TEXT,
  reset_token_expiry TEXT,
  current_zone_id INTEGER DEFAULT 1,
  current_weather_id INTEGER,
  FOREIGN KEY (current_zone_id) REFERENCES zoneTypes(id)
);

-- Persistent fishing sessions (replaces in-memory sessions)
CREATE TABLE IF NOT EXISTS fishingSessions (
  email TEXT PRIMARY KEY,
  fish_json TEXT NOT NULL,
  bite_time INTEGER NOT NULL,
  FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

-- Dependent tables referencing users
CREATE TABLE IF NOT EXISTS currencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  gold INTEGER DEFAULT 0,
  pearls INTEGER DEFAULT 0,
  coral_shards INTEGER DEFAULT 0,
  echo_shards INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS permits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  permit_name TEXT NOT NULL,
  permanent INTEGER NOT NULL DEFAULT 0,
  expiry DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  quantity INTEGER NOT NULL DEFAULT 0,
  caught_at DATETIME NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS gear (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  gear_type TEXT NOT NULL CHECK (gear_type IN ('rod', 'hook')),
  gear_name TEXT NOT NULL,
  stats JSON,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bait (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  bait_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  stats JSON,
  sell_price INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fish (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  species TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  weight REAL NOT NULL,
  length REAL NOT NULL,
  modifier TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  caught_at DATETIME NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, species, modifier)
);

CREATE TABLE IF NOT EXISTS biggest_fish (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  species TEXT NOT NULL,
  max_weight REAL NOT NULL,
  max_length REAL NOT NULL,
  modifier TEXT,
  caught_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, species)
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_key TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_key)
);

-- Linking table fishTypeZones after fishTypes and zoneTypes
CREATE TABLE IF NOT EXISTS fishTypeZones (
  fish_type_id INTEGER NOT NULL,
  zone_id INTEGER NOT NULL,
  FOREIGN KEY (fish_type_id) REFERENCES fishTypes(id) ON DELETE CASCADE,
  FOREIGN KEY (zone_id) REFERENCES zoneTypes(id) ON DELETE CASCADE,
  PRIMARY KEY (fish_type_id, zone_id)
);

-- Equipped gear last, references gear and bait
CREATE TABLE IF NOT EXISTS equipped (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  equipped_rod_id INTEGER,
  equipped_hook_id INTEGER,
  equipped_bait_id INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (equipped_rod_id) REFERENCES gear(id),
  FOREIGN KEY (equipped_hook_id) REFERENCES gear(id),
  FOREIGN KEY (equipped_bait_id) REFERENCES bait(id)
);