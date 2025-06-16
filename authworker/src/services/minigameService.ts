import { generateFish } from './generateFishService';
import { saveCaughtFish } from './putFish';

interface FishCatchSession {
  fish: any;
  biteTime: number;
}

const sessions = new Map<string, FishCatchSession>();

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

export async function startFishing(email: string, db: D1Database) {
  const zoneId = await getUserZone(db, email);
  if (zoneId === null) throw new Error('User zone not found');

  const weatherId = (await getUserWeatherId(db, email)) ?? 1;
  const zoneName = await getZoneNameFromId(db, zoneId);
  const fishTypes = await getFishTypesForZone(db, zoneId);

  const fish = await generateFish(fishTypes, weatherId, zoneName);

  const biteDelay = 4000 + Math.random() * 4000;
  const biteTime = Date.now() + biteDelay;

  sessions.set(email, { fish, biteTime });

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

export async function catchFish(email: string, db: D1Database) {
  const userId = await getUserIdByEmail(db, email);
  if (!userId) throw new Error('User not found');

  const session = sessions.get(email);
  if (!session) throw new Error('No fishing session found');

  const now = Date.now();
  const maxCatchWindow = 15000; // 15s after biteTime

  if (now > session.biteTime + maxCatchWindow) {
    sessions.delete(email);
    throw new Error('Catch window expired');
  }

  await saveCaughtFish(userId, session.fish, db);
  sessions.delete(email);

  return { caught: true, fish: session.fish };
}
