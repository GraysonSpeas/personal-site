import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import type { Context } from 'hono';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

type Fish = {
  id: number;
  name: string;
};

type Player = {
  xp: number;
  level: number;
  gold: number;
};

type CountResult = {
  count: number;
};

function generateFish(): Fish {
  return {
    id: Date.now(),
    name: 'Fish',
  };
}

// Helper: Get user email from session cookie
async function getUserEmail(c: Context<{ Bindings: Bindings }>): Promise<string | null> {
  const session = getCookie(c, 'session');
  if (!session) return null;
  try {
    return atob(session);
  } catch {
    return null;
  }
}

// Helper: Ensure a row exists for the player
async function ensurePlayerRow(c: Context, email: string) {
  const exists = (await c.env.DB
    .prepare('SELECT 1 FROM players WHERE user_email = ? LIMIT 1')
    .bind(email)
    .first()) as { '1': number } | null;

  if (!exists) {
    await c.env.DB
      .prepare('INSERT INTO players (user_email, xp, level, gold) VALUES (?, 0, 1, 0)')
      .bind(email)
      .run();
  }
}

// 🎣 POST /fishing/fish
app.post('/fish', async (c) => {
  const email = await getUserEmail(c);
  if (!email) return c.json({ message: 'Unauthorized' }, 401);

  await ensurePlayerRow(c, email);

  const caught = Math.random() < 0.8;
  let fish: Fish | null = null;

  // Always fetch player data
  const player = (await c.env.DB
    .prepare('SELECT xp, level, gold FROM players WHERE user_email = ?')
    .bind(email)
    .first()) as Player | null;

  let xp = player?.xp ?? 0;
  let level = player?.level ?? 1;
  let gold = player?.gold ?? 0;

  if (caught) {
    fish = generateFish();

    await c.env.DB
      .prepare('INSERT INTO fish (id, user_email, name) VALUES (?, ?, ?)')
      .bind(fish.id, email, fish.name)
      .run();

    xp += 1;

    const xpNeeded = level * 10;
    if (xp >= xpNeeded) {
      xp -= xpNeeded;
      level += 1;
    }

    await c.env.DB
      .prepare('UPDATE players SET xp = ?, level = ? WHERE user_email = ?')
      .bind(xp, level, email)
      .run();
  }

  const countRes = (await c.env.DB
    .prepare('SELECT COUNT(*) as count FROM fish WHERE user_email = ?')
    .bind(email)
    .first()) as CountResult | null;

  const fishCount = countRes ? countRes.count : 0;

  return c.json({
    caught,
    fish,
    xp,
    level,
    fishCount,
    gold,
  });
});

// 💰 POST /fishing/sell
app.post('/sell', async (c) => {
  const email = await getUserEmail(c);
  if (!email) return c.json({ message: 'Unauthorized' }, 401);

  const countRes = (await c.env.DB
    .prepare('SELECT COUNT(*) as count FROM fish WHERE user_email = ?')
    .bind(email)
    .first()) as CountResult | null;

  const count = countRes ? countRes.count : 0;

  if (count === 0) {
    return c.json({ sold: 0, gold: 0, message: 'No fish to sell.' });
  }

  const sellValue = count * 10;

  await ensurePlayerRow(c, email);
  await c.env.DB
    .prepare('UPDATE players SET gold = gold + ? WHERE user_email = ?')
    .bind(sellValue, email)
    .run();

  await c.env.DB
    .prepare('DELETE FROM fish WHERE user_email = ?')
    .bind(email)
    .run();

  const player = (await c.env.DB
    .prepare('SELECT gold FROM players WHERE user_email = ?')
    .bind(email)
    .first()) as { gold: number } | null;

  return c.json({
    sold: count,
    gold: player ? player.gold : 0,
    remainingFish: 0,
  });
});

// 📊 GET /fishing/state
app.get('/state', async (c) => {
  const email = await getUserEmail(c);
  if (!email) return c.json({ message: 'Unauthorized' }, 401);

  await ensurePlayerRow(c, email);

  const countRes = (await c.env.DB
    .prepare('SELECT COUNT(*) as count FROM fish WHERE user_email = ?')
    .bind(email)
    .first()) as CountResult | null;

  const fishCount = countRes ? countRes.count : 0;

  const player = (await c.env.DB
    .prepare('SELECT xp, level, gold FROM players WHERE user_email = ?')
    .bind(email)
    .first()) as Player | null;

  return c.json({
    xp: player?.xp ?? 0,
    level: player?.level ?? 1,
    gold: player?.gold ?? 0,
    fishCount,
  });
});

export default app;