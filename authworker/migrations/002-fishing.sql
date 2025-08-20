-- =========================
-- DROP TABLES (reverse dependency order)
-- =========================
DROP TABLE IF EXISTS equipped;
DROP TABLE IF EXISTS user_quests;
DROP TABLE IF EXISTS questTemplates;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS biggest_fish;
DROP TABLE IF EXISTS user_rarity_progress;
DROP TABLE IF EXISTS fish;
DROP TABLE IF EXISTS activeConsumables;
DROP TABLE IF EXISTS consumables;
DROP TABLE IF EXISTS bait;
DROP TABLE IF EXISTS gear;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS seeds;
DROP TABLE IF EXISTS plantedSeeds;
DROP TABLE IF EXISTS userPlanterSlots;
DROP TABLE IF EXISTS permits;
DROP TABLE IF EXISTS currencies;
DROP TABLE IF EXISTS fishingSessions;
DROP TABLE IF EXISTS user_fish_sales;
DROP TABLE IF EXISTS users;

-- reference/link tables
DROP TABLE IF EXISTS fishTypeZones;
DROP TABLE IF EXISTS resourceTypeZones;

-- base types
DROP TABLE IF EXISTS fishTypes;
DROP TABLE IF EXISTS resourceTypes;
DROP TABLE IF EXISTS rodTypes;
DROP TABLE IF EXISTS hookTypes;
DROP TABLE IF EXISTS baitTypes;
DROP TABLE IF EXISTS consumableTypes;
DROP TABLE IF EXISTS craftingRecipes;
DROP TABLE IF EXISTS seedTypes;
DROP TABLE IF EXISTS zoneTypes;
DROP TABLE IF EXISTS weatherTypes;

-- =========================
-- CREATE BASE REFERENCE TABLES
-- =========================
CREATE TABLE IF NOT EXISTS weatherTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS zoneTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  xp_multiplier REAL NOT NULL DEFAULT 1.0
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
  barType TEXT,
  time_of_day TEXT CHECK(time_of_day IN ('day', 'night')) DEFAULT NULL,
  weather TEXT DEFAULT NULL,
  buy_price INTEGER DEFAULT 0
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
  barType TEXT NOT NULL DEFAULT 'middle',
  time_of_day TEXT CHECK(time_of_day IN ('day', 'night')) DEFAULT NULL,
  weather TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS rodTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  base_stats TEXT NOT NULL,
  buy_price INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hookTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  base_stats TEXT NOT NULL,
  buy_price INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS baitTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  base_stats TEXT NOT NULL,
  sell_price INTEGER DEFAULT 0,
  buy_price INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS consumableTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  effect TEXT,
  duration INTEGER,
  sell_price INTEGER DEFAULT 0,
  buy_price INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS craftingRecipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  requiredMaterials TEXT NOT NULL,
  outputType TEXT NOT NULL CHECK(outputType IN ('rod', 'hook', 'bait', 'consumable')),
  outputTypeId INTEGER
);

CREATE TABLE IF NOT EXISTS seedTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  grow_time INTEGER NOT NULL,
  outputs_json TEXT DEFAULT NULL,
  description TEXT,
  buy_price INTEGER DEFAULT 0,
  sell_price INTEGER DEFAULT 0
);

-- =========================
-- USERS TABLE
-- =========================
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
  FOREIGN KEY (current_zone_id) REFERENCES zoneTypes(id)
);

-- =========================
-- LINK TABLES FOR ZONES
-- =========================
CREATE TABLE IF NOT EXISTS resourceTypeZones (
  resource_type_id INTEGER NOT NULL,
  zone_id INTEGER NOT NULL,
  FOREIGN KEY (resource_type_id) REFERENCES resourceTypes(id) ON DELETE CASCADE,
  FOREIGN KEY (zone_id) REFERENCES zoneTypes(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_type_id, zone_id)
);

CREATE TABLE IF NOT EXISTS fishTypeZones (
  fish_type_id INTEGER NOT NULL,
  zone_id INTEGER NOT NULL,
  FOREIGN KEY (fish_type_id) REFERENCES fishTypes(id) ON DELETE CASCADE,
  FOREIGN KEY (zone_id) REFERENCES zoneTypes(id) ON DELETE CASCADE,
  PRIMARY KEY (fish_type_id, zone_id)
);

-- =========================
-- PLANTERS
-- =========================
CREATE TABLE IF NOT EXISTS userPlanterSlots (
  user_id INTEGER NOT NULL,
  slot_index INTEGER NOT NULL,
  purchased_at DATETIME,
  level INTEGER NOT NULL DEFAULT 1,            -- current upgrade level
  upgrade_cost INTEGER DEFAULT 0,             -- cost for next upgrade
  max_capacity INTEGER DEFAULT 1,             -- max seeds per slot
  PRIMARY KEY(user_id, slot_index),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plantedSeeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  seed_type_id INTEGER NOT NULL,
  slot_index INTEGER NOT NULL,
  planted_at DATETIME NOT NULL DEFAULT (datetime('now')),
  ready_at DATETIME NOT NULL,
  harvested INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(seed_type_id) REFERENCES seedTypes(id),
  FOREIGN KEY(user_id, slot_index) REFERENCES userPlanterSlots(user_id, slot_index) ON DELETE CASCADE
);

-- =========================
-- USER-DEPENDENT TABLES
-- =========================
CREATE TABLE IF NOT EXISTS user_fish_sales (
  user_id INTEGER NOT NULL,
  species TEXT NOT NULL,
  sell_limit INTEGER NOT NULL,
  sell_amount INTEGER NOT NULL DEFAULT 0,
  last_assigned TEXT DEFAULT NULL,
  PRIMARY KEY (user_id, species),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fishingSessions (
  email TEXT PRIMARY KEY,
  fish_json TEXT NOT NULL,
  bite_time INTEGER NOT NULL,
  FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS currencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
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
  gear_type TEXT CHECK(gear_type IN ('rod', 'hook')) NOT NULL,
  type_id INTEGER NOT NULL,
  stats TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bait (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  stats TEXT,
  sell_price INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES baitTypes(id),
  UNIQUE(user_id, type_id)
);

CREATE TABLE IF NOT EXISTS consumables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  stats TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES consumableTypes(id),
  UNIQUE(user_id, type_id)
);

CREATE TABLE IF NOT EXISTS seeds (
  user_id INTEGER NOT NULL,
  seed_type_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(user_id, seed_type_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(seed_type_id) REFERENCES seedTypes(id)
);


CREATE TABLE IF NOT EXISTS activeConsumables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type_id INTEGER NOT NULL,
  started_at DATETIME NOT NULL DEFAULT (datetime('now')),
  duration INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES consumableTypes(id),
  UNIQUE(user_id, type_id)
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
  rarity TEXT,
  max_weight REAL NOT NULL,
  max_length REAL NOT NULL,
  modifier TEXT,
  caught_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, species)
);

CREATE TABLE IF NOT EXISTS user_rarity_progress (
  user_id INTEGER NOT NULL,
  rarity TEXT NOT NULL,
  total_caught INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, rarity),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  achievement_key TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  claimed_stages TEXT DEFAULT '[]',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_key)
);

CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  collection_key TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  claimed INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, collection_key)
);

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

-- =========================
-- QUESTS
-- =========================
CREATE TABLE IF NOT EXISTS questTemplates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  type TEXT CHECK(type IN ('daily', 'weekly', 'monthly')) NOT NULL,
  target INTEGER NOT NULL,
  specific_species TEXT,
  rarity_exact TEXT,
  rarity_min TEXT,
  requires_modified INTEGER DEFAULT 0,
  requires_no_bait INTEGER DEFAULT 0,
  requires_no_rod INTEGER DEFAULT 0,
  requires_no_hook INTEGER DEFAULT 0,
  time_of_day TEXT CHECK(time_of_day IN ('day', 'night')) DEFAULT NULL,
  zone_id INTEGER DEFAULT NULL,
  weather TEXT DEFAULT NULL,
  reward_xp INTEGER NOT NULL DEFAULT 0,
  reward_gold INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (zone_id) REFERENCES zoneTypes(id)
);

CREATE TABLE IF NOT EXISTS user_quests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  quest_template_id INTEGER NOT NULL,
  quest_key TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quest_template_id) REFERENCES questTemplates(id) ON DELETE CASCADE,
  UNIQUE(user_id, quest_key)
);