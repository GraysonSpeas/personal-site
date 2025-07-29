import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { getWorldState } from '../services/timeContentService';

export async function useConsumableService(c: Context<{ Bindings: any }>) {
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

  const { typeId } = await c.req.json();
  if (typeof typeId !== 'number') return { error: 'Invalid typeId' };

  // Check existing active
  const active = await db.prepare(
    'SELECT COUNT(*) as count FROM activeConsumables WHERE user_id = ?'
  ).bind(userId).first<{ count: number }>();
  if ((active?.count ?? 0) >= 2) return { error: 'Max active consumables reached' };

  // Check for duplicate
  const existing = await db.prepare(
    'SELECT 1 FROM activeConsumables WHERE user_id = ? AND type_id = ?'
  ).bind(userId, typeId).first();
  if (existing) return { error: 'Consumable already active' };

  // Check inventory
  const owned = await db.prepare(
    'SELECT quantity FROM consumables WHERE user_id = ? AND type_id = ?'
  ).bind(userId, typeId).first<{ quantity: number }>();
  if (!owned || owned.quantity < 1) return { error: 'Not enough consumables' };

  // Get duration from type
  const type = await db.prepare(
    'SELECT duration FROM consumableTypes WHERE id = ?'
  ).bind(typeId).first<{ duration: number }>();
  if (!type) return { error: 'Invalid consumable type' };

  // Insert into active
  await db.prepare(
    `INSERT INTO activeConsumables (user_id, type_id, started_at, duration)
     VALUES (?, ?, datetime('now'), ?)`
  ).bind(userId, typeId, type.duration).run();

  // Decrease quantity
  await db.prepare(
    'UPDATE consumables SET quantity = quantity - 1 WHERE user_id = ? AND type_id = ?'
  ).bind(userId, typeId).run();

  return { success: true };
}

export async function cancelConsumableService(c: Context<{ Bindings: any }>) {
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

  const { typeId } = await c.req.json();
  if (typeof typeId !== 'number') return { error: 'Invalid typeId' };

  // Delete active consumable
const res = await db.prepare(
  'DELETE FROM activeConsumables WHERE user_id = ? AND type_id = ?'
).bind(userId, typeId).run();

return res.meta.changes > 0 ? { success: true } : { error: 'Not active' };
}

export async function getActiveConsumablesService(c: Context<{ Bindings: any }>) {
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

  const active = await db.prepare(`
    SELECT
      a.type_id,
      c.quantity,
      t.name,
      t.effect,
      CAST((julianday(a.started_at) + a.duration / 86400.0 - julianday('now')) * 86400 AS INTEGER) AS time_remaining
    FROM activeConsumables a
    JOIN consumables c ON a.user_id = c.user_id AND a.type_id = c.type_id
    JOIN consumableTypes t ON a.type_id = t.id
    WHERE a.user_id = ?
  `).bind(userId).all();

  const result = (active.results || []).map(c => ({
    type_id: c.type_id,
    name: c.name,
    quantity: c.quantity,
    effect: c.effect,
    timeRemaining: Math.max(Number(c.time_remaining), 0),
  }));

  // 🔥 Add "Raining" effect if active
  const { isRaining } = getWorldState();
  if (isRaining) {
    result.push({
  type_id: -1,
  name: 'Raining',
  quantity: 0,
  effect: 'luck +20%, bait +5%',
  timeRemaining: 0,
});
  }

  return { consumables: result };
}

export async function getOwnedConsumablesService(c: Context<{ Bindings: any }>) {
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

  const owned = await db.prepare(`
    SELECT c.type_id, c.quantity, t.name, t.description, t.effect
    FROM consumables c
    JOIN consumableTypes t ON c.type_id = t.id
    WHERE c.user_id = ?
  `).bind(userId).all();

  return { consumables: owned.results || [] };
}