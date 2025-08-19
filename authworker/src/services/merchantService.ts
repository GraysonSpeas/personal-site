import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { getCatchOfTheDay } from './timeContentService';
import type { D1Database } from '@cloudflare/workers-types';

async function getUserIdFromSession(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return null;
  try {
    return atob(session);
  } catch {
    return null;
  }
}

export async function getMerchantInventory(c: Context<{ Bindings: any }>) {
  const email = await getUserIdFromSession(c);
  if (!email) return c.json({ error: 'Unauthorized' }, 401);

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

  const resourcesRes = await db.prepare(
    `SELECT resources.id, resources.name, resources.quantity, resourceTypes.sell_price, resourceTypes.rarity
     FROM resources
     JOIN resourceTypes ON resources.name = resourceTypes.name
     WHERE resources.user_id = ? AND resources.quantity > 0`
  ).bind(userId).all();

  const seedsRes = await db.prepare(
    `SELECT seeds.seed_type_id, seeds.quantity, seedTypes.name, seedTypes.buy_price
     FROM seeds
     JOIN seedTypes ON seeds.seed_type_id = seedTypes.id
     WHERE seeds.user_id = ? AND seeds.quantity > 0`
  ).bind(userId).all();

  const goldRes = await db.prepare('SELECT gold FROM currencies WHERE user_id = ?').bind(userId).first<{ gold: number }>();
  const gold = goldRes?.gold ?? 0;

  const allFishTypes = await db.prepare('SELECT species, rarity FROM fishTypes').all<{ species: string; rarity: string }>();
  const cotd = getCatchOfTheDay(allFishTypes.results);

  const speciesList = cotd.fishes.map(f => f.species);
  let salesRows: { species: string; sell_limit: number; sell_amount: number }[] = [];
  if (speciesList.length) {
    const placeholders = speciesList.map(() => '?').join(',');
    const salesRes = await db.prepare(
      `SELECT species, sell_limit, sell_amount FROM user_fish_sales WHERE user_id = ? AND species IN (${placeholders})`
    ).bind(userId, ...speciesList).all<{ species: string; sell_limit: number; sell_amount: number }>();
    salesRows = salesRes.results || [];
  }

  const salesMap = new Map(salesRows.map(row => [row.species, row]));

  const catchOfTheDayData = cotd.fishes.map(fish => {
    const sales = salesMap.get(fish.species);
    const sellLimit = sales?.sell_limit ?? fish.sellLimit ?? 5;
    const sellAmount = sales?.sell_amount ?? 0;
    const remaining = sellLimit - sellAmount;
    const fishType = allFishTypes.results.find(ft => ft.species === fish.species);
    return {
      species: fish.species,
      rarity: fishType?.rarity ?? '',
      sellLimit,
      sellAmount,
      remaining,
      multiplier: 1.25,
      showCatchLabel: remaining > 0,
    };
  });

  return c.json({
    fish: fishRes.results || [],
    bait: baitRes.results || [],
    resources: resourcesRes.results || [],
    seeds: seedsRes.results || [],
    gold,
    catchOfTheDay: catchOfTheDayData,
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
  const email = await getUserIdFromSession(c);
  if (!email) return c.json({ error: 'Unauthorized' }, 401);

  const db = c.env.DB as D1Database;
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
  if (!user) return c.json({ error: 'User not found' }, 404);
  const userId = user.id;

  const { itemType, itemId, quantity } = await c.req.json();

  if (!['fish', 'bait', 'resource', 'seed'].includes(itemType)) {
    return c.json({ error: 'Invalid itemType' }, 400);
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return c.json({ error: 'Invalid quantity' }, 400);
  }

  try {
    if (itemType === 'resource') {
      const resource = await db.prepare(
        `SELECT resources.quantity, resourceTypes.sell_price
         FROM resources
         JOIN resourceTypes ON resources.name = resourceTypes.name
         WHERE resources.id = ? AND resources.user_id = ?`
      ).bind(itemId, userId).first<{ quantity: number; sell_price: number }>();

      if (!resource) return c.json({ error: 'Resource not found' }, 404);
      if (resource.quantity < quantity) return c.json({ error: 'Not enough resource quantity' }, 400);

      const totalSellPrice = (resource.sell_price ?? 0) * quantity;

      if (resource.quantity === quantity) {
        await db.prepare('DELETE FROM resources WHERE id = ?').bind(itemId).run();
      } else {
        await db.prepare('UPDATE resources SET quantity = quantity - ? WHERE id = ?')
          .bind(quantity, itemId).run();
      }

      await db.prepare(
        `INSERT INTO currencies (user_id, gold) VALUES (?, ?)
         ON CONFLICT(user_id) DO UPDATE SET gold = gold + excluded.gold`
      ).bind(userId, totalSellPrice).run();

      return c.json({ success: true, goldAdded: totalSellPrice });
    }

    if (itemType === 'fish') {
      const fish = await db.prepare(
        'SELECT quantity, species FROM fish WHERE id = ? AND user_id = ?'
      ).bind(itemId, userId).first<{ quantity: number; species: string }>();
      if (!fish) return c.json({ error: 'Fish not found' }, 404);
      if (fish.quantity < quantity) return c.json({ error: 'Not enough fish quantity' }, 400);

      const fishType = await db.prepare(
        'SELECT sell_price, rarity FROM fishTypes WHERE species = ?'
      ).bind(fish.species).first<{ sell_price: number; rarity: string }>();
      if (!fishType) return c.json({ error: 'Fish type data missing' }, 500);

      const allFishTypes = await db.prepare('SELECT species, rarity FROM fishTypes').all<{ species: string; rarity: string }>();
      const cotd = getCatchOfTheDay(allFishTypes.results);
      const cotdFish = cotd.fishes.find(f => f.species === fish.species);

      const salesRow = await db.prepare(
        'SELECT sell_limit, sell_amount FROM user_fish_sales WHERE user_id = ? AND species = ?'
      ).bind(userId, fish.species).first<{ sell_limit: number; sell_amount: number }>();

      const sellLimit = salesRow?.sell_limit ?? cotdFish?.sellLimit ?? 5;
      const soldAmount = salesRow?.sell_amount ?? 0;

      const quantityToBonus = Math.max(0, sellLimit - soldAmount);
      const bonusQty = Math.min(quantity, quantityToBonus);
      const normalQty = quantity - bonusQty;

      const basePrice = fishType.sell_price;
      const totalSellPrice = bonusQty * basePrice * 1.25 + normalQty * basePrice;

      if (salesRow) {
        await db.prepare(
          'UPDATE user_fish_sales SET sell_amount = sell_amount + ? WHERE user_id = ? AND species = ?'
        ).bind(bonusQty, userId, fish.species).run();
      } else if (bonusQty > 0) {
        await db.prepare(
          'INSERT INTO user_fish_sales (user_id, species, sell_limit, sell_amount) VALUES (?, ?, ?, ?)'
        ).bind(userId, fish.species, sellLimit, bonusQty).run();
      }

      if (fish.quantity === quantity) {
        await db.prepare('DELETE FROM fish WHERE id = ?').bind(itemId).run();
      } else {
        await db.prepare('UPDATE fish SET quantity = quantity - ? WHERE id = ?')
          .bind(quantity, itemId).run();
      }

      await db.prepare(
        `INSERT INTO currencies (user_id, gold) VALUES (?, ?)
         ON CONFLICT(user_id) DO UPDATE SET gold = gold + excluded.gold`
      ).bind(userId, Math.floor(totalSellPrice)).run();

      return c.json({ success: true, goldAdded: Math.floor(totalSellPrice) });
    }

    if (itemType === 'bait') {
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
    }

    if (itemType === 'seed') {
      const seed = await db.prepare(
        `SELECT seeds.quantity, seedTypes.name, seedTypes.buy_price
         FROM seeds
         JOIN seedTypes ON seeds.seed_type_id = seedTypes.id
         WHERE seeds.user_id = ? AND seeds.seed_type_id = ?`
      ).bind(userId, itemId).first<{ quantity: number; name: string; buy_price: number }>();
      if (!seed) return c.json({ error: 'Seed not found' }, 404);
      if (seed.quantity < quantity) return c.json({ error: 'Not enough seed quantity' }, 400);

      const totalSellPrice = (seed.buy_price ?? 0) * quantity;

      if (seed.quantity === quantity) {
        await db.prepare('DELETE FROM seeds WHERE user_id = ? AND seed_type_id = ?').bind(userId, itemId).run();
      } else {
        await db.prepare('UPDATE seeds SET quantity = quantity - ? WHERE user_id = ? AND seed_type_id = ?')
          .bind(quantity, userId, itemId).run();
      }

      await db.prepare(
        `INSERT INTO currencies (user_id, gold) VALUES (?, ?)
         ON CONFLICT(user_id) DO UPDATE SET gold = gold + excluded.gold`
      ).bind(userId, totalSellPrice).run();

      return c.json({ success: true, goldAdded: totalSellPrice });
    }

  } catch (error) {
    console.error('sellMerchantItem error:', error);
    return c.json({ error: 'Database error', details: (error as Error).message }, 500);
  }
}

export async function buyItem(c: Context<{ Bindings: any }>) {
  type ItemType = 'rod' | 'hook' | 'bait' | 'resource' | 'consumable' | 'seed';

  const email = await getUserIdFromSession(c);
  if (!email) return c.json({ error: 'Unauthorized' }, 401);

  const db = c.env.DB as D1Database;
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
  if (!user) return c.json({ error: 'User not found' }, 404);
  const userId = user.id;

  const { items } = await c.req.json() as {
    items: { itemType: ItemType; typeId: number; quantity: number }[];
  };
  if (!items || !Array.isArray(items) || items.length === 0) {
    return c.json({ error: 'No items to buy' }, 400);
  }

  const typeTableMap: Record<ItemType, string> = {
    rod: 'rodTypes',
    hook: 'hookTypes',
    bait: 'baitTypes',
    resource: 'resourceTypes',
    consumable: 'consumableTypes',
    seed: 'seedTypes',
  };
  const userTableMap: Record<ItemType, string> = {
    rod: 'gear',
    hook: 'gear',
    bait: 'bait',
    resource: 'resources',
    consumable: 'consumables',
    seed: 'seeds',
  };

  try {
    const goldRes = await db.prepare('SELECT gold FROM currencies WHERE user_id = ?').bind(userId).first<{ gold: number }>();
    let gold = goldRes?.gold ?? 0;

    let totalCost = 0;

    for (const { itemType, typeId, quantity } of items) {
      if (!['rod', 'hook', 'bait', 'resource', 'consumable', 'seed'].includes(itemType)) {
        return c.json({ error: `Invalid itemType: ${itemType}` }, 400);
      }
      if (typeof quantity !== 'number' || quantity < 0) {
        return c.json({ error: 'Invalid quantity' }, 400);
      }
      if (quantity === 0) continue;

      const typeTable = typeTableMap[itemType];

      if (itemType === 'rod' || itemType === 'hook') {
        const owned = await db.prepare('SELECT id FROM gear WHERE user_id = ? AND gear_type = ? AND type_id = ?')
          .bind(userId, itemType, typeId).first<{ id: number }>();
        if (owned) return c.json({ error: `Already owns this ${itemType}` }, 400);
      }

      const itemData = await db.prepare(`SELECT buy_price FROM ${typeTable} WHERE id = ?`).bind(typeId).first<{ buy_price: number }>();
      if (!itemData) return c.json({ error: 'Item type not found' }, 404);
      const pricePerItem = itemData.buy_price ?? 0;
      if (pricePerItem <= 0) return c.json({ error: 'Invalid item price' }, 400);

      totalCost += pricePerItem * quantity;
    }

    if (gold < totalCost) return c.json({ error: 'Not enough gold' }, 400);
    await db.prepare('UPDATE currencies SET gold = gold - ? WHERE user_id = ?').bind(totalCost, userId).run();

    for (const { itemType, typeId, quantity } of items) {
      if (quantity <= 0) continue;

      const typeTable = typeTableMap[itemType];
      const userTable = userTableMap[itemType];

      if (itemType === 'rod' || itemType === 'hook') {
        await db.prepare('INSERT INTO gear (user_id, gear_type, type_id) VALUES (?, ?, ?)').bind(userId, itemType, typeId).run();
        continue;
      }

      if (itemType === 'resource') {
        const type = await db.prepare('SELECT name, rarity FROM resourceTypes WHERE id = ?').bind(typeId).first<{ name: string; rarity: string }>();
        if (!type) throw new Error('Invalid resource type');

        const existing = await db.prepare('SELECT id, quantity FROM resources WHERE user_id = ? AND name = ?').bind(userId, type.name).first<{ id: number; quantity: number }>();
        if (existing) {
          await db.prepare('UPDATE resources SET quantity = quantity + ? WHERE id = ?').bind(quantity, existing.id).run();
        } else {
          await db.prepare('INSERT INTO resources (user_id, name, rarity, quantity, caught_at) VALUES (?, ?, ?, ?, datetime("now"))')
            .bind(userId, type.name, type.rarity, quantity).run();
        }
        continue;
      }

      const itemData = await db.prepare(`SELECT buy_price FROM ${typeTable} WHERE id = ?`).bind(typeId).first<{ buy_price: number }>();
      if (!itemData) continue;
      const pricePerItem = itemData.buy_price ?? 0;

      if (itemType === 'seed') {
        const existing = await db.prepare('SELECT quantity FROM seeds WHERE user_id = ? AND seed_type_id = ?').bind(userId, typeId).first<{ quantity: number }>();
        if (existing) {
          await db.prepare('UPDATE seeds SET quantity = quantity + ? WHERE user_id = ? AND seed_type_id = ?')
            .bind(quantity, userId, typeId).run();
        } else {
          await db.prepare('INSERT INTO seeds (user_id, seed_type_id, quantity) VALUES (?, ?, ?)')
            .bind(userId, typeId, quantity).run();
        }
        continue;
      }

      const existing = await db.prepare(`SELECT id, quantity FROM ${userTable} WHERE user_id = ? AND type_id = ?`).bind(userId, typeId).first<{ id: number; quantity: number }>();
      if (existing) {
        await db.prepare(`UPDATE ${userTable} SET quantity = quantity + ? WHERE id = ?`).bind(quantity, existing.id).run();
      } else {
        await db.prepare(`INSERT INTO ${userTable} (user_id, type_id, quantity, sell_price) VALUES (?, ?, ?, ?)`).bind(userId, typeId, quantity, pricePerItem).run();
      }
    }

    return c.json({ success: true, goldSpent: totalCost });
  } catch (error) {
    console.error('buyItem error:', error);
    return c.json({ error: 'Database error', details: (error as Error).message }, 500);
  }
}