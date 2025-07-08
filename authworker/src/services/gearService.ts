import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

export async function getUserGearService(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return { error: 'Unauthorized' };

  let email: string;
  try {
    email = atob(session);
  } catch {
    return { error: 'Invalid session' };
  }

  const db = c.env.DB as D1Database;

  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
  if (!user) return { error: 'User not found' };
  const userId = user.id;

  // Fetch gear, bait, equipped
const [rodsRes, hooksRes, baitRes, equipped] = await Promise.all([
  db.prepare('SELECT * FROM rods WHERE user_id = ?').bind(userId).all(),
  db.prepare('SELECT * FROM hooks WHERE user_id = ?').bind(userId).all(),
  db.prepare('SELECT * FROM bait WHERE user_id = ?').bind(userId).all(),
  db.prepare('SELECT equipped_rod_id, equipped_hook_id, equipped_bait_id FROM equipped WHERE user_id = ?').bind(userId).first(),
]);

  return {
    rods: rodsRes.results || [],
    hooks: hooksRes.results || [],
    bait: baitRes.results || [],
    equipped: equipped || null,
  };
}

export async function equipGearService(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return { error: 'Unauthorized' };

  let email: string;
  try {
    email = atob(session);
  } catch {
    return { error: 'Invalid session' };
  }

  const db = c.env.DB as D1Database;
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
  if (!user) return { error: 'User not found' };
  const userId = user.id;

  const json = await c.req.json();
  const { rodId, hookId, baitId } = json;

  // Upsert equipped row
await db.prepare(`
  INSERT INTO equipped (user_id, equipped_rod_id, equipped_hook_id, equipped_bait_id)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(user_id) DO UPDATE SET
    equipped_rod_id = excluded.equipped_rod_id,
    equipped_hook_id = excluded.equipped_hook_id,
    equipped_bait_id = excluded.equipped_bait_id
`).bind(userId, rodId ?? null, hookId ?? null, baitId ?? null).run();

  return { success: true };
}