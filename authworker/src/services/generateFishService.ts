import type { Context } from 'hono';

interface FishType {
  species: string;
  base_weight: number;
  base_length: number;
  stamina: number;
  tugStrength: number;
  changeRate: number;
  changeStrength: number;
  sell_price: number;
  rarity: string;
  zones: string[];
  barType?: 
    | 'middle'
    | 'middleSmall'
    | 'low'
    | 'high'
    | 'double'
    | 'dynamicSmall'
    | 'dynamicMedium'
    | 'dynamicLarge';
}

interface ResourceType {
  name: string;
  rarity: string;
  zones: string[];
  stamina?: number;
  tugStrength?: number;
  changeRate?: number;
  changeStrength?: number;
  sell_price?: number;
  barType?: FishType['barType'];
}

interface GearStats {
  focus: number;
  lineTension: number;
  luck: number;
}

// Helper to get gear stats from DB by user email stored in cookie
export async function getPlayerGearStats(c: Context<{ Bindings: any }>): Promise<GearStats> {
  const { getCookie } = await import('hono/cookie');
  const session = getCookie(c, 'session');
  if (!session) return { focus: 50, lineTension: 50, luck: 0 };

  let email: string;
  try {
    email = atob(session);
  } catch {
    return { focus: 50, lineTension: 50, luck: 0 };
  }

  const db = c.env.DB;
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (!user) return { focus: 50, lineTension: 50, luck: 0 };

  const equippedRow = await db.prepare(
    `SELECT equipped_rod_id, equipped_hook_id, equipped_bait_id FROM equipped WHERE user_id = ?`
  ).bind(user.id).first();

  if (!equippedRow) return { focus: 200, lineTension: 200, luck: 0 };

  const gearRows = await db.prepare(
    `SELECT id, stats FROM gear WHERE id IN (?, ?)`
  ).bind(equippedRow.equipped_rod_id, equippedRow.equipped_hook_id).all();

  let baitStats = { focus: 0, lineTension: 0, luck: 0 };
  if (equippedRow.equipped_bait_id) {
    const baitRow = await db.prepare(`SELECT stats FROM bait WHERE id = ?`).bind(equippedRow.equipped_bait_id).first();
    if (baitRow?.stats) {
      try {
        baitStats = JSON.parse(baitRow.stats);
      } catch {
        baitStats = { focus: 0, lineTension: 0, luck: 0 };
      }
    }
  }

  let rodStats = { focus: 0, lineTension: 0, luck: 0 };
  let hookStats = { focus: 0, lineTension: 0, luck: 0 };

  for (const gear of gearRows.results || gearRows) {
    let stats = { focus: 0, lineTension: 0, luck: 0 };
    try {
      stats = gear.stats ? JSON.parse(gear.stats) : stats;
    } catch {}
    if (gear.id === equippedRow.equipped_rod_id) rodStats = stats;
    else if (gear.id === equippedRow.equipped_hook_id) hookStats = stats;
  }

  const focusSum = (rodStats.focus || 0) + (hookStats.focus || 0) + (baitStats.focus || 0);
  const lineTensionSum = (rodStats.lineTension || 0) + (hookStats.lineTension || 0) + (baitStats.lineTension || 0);
  const luckSum = (rodStats.luck || 0) + (hookStats.luck || 0) + (baitStats.luck || 0);

  return {
    focus: focusSum > 0 ? focusSum : 200,
    lineTension: lineTensionSum > 0 ? lineTensionSum : 200,
    luck: luckSum,
  };
}

const modifierChances = [
  { name: 'Albino', weight: 25 },
  { name: 'Buff', weight: 30 },
  { name: 'Elusive', weight: 30 },
  { name: 'Golden', weight: 5 },
  { name: 'Glowing', weight: 10 },
];

const baseRarityWeights = {
  mythic: 0.001,
  legendary: 0.01,
  epic: 0.05,
  rare: 0.10,
  uncommon: 0.20,
  common: 0.639,
};

const weatherRarityMultipliers: Record<number, Partial<Record<string, number>>> = {
  1: {},
  2: {
    mythic: 1.25,
    legendary: 1.25,
    epic: 1.25,
    rare: 1.25,
    uncommon: 1.25,
  },
};

function getAdjustedWeights(weatherId: number) {
  const multipliers = weatherRarityMultipliers[weatherId] || {};
  const adjustedWeights: Record<string, number> = {};
  let total = 0;
  for (const [rarity, baseWeight] of Object.entries(baseRarityWeights)) {
    const multiplier = multipliers[rarity] ?? 1;
    adjustedWeights[rarity] = baseWeight * multiplier;
    total += adjustedWeights[rarity];
  }
  for (const rarity in adjustedWeights) {
    adjustedWeights[rarity] /= total;
  }
  return adjustedWeights;
}

function getAdjustedWeightsWithLuck(weatherId: number, luck: number) {
  const baseWeights = getAdjustedWeights(weatherId);
  const luckMultiplier = 1 + luck * 0.01; // 1% per luck point
  const adjusted: Record<string, number> = {};
  let total = 0;
  for (const [rarity, weight] of Object.entries(baseWeights)) {
    if (['rare', 'epic', 'legendary', 'mythic'].includes(rarity)) {
      adjusted[rarity] = weight * luckMultiplier;
    } else {
      adjusted[rarity] = weight;
    }
    total += adjusted[rarity];
  }
  for (const r in adjusted) {
    adjusted[r] /= total;
  }
  return adjusted;
}

function pickRarity(weatherId: number, luck: number) {
  const adjustedWeights = getAdjustedWeightsWithLuck(weatherId, luck);
  const roll = Math.random();
  let acc = 0;
  for (const [rarity, weight] of Object.entries(adjustedWeights)) {
    acc += weight;
    if (roll <= acc) return rarity;
  }
  return 'common';
}

function pickModifier(): string | null {
  if (Math.random() > 0.01) return null;

  const roll = Math.random() * 100;
  let acc = 0;
  for (const mod of modifierChances) {
    acc += mod.weight;
    if (roll <= acc) return mod.name;
  }
  return null;
}

function generateLength(weight: number, base_weight: number, base_length: number): number {
  const ratio = weight / base_weight;
  return +(base_length * ratio).toFixed(1);
}

function isMassive(weight: number, base_weight: number): boolean {
  const max = base_weight * 1.5;
  const min = base_weight * 0.5;
  return weight >= max - (max - min) * 0.05;
}

export async function generateFish(
  c: Context<{ Bindings: any }>,
  fishTypes: FishType[],
  resourceTypes: ResourceType[],
  weatherId: number,
  zoneName: string
) {
  const gearStats = await getPlayerGearStats(c);
  const luck = gearStats.luck || 0;

  const isResource = Math.random() < 0.2; // 20% chance resource

  if (isResource) {
    const resourcesInZone = resourceTypes.filter(r =>
      Array.isArray(r.zones) && r.zones.some(z => z.trim().toLowerCase() === zoneName.trim().toLowerCase())
    );
    if (!resourcesInZone.length) throw new Error('No resources in this zone');

    const rarity = pickRarity(weatherId, luck);
    const possibleResources = resourcesInZone.filter(r => r.rarity === rarity);
    const chosenResourcePool = possibleResources.length ? possibleResources : resourcesInZone.filter(r => r.rarity === 'common');
    const resource = chosenResourcePool[Math.floor(Math.random() * chosenResourcePool.length)];

    return {
      type: 'resource',
      isResource: true,
      gearStats,
      data: {
        species: resource.name,
        rarity: resource.rarity,
        stamina: resource.stamina ?? 100,
        tugStrength: resource.tugStrength ?? 100,
        changeRate: resource.changeRate ?? 100,
        changeStrength: resource.changeStrength ?? 100,
        barType: resource.barType ?? 'middle',
        sellPrice: resource.sell_price ?? 100,
      },
    };
  } else {
    const fishInZone = fishTypes.filter(f =>
      Array.isArray(f.zones) && f.zones.some(z => z.trim().toLowerCase() === zoneName.trim().toLowerCase())
    );
    if (!fishInZone.length) throw new Error('No fish in this zone');

    const rarity = pickRarity(weatherId, luck);
    const possibleFish = fishInZone.filter(f => f.rarity === rarity);
    const chosenFishPool = possibleFish.length ? possibleFish : fishInZone.filter(f => f.rarity === 'common');
    const fish = chosenFishPool[Math.floor(Math.random() * chosenFishPool.length)];

    const weight = +(fish.base_weight * (0.5 + Math.random())).toFixed(2);
    const length = generateLength(weight, fish.base_weight, fish.base_length);
    const massive = isMassive(weight, fish.base_weight);
    const modifier = pickModifier();

    let stamina = fish.stamina;
    let tugStrength = fish.tugStrength;
    let changeRate = fish.changeRate;
    let changeStrength = fish.changeStrength;

    if (modifier === 'Buff') stamina = Math.round(stamina * 1.3);
    else if (modifier === 'Elusive') tugStrength = Math.round(tugStrength * 1.2);

    return {
      type: 'fish',
      isResource: false,
      gearStats,
      data: {
        species: fish.species,
        rarity,
        weight,
        length,
        massive,
        modifier,
        stamina,
        tugStrength,
        changeRate,
        changeStrength,
        barType: fish.barType || 'middle',
        sellPrice: fish.sell_price,
      },
    };
  }
}
