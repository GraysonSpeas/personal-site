import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

export async function getPlayerGearStats(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return { error: 'Unauthorized' };

  let email: string;
  try {
    email = atob(session);
  } catch {
    return { error: 'Invalid session' };
  }

  const db = c.env.DB;

  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (!user) return { error: 'User not found' };

  const userId = user.id;

  // Get equipped gear/bait IDs
  const equippedRow = await db.prepare(
    `SELECT equipped_rod_id, equipped_hook_id, equipped_bait_id FROM equipped WHERE user_id = ?`
  ).bind(userId).first();

  if (!equippedRow) {
    return { playerFocus: 0, playerLineTension: 0, playerLuck: 0 };
  }

  // Fetch rod and hook stats JSON
  const gearRows = await db.prepare(
    `SELECT id, stats FROM gear WHERE id IN (?, ?)`
  ).bind(equippedRow.equipped_rod_id, equippedRow.equipped_hook_id).all();

  // Fetch bait stats JSON
  let baitStats = { focus: 0, lineTension: 0, luck: 0 };
  if (equippedRow.equipped_bait_id) {
    const baitRow = await db.prepare(`SELECT stats FROM bait WHERE id = ?`).bind(equippedRow.equipped_bait_id).first();
    if (baitRow?.stats) baitStats = JSON.parse(baitRow.stats);
  }

  let rodStats = { focus: 0, lineTension: 0, luck: 0 };
  let hookStats = { focus: 0, lineTension: 0, luck: 0 };

  for (const gear of gearRows.results || gearRows) {
    const stats = gear.stats ? JSON.parse(gear.stats) : { focus: 0, lineTension: 0, luck: 0 };
    if (gear.id === equippedRow.equipped_rod_id) rodStats = stats;
    else if (gear.id === equippedRow.equipped_hook_id) hookStats = stats;
  }

  const playerFocus = (rodStats.focus || 0) + (hookStats.focus || 0) + (baitStats.focus || 0);
  const playerLineTension = (rodStats.lineTension || 0) + (hookStats.lineTension || 0) + (baitStats.lineTension || 0);
  const playerLuck = (rodStats.luck || 0) + (hookStats.luck || 0) + (baitStats.luck || 0);

  return { playerFocus, playerLineTension, playerLuck };
}