import { generateFish } from './generateFishService';
import { saveCaughtFish } from './putFish';
import { getUserEmail } from './authHelperService';
import type { Context } from 'hono';

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

async function getUserWeatherId(db: D1Database, email: string): Promise<number | null> {
  const result = await db
    .prepare('SELECT current_weather_id FROM users WHERE email = ?')
    .bind(email)
    .first<{ current_weather_id: number | null }>();
  return result?.current_weather_id ?? null;
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

export async function startFishing(c: Context<{ Bindings: any }>) {
  const email = await getUserEmail(c);
  if (!email) throw new Error('Unauthorized');

  const db = c.env.DB as D1Database;

  const zoneId = await getUserZone(db, email);
  if (zoneId === null) throw new Error('User zone not found');

  const weatherId = (await getUserWeatherId(db, email)) ?? 1;
  const zoneName = await getZoneNameFromId(db, zoneId);
  const fishTypes = await getFishTypesForZone(db, zoneId);

  const fish = await generateFish(fishTypes, weatherId, zoneName);
  const biteDelay = 4000 + Math.random() * 4000;
  const biteTime = Date.now() + biteDelay;

  await db.prepare(`
    INSERT OR REPLACE INTO fishingSessions (email, fish_json, bite_time)
    VALUES (?, ?, ?)
  `).bind(email, JSON.stringify(fish), biteTime).run();

  return {
    biteDelay: Math.round(biteDelay),
    fishPreview: {
      species: fish.species,
      rarity: fish.rarity,
      stamina: fish.stamina,
      tug_strength: fish.tug_strength,
    },
  };
}

export async function catchFish(c: Context<{ Bindings: any }>) {
  const email = await getUserEmail(c);
  if (!email) throw new Error('Unauthorized');

  const db = c.env.DB as D1Database;

  const userId = await getUserIdByEmail(db, email);
  if (!userId) throw new Error('User not found');

  const result = await db.prepare(`
    SELECT fish_json, bite_time FROM fishingSessions WHERE email = ?
  `).bind(email).first<{ fish_json: string, bite_time: number }>();

  if (!result) throw new Error('No fishing session found');

  const session: FishCatchSession = {
    fish: JSON.parse(result.fish_json),
    biteTime: result.bite_time,
  };

  const now = Date.now();
  const maxCatchWindow = 30000;

  if (now > session.biteTime + maxCatchWindow) {
    await db.prepare('DELETE FROM fishingSessions WHERE email = ?').bind(email).run();
    throw new Error('Catch window expired');
  }

  await saveCaughtFish(userId, session.fish, db);

  await db.prepare('DELETE FROM fishingSessions WHERE email = ?').bind(email).run();

  return { caught: true, fish: session.fish };
}