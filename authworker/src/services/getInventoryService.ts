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
      SELECT species, modifier, max_weight, max_length, caught_at
      FROM biggest_fish
      WHERE user_id = ?
      ORDER BY max_weight DESC
    `).bind(userId).all(),

    db.prepare(`
      SELECT name AS resource_name, quantity
      FROM resources WHERE user_id = ?
    `).bind(userId).all(),


    db.prepare(`
      SELECT id AS gear_id, gear_type AS type, gear_name AS name, stats
      FROM gear WHERE user_id = ?
    `).bind(userId).all(),

    db.prepare(`
      SELECT bait_name AS bait_type, quantity
      FROM bait WHERE user_id = ?
    `).bind(userId).all()
  ]);

  return {
    email,
    currency: currency || {},
    fish: fish?.results || [],
    biggestFish: biggestFish?.results || [], // Now an array
    resources: resources?.results || [],
    gear: gear?.results || [],
    bait: bait?.results || [],
    currentZoneId: currentZoneId || null
  };
}