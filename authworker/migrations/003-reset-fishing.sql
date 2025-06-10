DROP TABLE IF EXISTS fish;
DROP TABLE IF EXISTS players;

-- Recreate tables as needed:
CREATE TABLE players (
  user_email TEXT PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  gold INTEGER DEFAULT 0
);

CREATE TABLE fish (
  id INTEGER PRIMARY KEY,
  user_email TEXT,
  name TEXT
);