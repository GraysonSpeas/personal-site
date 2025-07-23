// MerchantService.ts
import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

const BROKEN_BAIT_NAME = 'Broken Bait';
const BROKEN_BAIT_BUY_PRICE = 100;

export async function getMerchantInventory(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  let email: string;
  try {
    email = atob(session);
  } catch {
    return c.json({ error: 'Invalid session' }, 401);
  }

  const db = c.env.DB as D1Database;
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
  if (!user) return c.json({ error: 'User not found' }, 404);
  const userId = user.id;

const fishRes = await db.prepare(
  `SELECT fish.id, fish.species, fish.rarity, fish.weight, fish.length, fish.modifier, fish.quantity, fishTypes.sell_price
   FROM fish
   JOIN fishTypes ON fish.species = fishTypes.species
   WHERE fish.user_id = ? AND fish.quantity > 0`
).bind(userId).all();

  const baitRes = await db.prepare(
    `SELECT bait.id, bait.type_id, bait.quantity, bait.sell_price, baitTypes.name
     FROM bait
     JOIN baitTypes ON bait.type_id = baitTypes.id
     WHERE bait.user_id = ? AND bait.quantity > 0`
  ).bind(userId).all();

  const goldRes = await db.prepare('SELECT gold FROM currencies WHERE user_id = ?').bind(userId).first<{ gold: number }>();
  const gold = goldRes?.gold ?? 0;

  return c.json({
    fish: fishRes.results || [],
    bait: baitRes.results || [],
    gold,
  });
}

async function syncEquippedBait(db: D1Database, userId: number, baitIdSold: number) {
  const equipped = await db.prepare('SELECT equipped_bait_id FROM equipped WHERE user_id = ?')
    .bind(userId)
    .first<{ equipped_bait_id: number | null }>();

  if (equipped?.equipped_bait_id === baitIdSold) {
    await db.prepare('UPDATE equipped SET equipped_bait_id = NULL WHERE user_id = ?')
      .bind(userId)
      .run();
  }
}

export async function sellMerchantItem(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  let email: string;
  try {
    email = atob(session);
  } catch {
    return c.json({ error: 'Invalid session' }, 401);
  }

  const db = c.env.DB as D1Database;
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
  if (!user) return c.json({ error: 'User not found' }, 404);
  const userId = user.id;

  const { itemType, itemId, quantity } = await c.req.json();

  if (!['fish', 'bait'].includes(itemType)) {
    return c.json({ error: 'Invalid itemType' }, 400);
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return c.json({ error: 'Invalid quantity' }, 400);
  }

  try {
    if (itemType === 'fish') {
      const fish = await db.prepare(
        'SELECT quantity, species FROM fish WHERE id = ? AND user_id = ?'
      ).bind(itemId, userId).first<{ quantity: number; species: string }>();
      if (!fish) return c.json({ error: 'Fish not found' }, 404);
      if (fish.quantity < quantity) return c.json({ error: 'Not enough fish quantity' }, 400);

      const fishType = await db.prepare(
        'SELECT sell_price FROM fishTypes WHERE species = ?'
      ).bind(fish.species).first<{ sell_price: number }>();
      if (!fishType) return c.json({ error: 'Fish type data missing' }, 500);

      const totalSellPrice = fishType.sell_price * quantity;

      if (fish.quantity === quantity) {
        await db.prepare('DELETE FROM fish WHERE id = ?').bind(itemId).run();
      } else {
        await db.prepare('UPDATE fish SET quantity = quantity - ? WHERE id = ?')
          .bind(quantity, itemId).run();
      }

      await db.prepare(
        `INSERT INTO currencies (user_id, gold) VALUES (?, ?)
         ON CONFLICT(user_id) DO UPDATE SET gold = gold + excluded.gold`
      ).bind(userId, totalSellPrice).run();

      return c.json({ success: true, goldAdded: totalSellPrice });
    }

    // bait
    const bait = await db.prepare(
      `SELECT bait.quantity, bait.sell_price, baitTypes.name
       FROM bait
       JOIN baitTypes ON bait.type_id = baitTypes.id
       WHERE bait.id = ? AND bait.user_id = ?`
    ).bind(itemId, userId).first<{ quantity: number; sell_price: number; name: string }>();

    if (!bait) return c.json({ error: 'Bait not found' }, 404);
    if (bait.quantity < quantity) return c.json({ error: 'Not enough bait quantity' }, 400);

    const totalSellPrice = (bait.sell_price ?? 0) * quantity;

    if (bait.quantity === quantity) {
      await syncEquippedBait(db, userId, itemId);
      await db.prepare('DELETE FROM bait WHERE id = ?').bind(itemId).run();
    } else {
      await db.prepare('UPDATE bait SET quantity = quantity - ? WHERE id = ?')
        .bind(quantity, itemId).run();
    }

    await db.prepare(
      `INSERT INTO currencies (user_id, gold) VALUES (?, ?)
       ON CONFLICT(user_id) DO UPDATE SET gold = gold + excluded.gold`
    ).bind(userId, totalSellPrice).run();

    return c.json({ success: true, goldAdded: totalSellPrice });

  } catch (error) {
    console.error('sellMerchantItem error:', error);
    return c.json({ error: 'Database error', details: (error as Error).message }, 500);
  }
}

export async function buyBrokenBait(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  let email: string;
  try {
    email = atob(session);
  } catch {
    return c.json({ error: 'Invalid session' }, 401);
  }

  const db = c.env.DB as D1Database;
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
  if (!user) return c.json({ error: 'User not found' }, 404);
  const userId = user.id;

  const { quantity } = await c.req.json();
  if (typeof quantity !== 'number' || quantity <= 0) {
    return c.json({ error: 'Invalid quantity' }, 400);
  }

  const goldRes = await db.prepare('SELECT gold FROM currencies WHERE user_id = ?').bind(userId).first<{ gold: number }>();
  const gold = goldRes?.gold ?? 0;
  const totalCost = BROKEN_BAIT_BUY_PRICE * quantity;
  if (gold < totalCost) {
    return c.json({ error: 'Not enough gold' }, 400);
  }

  const baitType = await db.prepare(
    'SELECT id, sell_price FROM baitTypes WHERE name = ?'
  ).bind(BROKEN_BAIT_NAME).first<{ id: number; sell_price: number }>();
  if (!baitType) return c.json({ error: 'Broken bait type not found' }, 500);

  const existingBait = await db.prepare(
    'SELECT id, quantity FROM bait WHERE user_id = ? AND type_id = ?'
  ).bind(userId, baitType.id).first<{ id: number; quantity: number }>();

  if (existingBait) {
    await db.prepare('UPDATE bait SET quantity = quantity + ? WHERE id = ?')
      .bind(quantity, existingBait.id).run();
  } else {
    await db.prepare(
      'INSERT INTO bait (user_id, type_id, quantity, sell_price) VALUES (?, ?, ?, ?)'
    ).bind(userId, baitType.id, quantity, baitType.sell_price).run();
  }

  await db.prepare('UPDATE currencies SET gold = gold - ? WHERE user_id = ?')
    .bind(totalCost, userId).run();

  return c.json({ success: true, goldSpent: totalCost });
}
