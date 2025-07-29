import type { Context } from 'hono';
import type { D1Database } from '@cloudflare/workers-types';
import { generateFish } from './generateFishService';
import { saveCaughtFish } from './putFish';
import { getUserEmail } from './authHelperService';
import { updateQuestProgress, getAllQuests, getQuestKeys } from './questService';
import { getWorldState } from './timeContentService';

function getWeatherId(now = Date.now()): number {
  const worldState = getWorldState(now);
  return worldState.isRaining ? 2 : 1;
}

interface FishCatchSession {
  fish: any;
  biteTime: number;
}

async function getUserIdByEmail(db: D1Database, email: string): Promise<number | null> {
  const result = await db
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: number }>();
  return result?.id ?? null;
}

async function getUserZone(db: D1Database, email: string): Promise<number | null> {
  const result = await db
    .prepare('SELECT current_zone_id FROM users WHERE email = ?')
    .bind(email)
    .first<{ current_zone_id: number | null }>();
  return result?.current_zone_id ?? null;
}

async function getZoneNameFromId(db: D1Database, zoneId: number): Promise<string> {
  const result = await db
    .prepare('SELECT name FROM zoneTypes WHERE id = ?')
    .bind(zoneId)
    .first<{ name: string }>();
  if (!result || !result.name) throw new Error('Zone name not found');
  return result.name;
}

async function getFishTypesForZone(db: D1Database, zoneId: number): Promise<any[]> {
  const result = await db
    .prepare(`
      SELECT ft.*, fz.zone_id, zt.name as zone_name
      FROM fishTypeZones fz
      JOIN fishTypes ft ON fz.fish_type_id = ft.id
      JOIN zoneTypes zt ON fz.zone_id = zt.id
      WHERE fz.zone_id = ?
    `)
    .bind(zoneId)
    .all();
  if (!result || !result.results.length) throw new Error('No fish types found for zone');

  return result.results.map((fish) => ({
    ...fish,
    zones: [fish.zone_name],
  }));
}

async function getResourceTypesForZone(db: D1Database, zoneId: number): Promise<any[]> {
  const result = await db
    .prepare(`
      SELECT rt.*, rtz.zone_id, zt.name as zone_name
      FROM resourceTypeZones rtz
      JOIN resourceTypes rt ON rtz.resource_type_id = rt.id
      JOIN zoneTypes zt ON rtz.zone_id = zt.id
      WHERE rtz.zone_id = ?
    `)
    .bind(zoneId)
    .all();
  if (!result || !result.results.length) throw new Error('No resource types found for zone');

  return result.results.map((resource) => ({
    ...resource,
    zones: [resource.zone_name],
  }));
}

export async function startFishing(c: Context<{ Bindings: any }>) {
  const email = await getUserEmail(c);
  if (!email) throw new Error('Unauthorized');

  const db = c.env.DB as D1Database;

  const zoneId = await getUserZone(db, email);
  if (zoneId === null) throw new Error('User zone not found');

  const zoneName = await getZoneNameFromId(db, zoneId);
  const fishTypes = await getFishTypesForZone(db, zoneId);
  const resourceTypes = await getResourceTypesForZone(db, zoneId);

  // Fetch active consumables and weather for buffs
  const now = Date.now();
  const worldState = getWorldState(now);

  const userId = await getUserIdByEmail(db, email);
  if (!userId) throw new Error('User not found');

// Remove stale active consumables first
await db.prepare(`
  DELETE FROM activeConsumables
  WHERE user_id = ?
    AND datetime(started_at, '+' || duration || ' seconds') <= datetime('now')
`).bind(userId).run();

const activeConsumables = await db.prepare(`
  SELECT t.effect FROM activeConsumables a
  JOIN consumableTypes t ON a.type_id = t.id
  WHERE a.user_id = ?
`).bind(userId).all();


  let baitPreserveFromConsumables = 0;
  let luckFromConsumables = 0;
  let focusFromConsumables = 0;
  let lineTensionFromConsumables = 0;

  for (const row of activeConsumables.results ?? []) {
    if (typeof row.effect === 'string') {
      const effect = row.effect.toLowerCase();
      const baitMatch = effect.match(/bait\s*\+(\d+)%/);
      if (baitMatch) baitPreserveFromConsumables += parseInt(baitMatch[1], 10);
      const luckMatch = effect.match(/luck\s*\+(\d+)%/);
      if (luckMatch) luckFromConsumables += parseInt(luckMatch[1], 10);
      const focusMatch = effect.match(/focus\s*\+(\d+)%/);
      if (focusMatch) focusFromConsumables += parseInt(focusMatch[1], 10);
      const tensionMatch = effect.match(/tension\s*\+(\d+)%/);
      if (tensionMatch) lineTensionFromConsumables += parseInt(tensionMatch[1], 10);
    }
  }

  // Base buffs from weather
  const baitPreserveFromWeather = worldState.isRaining ? 20 : 0;
  const luckFromWeather = worldState.isRaining ? 15 : 0;

  // Summed totals for buffs
  const totalBaitPreserve = baitPreserveFromConsumables + baitPreserveFromWeather;
  const totalLuck = luckFromConsumables + luckFromWeather;
  const totalFocus = focusFromConsumables;
  const totalLineTension = lineTensionFromConsumables;

  const fish = await generateFish(c, fishTypes, resourceTypes, getWeatherId(now), zoneName, {
    luck: totalLuck,
    focus: totalFocus,
    lineTension: totalLineTension,
    baitPreserve: totalBaitPreserve,
  });

  const biteDelay = 4000 + Math.random() * 4000;
  const biteTime = now + biteDelay;

  await db.prepare(`
    INSERT OR REPLACE INTO fishingSessions (email, fish_json, bite_time)
    VALUES (?, ?, ?)
  `).bind(email, JSON.stringify(fish), biteTime).run();

  return {
    biteDelay: Math.round(biteDelay),
    fishPreview: {
      species: fish.data.species,
      rarity: fish.data.rarity,
      stamina: fish.data.stamina,
      tugStrength: fish.data.tugStrength,
      changeRate: fish.data.changeRate,
      changeStrength: fish.data.changeStrength,
      barType: fish.data.barType,
      data: fish.data,
      gearStats: fish.gearStats,
      isResource: fish.isResource,
    },
  };
}

export async function catchFish(c: Context<{ Bindings: any }>) {
  const email = await getUserEmail(c);
  if (!email) throw new Error('Unauthorized');

  const db = c.env.DB as D1Database;

  const userId = await getUserIdByEmail(db, email);
  if (!userId) throw new Error('User not found');

  const sessionRow = await db.prepare(`SELECT fish_json, bite_time FROM fishingSessions WHERE email = ?`)
    .bind(email).first<{ fish_json: string; bite_time: number }>();
  if (!sessionRow) throw new Error('No fishing session found');

  const session = {
    fish: JSON.parse(sessionRow.fish_json),
    biteTime: sessionRow.bite_time,
  };

  const now = Date.now();
  const maxCatchWindow = 60000;
  if (now > session.biteTime + maxCatchWindow) {
    await db.prepare('DELETE FROM fishingSessions WHERE email = ?').bind(email).run();
    throw new Error('Catch window expired');
  }

  const worldState = getWorldState(now);

// Remove stale active consumables first
await db.prepare(`
  DELETE FROM activeConsumables
  WHERE user_id = ?
    AND datetime(started_at, '+' || duration || ' seconds') <= datetime('now')
`).bind(userId).run();

const activeConsumables = await db.prepare(`
  SELECT t.effect FROM activeConsumables a
  JOIN consumableTypes t ON a.type_id = t.id
  WHERE a.user_id = ?
`).bind(userId).all();


  let baitPreserveFromConsumables = 0;
  let luckFromConsumables = 0;
  let focusFromConsumables = 0;
  let lineTensionFromConsumables = 0;

  for (const row of activeConsumables.results ?? []) {
    if (typeof row.effect === 'string') {
      const effect = row.effect.toLowerCase();
      const baitMatch = effect.match(/bait\s*\+(\d+)%/);
      if (baitMatch) baitPreserveFromConsumables += parseInt(baitMatch[1], 10);
      const luckMatch = effect.match(/luck\s*\+(\d+)%/);
      if (luckMatch) luckFromConsumables += parseInt(luckMatch[1], 10);
      const focusMatch = effect.match(/focus\s*\+(\d+)%/);
      if (focusMatch) focusFromConsumables += parseInt(focusMatch[1], 10);
      const tensionMatch = effect.match(/tension\s*\+(\d+)%/);
      if (tensionMatch) lineTensionFromConsumables += parseInt(tensionMatch[1], 10);
    }
  }

  const baitPreserveFromWeather = worldState.isRaining ? 20 : 0;
  const luckFromWeather = worldState.isRaining ? 15 : 0;

  const totalBaitPreserve = baitPreserveFromConsumables + baitPreserveFromWeather;
  const totalLuck = luckFromConsumables + luckFromWeather;
  const totalFocus = focusFromConsumables;
  const totalLineTension = lineTensionFromConsumables;

  // Fetch equipped bait info
  const equipped = await db.prepare(`SELECT equipped_bait_id FROM equipped WHERE user_id = ?`)
    .bind(userId).first<{ equipped_bait_id: number | null }>();

  let baitStats = { focus: 0, lineTension: 0, luck: 0, baitPreserve: 0 };

  if (equipped?.equipped_bait_id) {
    const bait = await db.prepare(`
      SELECT quantity, stats FROM bait WHERE id = ? AND user_id = ?
    `).bind(equipped.equipped_bait_id, userId).first<{ quantity: number; stats: string }>();

    if (bait && bait.quantity > 0) {
      try {
        const parsedStats = JSON.parse(bait.stats);
        baitStats = {
          focus: parsedStats.focus ?? 0,
          lineTension: parsedStats.lineTension ?? 0,
          luck: parsedStats.luck ?? 0,
          baitPreserve: parsedStats.baitPreserve ?? 0,
        };
      } catch {
        baitStats = { focus: 0, lineTension: 0, luck: 0, baitPreserve: 0 };
      }

      const combinedBaitPreserve = baitStats.baitPreserve + totalBaitPreserve;
console.log('baitStats.baitPreserve:', baitStats.baitPreserve, 'totalBaitPreserve:', totalBaitPreserve, 'combinedBaitPreserve:', combinedBaitPreserve);

      const preserveRoll = Math.random() * 100;
      const preserved = preserveRoll < combinedBaitPreserve;


      if (!preserved) {
        if (bait.quantity > 1) {
          await db.prepare(`UPDATE bait SET quantity = quantity - 1 WHERE id = ?`)
            .bind(equipped.equipped_bait_id).run();
        } else {
          await db.prepare(`UPDATE equipped SET equipped_bait_id = NULL WHERE user_id = ?`)
            .bind(userId).run();
          await db.prepare(`DELETE FROM bait WHERE id = ?`)
            .bind(equipped.equipped_bait_id).run();
        }
      }
    }
  }

  const totalLuckFinal = (session.fish.gearStats?.luck ?? 0) + baitStats.luck + totalLuck;

  const fishDataWithStats = {
    ...session.fish.data,
    baitStats,
    luck: totalLuckFinal,
    focus: totalFocus,
    lineTension: totalLineTension,
    baitPreserve: baitStats.baitPreserve + totalBaitPreserve,
    isResource: session.fish.isResource,
  };

  await saveCaughtFish(userId, fishDataWithStats, db);

  // Quest update
  const quests = await getAllQuests(db);
  const questKeys = getQuestKeys();
  const equippedRow = await db.prepare(`SELECT equipped_rod_id, equipped_hook_id, equipped_bait_id FROM equipped WHERE user_id = ?`)
    .bind(userId).first();

  const playerContext = {
    timeOfDay: worldState.phase,
    zone: await getZoneNameFromId(db, (await getUserZone(db, email)) ?? 1),
    weather: worldState.isRaining ? 'rainy' : 'sunny',
    hasBait: !!equippedRow?.equipped_bait_id,
    hasRod: !!equippedRow?.equipped_rod_id,
    hasHook: !!equippedRow?.equipped_hook_id,
  };

  await updateQuestProgress(db, userId, [fishDataWithStats], quests, questKeys, playerContext);

  await db.prepare('DELETE FROM fishingSessions WHERE email = ?').bind(email).run();

  return { caught: true, fish: fishDataWithStats };
}