// src/services/getInventoryService.ts
import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

export async function getInventoryService(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return { error: 'Unauthorized' };

  let email: string;
  try {
    email = atob(session);
  } catch {
    return { error: 'Invalid session' };
  }

  const db = c.env.DB;

  // Ensure user exists
  let user = await db.prepare('SELECT id, current_zone_id FROM users WHERE email = ?').bind(email).first();
  if (!user) {
    await db.prepare('INSERT INTO users (email, xp, level, current_zone_id) VALUES (?, 0, 1, NULL)').bind(email).run();
    user = await db.prepare('SELECT id, current_zone_id FROM users WHERE email = ?').bind(email).first();
    if (!user) return { error: 'User creation failed' };
  }

  const userId = user.id;
  const currentZoneId = user.current_zone_id;

  // Ensure currencies row exists
  const currencyExists = await db.prepare('SELECT 1 FROM currencies WHERE user_id = ?').bind(userId).first();
  if (!currencyExists) {
    await db.prepare(`
      INSERT INTO currencies (user_id, gold, pearls, coral_shards, echo_shards)
      VALUES (?, 0, 0, 0, 0)
    `).bind(userId).run();
  }

  const [currency, fish, biggestFish, resources, gear, bait] = await Promise.all([
    db.prepare(`
      SELECT gold, pearls, coral_shards, echo_shards
      FROM currencies WHERE user_id = ?
    `).bind(userId).first(),

    db.prepare(`
      SELECT species, modifier, rarity, SUM(quantity) as quantity,
             MAX(weight) as max_weight, MAX(length) as max_length
      FROM fish
      WHERE user_id = ?
      GROUP BY species, modifier, rarity
    `).bind(userId).all(),

    db.prepare(`
      SELECT species, modifier, rarity, max_weight, max_length, caught_at
      FROM biggest_fish
      WHERE user_id = ?
      ORDER BY max_weight DESC
    `).bind(userId).all(),

    db.prepare(`
      SELECT name AS name, quantity, rarity
      FROM resources WHERE user_id = ?
    `).bind(userId).all(),

    db.prepare(`
      SELECT 
        g.id AS gear_id,
        g.gear_type AS type,
        g.type_id,
        COALESCE(r.name, h.name) AS name,
        g.stats
      FROM gear g
      LEFT JOIN rodTypes r ON g.gear_type = 'rod' AND g.type_id = r.id
      LEFT JOIN hookTypes h ON g.gear_type = 'hook' AND g.type_id = h.id
      WHERE g.user_id = ?
    `).bind(userId).all(),

    db.prepare(`
      SELECT 
        b.id AS bait_id,
        b.type_id,
        bt.name AS bait_type,
        b.quantity,
        b.stats,
        b.sell_price
      FROM bait b
      JOIN baitTypes bt ON b.type_id = bt.id
      WHERE b.user_id = ?
    `).bind(userId).all(),
  ]);

  // Get equipped gear IDs
  const equippedRow = await db.prepare(
    `SELECT equipped_rod_id, equipped_hook_id, equipped_bait_id FROM equipped WHERE user_id = ?`
  ).bind(userId).first();

  // Mark gear as equipped and parse stats JSON
  const gearWithEquippedFlag = (gear?.results || gear || []).map((g: any) => ({
    ...g,
    stats: g.stats ? JSON.parse(g.stats) : undefined,
    equipped: equippedRow
      ? g.gear_id === equippedRow.equipped_rod_id || g.gear_id === equippedRow.equipped_hook_id
      : false,
  }));

  // Mark bait as equipped and parse stats JSON
  const baitWithEquippedFlag = (bait?.results || bait || []).map((b: any) => ({
    ...b,
    stats: b.stats ? JSON.parse(b.stats) : undefined,
    equipped: equippedRow ? b.bait_id === equippedRow.equipped_bait_id : false,
  }));

  return {
    email,
    currency: currency || {},
    fishStacks: fish?.results || fish || [],
    biggestFish: biggestFish?.results || biggestFish || [],
    resources: resources?.results || resources || [],
    gear: gearWithEquippedFlag,
    bait: baitWithEquippedFlag,
    current_zone_id: currentZoneId || null,
  };
}