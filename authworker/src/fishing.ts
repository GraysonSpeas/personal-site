// src/fishing.ts
import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import type { Context } from 'hono';

type Bindings = {
  DB: D1Database;
  SENDGRID_API_KEY: string;
  SENDER_EMAIL: string;
  BASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

type Fish = {
  id: number;
  name: string;
  rarity: string;
  length: number;
  weight: number;
};

type GameState = {
  caughtFish: Fish[];
  attempts: number;
  lastCatch?: Fish;
};

function generateRandomFish(): Fish {
  const fishTypes = [
    { name: 'Salmon', rarity: 'Common' },
    { name: 'Tuna', rarity: 'Uncommon' },
    { name: 'Marlin', rarity: 'Rare' },
    { name: 'Golden Carp', rarity: 'Legendary' },
  ];
  const choice = fishTypes[Math.floor(Math.random() * fishTypes.length)];
  return {
    id: Date.now(),
    name: choice.name,
    rarity: choice.rarity,
    length: Math.round(Math.random() * 100),
    weight: Math.round(Math.random() * 50),
  };
}

// Shared: auth + DB lookup
async function getFishState(c: Context<{ Bindings: Bindings }>): Promise<
  | { status: 'ok'; email: string; caughtFish: Fish[] }
  | { status: 'unauthorized'; response: Response }
> {
  const session = getCookie(c, 'session');
  if (!session) return { status: 'unauthorized', response: c.json({ message: 'Not logged in' }, 401) };

  let email: string;
  try {
    email = atob(session);
  } catch {
    return { status: 'unauthorized', response: c.json({ message: 'Invalid session' }, 401) };
  }

  const { results } = await c.env.DB
    .prepare('SELECT * FROM fish WHERE user_email = ?')
    .bind(email)
    .all();

  return { status: 'ok', email, caughtFish: results as Fish[] };
}

// ✅ POST /fishing/fish — create a new catch
app.post('/fish', async (c) => {
  const auth = await getFishState(c);
  if (auth.status !== 'ok') return auth.response;

  const { email, caughtFish } = auth;
  const newFish = generateRandomFish();
  caughtFish.push(newFish);

  await c.env.DB
    .prepare(
      'INSERT INTO fish (id, user_email, name, rarity, length, weight) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(
      newFish.id,
      email,
      newFish.name,
      newFish.rarity,
      newFish.length,
      newFish.weight
    )
    .run();

  const gameState: GameState = {
    caughtFish,
    attempts: caughtFish.length,
    lastCatch: newFish,
  };

  return c.json({
    message: `You caught a ${newFish.rarity} ${newFish.name}!`,
    gameState,
  });
});

// ✅ GET /fishing/fish — fetch current state
app.get('/fish', async (c) => {
  const auth = await getFishState(c);
  if (auth.status !== 'ok') return auth.response;

  const { caughtFish } = auth;
  const gameState: GameState = {
    caughtFish,
    attempts: caughtFish.length,
    lastCatch: caughtFish.at(-1) ?? undefined,
  };

  return c.json({ gameState });
});

export default app;