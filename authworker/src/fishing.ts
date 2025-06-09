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

// POST /fishing/fish — create a new catch and return updated state
app.post('/fishing/fish', async (c: Context<{ Bindings: Bindings }>) => {
  // 1) Authenticate
  const session = getCookie(c, 'session');
  if (!session) return c.json({ message: 'Not logged in' }, 401);

  let email: string;
  try {
    email = atob(session);
  } catch {
    return c.json({ message: 'Invalid session' }, 401);
  }

  // 2) Load previous catches
  const { results } = await c.env.DB
    .prepare('SELECT * FROM fish WHERE user_email = ?')
    .bind(email)
    .all();

  const caughtFish = results as Fish[];
  const attempts = caughtFish.length + 1;

  // 3) Generate new fish
  const newFish = generateRandomFish();
  caughtFish.push(newFish);

  // 4) Persist new catch
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

  // 5) Return updated state
  const gameState: GameState = {
    caughtFish,
    attempts,
    lastCatch: newFish,
  };

  return c.json({
    message: `You caught a ${newFish.rarity} ${newFish.name}!`,
    gameState,
  });
});

export default app;