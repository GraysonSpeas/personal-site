import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import type { D1Database } from '@cloudflare/workers-types';

const slotPrices = [0, 5000, 10000, 20000]; // slot 0 is free
const upgradePrices = [1000, 2000, 4000, 5000]; // level 1-4
const dropMultipliers = [1, 1.05, 1.1, 1.15, 1.2]; // Level 1-5
const MAX_SLOTS = 4;
const MAX_UPGRADE_LEVEL = dropMultipliers.length;

async function getUser(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return null;
  const email = atob(session);
  const db = c.env.DB as D1Database;

  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
  if (!user) return null;

  const row = await db.prepare('SELECT gold FROM currencies WHERE user_id = ?').bind(user.id).first<{ gold: number }>();
  return { id: user.id, gold: row?.gold ?? 0 };
}

async function getUserPlanterSlots(db: D1Database, userId: number) {
  const slots = await db.prepare(
    'SELECT slot_index, purchased_at, level FROM userPlanterSlots WHERE user_id = ? ORDER BY slot_index ASC'
  ).bind(userId).all<{ slot_index: number; purchased_at: string; level: number }>();
  return slots.results || [];
}

// ----------------- Services -----------------

export async function getActivePlantersService(c: Context<{ Bindings: any }>) {
  const db = c.env.DB as D1Database;
  const user = await getUser(c);
  if (!user) return { error: 'Unauthorized' };
  const userId = user.id;

  let slots = await getUserPlanterSlots(db, userId);

  if (slots.length === 0) {
    await db.prepare(
      'INSERT INTO userPlanterSlots (user_id, slot_index, purchased_at, level) VALUES (?, 0, datetime("now"), 1)'
    ).bind(userId).run();
    slots.push({ slot_index: 0, purchased_at: new Date().toISOString(), level: 1 });
  }

  const planted = await db.prepare(
    `SELECT p.id, p.slot_index, p.harvested, p.ready_at, p.seed_type_id, s.level
     FROM plantedSeeds p
     JOIN userPlanterSlots s ON s.user_id = p.user_id AND s.slot_index = p.slot_index
     WHERE p.user_id = ?`
  ).bind(userId).all<any>();

  const slotData = slots.map(s => {
    const seed = planted.results?.find(p => p.slot_index === s.slot_index && !p.harvested);
    let timeRemaining = 0;
    if (seed) {
      const readyAt = new Date(seed.ready_at).getTime();
      timeRemaining = Math.max(Math.floor((readyAt - Date.now()) / 1000), 0);
    }
    return {
  slotIndex: s.slot_index,
  level: s.level,
  purchasedAt: s.purchased_at,
  timeRemaining,
  hasPlantedSeed: !!seed,
  plantedId: seed?.id,
  seedTypeId: seed?.seed_type_id, // <-- add this
  nextUpgradeCost: s.level < upgradePrices.length ? upgradePrices[s.level] : null,
};
  });

  return { slots: slotData, planted: planted.results || [] };
}

export async function getSeedTypesService(c: Context<{ Bindings: any }>) {
  const db = c.env.DB as D1Database;
  const types = await db.prepare('SELECT id, name FROM seedTypes').all<{ id: number; name: string }>();
  return { seedTypes: types.results || [] };
}

export async function purchasePlanterSlotService(c: Context<{ Bindings: any }>) {
  const db = c.env.DB as D1Database;
  const user = await getUser(c);
  if (!user) return { error: 'Unauthorized' };
  const userId = user.id;

  const slots = await getUserPlanterSlots(db, userId);
  const nextIndex = slots.length;
  if (nextIndex >= MAX_SLOTS) return { error: 'Max slots reached' };

  const price = slotPrices[nextIndex];
  if (user.gold < price) return { error: 'Not enough gold' };

  await db.prepare('UPDATE currencies SET gold = gold - ? WHERE user_id = ?').bind(price, userId).run();
  await db.prepare(
    'INSERT INTO userPlanterSlots (user_id, slot_index, purchased_at, level) VALUES (?, ?, datetime("now"), 1)'
  ).bind(userId, nextIndex).run();

  return { success: true, slotIndex: nextIndex, price, level: 1 };
}

export async function upgradePlanterSlotService(c: Context<{ Bindings: any }>, slotIndex: number) {
  const db = c.env.DB as D1Database;
  const user = await getUser(c);
  if (!user) return { error: 'Unauthorized' };
  const userId = user.id;

  const slot = await db.prepare(
    'SELECT level FROM userPlanterSlots WHERE user_id = ? AND slot_index = ?'
  ).bind(userId, slotIndex).first<{ level: number }>();
  if (!slot) return { error: 'Slot not found' };
  if (slot.level >= MAX_UPGRADE_LEVEL) return { error: 'Max upgrade reached' };

  const price = upgradePrices[slot.level - 1];
  if (user.gold < price) return { error: 'Not enough gold' };

  await db.prepare('UPDATE currencies SET gold = gold - ? WHERE user_id = ?').bind(price, userId).run();
  await db.prepare('UPDATE userPlanterSlots SET level = level + 1 WHERE user_id = ? AND slot_index = ?')
    .bind(userId, slotIndex).run();

  return { success: true, slotIndex, newLevel: slot.level + 1, price };
}

export async function plantSeedService(c: Context<{ Bindings: any }>, slotIndex: number, seedTypeId: number) {
  const db = c.env.DB as D1Database;
  const user = await getUser(c);
  if (!user) return { error: 'Unauthorized' };
  const userId = user.id;

  const slot = await db.prepare(
    'SELECT level FROM userPlanterSlots WHERE user_id = ? AND slot_index = ?'
  ).bind(userId, slotIndex).first<{ level: number }>();
  if (!slot) return { error: 'Slot not found' };

  const occupied = await db.prepare(
    'SELECT id FROM plantedSeeds WHERE user_id = ? AND harvested = 0 AND slot_index = ?'
  ).bind(userId, slotIndex).first();
  if (occupied) return { error: 'Slot already occupied' };

  const seed = await db.prepare(
    'SELECT grow_time, output_bait_type_id, output_resource_type_id, output_quantity FROM seedTypes WHERE id = ?'
  ).bind(seedTypeId).first<any>();
  if (!seed) return { error: 'Invalid seed type' };

  const now = new Date();
  const readyAt = new Date(now.getTime() + seed.grow_time * 1000).toISOString();

  await db.prepare(
    'INSERT INTO plantedSeeds (user_id, seed_type_id, slot_index, planted_at, ready_at, harvested) VALUES (?, ?, ?, ?, ?, 0)'
  ).bind(userId, seedTypeId, slotIndex, now.toISOString(), readyAt).run();

  return { success: true, slotIndex, readyAt };
}

export async function harvestSeedService(c: Context<{ Bindings: any }>, plantedId: number) {
  const db = c.env.DB as D1Database;
  const user = await getUser(c);
  if (!user) return { error: 'Unauthorized' };
  const userId = user.id;

  const planted = await db.prepare(
    `SELECT p.id, p.seed_type_id, p.harvested, p.slot_index, p.ready_at, s.level,
            t.output_bait_type_id, t.output_resource_type_id, t.output_quantity
     FROM plantedSeeds p
     JOIN seedTypes t ON t.id = p.seed_type_id
     JOIN userPlanterSlots s ON s.user_id = p.user_id AND s.slot_index = p.slot_index
     WHERE p.id = ? AND p.user_id = ?`
  ).bind(plantedId, userId).first<any>();

  if (!planted) return { error: 'Planted seed not found' };
  if (planted.harvested) return { error: 'Already harvested' };
  if (new Date(planted.ready_at) > new Date()) return { error: 'Not ready yet' };

  const levelIndex = Math.max(0, Math.min(planted.level - 1, dropMultipliers.length - 1));
  const multiplier = dropMultipliers[levelIndex];

  const quantityToAdd = Math.floor(planted.output_quantity * multiplier);

  if (planted.output_bait_type_id) {
    await db.prepare(
      `INSERT INTO bait (user_id, type_id, quantity)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, type_id) DO UPDATE SET quantity = quantity + ?`
    ).bind(userId, planted.output_bait_type_id, quantityToAdd, quantityToAdd).run();
  }

  if (planted.output_resource_type_id) {
    await db.prepare(
      `INSERT INTO resources (user_id, name, quantity)
       SELECT ?, name, ? FROM resourceTypes WHERE id = ?
       ON CONFLICT(user_id, name) DO UPDATE SET quantity = quantity + ?`
    ).bind(userId, quantityToAdd, planted.output_resource_type_id, quantityToAdd).run();
  }

  await db.prepare('UPDATE plantedSeeds SET harvested = 1 WHERE id = ?').bind(plantedId).run();
  return { success: true, claimed: true, quantity: quantityToAdd };
}