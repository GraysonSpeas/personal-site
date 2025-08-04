// src/seeding/seedService.ts
import { Hono } from 'hono';
import {
  weatherTypes,
  zoneTypes,
  resourceTypes,
  fishTypes,
  rodTypes,
  hookTypes,
  baitTypes,
  consumableTypes,      // new import
  craftingRecipes,      // new import
  quests,
} from './staticData';
import type { D1Database } from '@cloudflare/workers-types';

const seedRouter = new Hono<{ Bindings: { DB: D1Database } }>();

async function getZoneId(db: D1Database, zoneName: string): Promise<number | null> {
  const zone = await db
    .prepare('SELECT id FROM zoneTypes WHERE name = ?')
    .bind(zoneName)
    .first<{ id: number }>();
  return zone?.id ?? null;
}

export async function seedDatabase(db: D1Database) {
  try {
    console.log('Starting database seeding...');

    // Seed zone types
// Seed zone types
for (const zone of zoneTypes) {
  await db
    .prepare(`INSERT OR IGNORE INTO zoneTypes (name, xp_multiplier) VALUES (?, ?)`)
    .bind(zone.name, zone.xp_multiplier ?? 1.0)
    .run();
}
console.log('Zone types seeded successfully.');

    // Seed weather types
    for (const weather of weatherTypes) {
      await db
        .prepare(`INSERT OR IGNORE INTO weatherTypes (description) VALUES (?)`)
        .bind(weather.description)
        .run();
    }
    console.log('Weather types seeded successfully.');

    // Seed resource types and zones
for (const resource of resourceTypes) {
  const resourceResult = await db
    .prepare(`
      INSERT OR IGNORE INTO resourceTypes
        (name, base_weight, base_length, stamina, tugStrength, changeRate, changeStrength, sell_price, rarity, barType, time_of_day, weather)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      resource.species,
      resource.base_weight,
      resource.base_length,
      resource.stamina,
      resource.tug_strength,
      resource.direction_change_rate,
      resource.change_strength,
      resource.sell_price,
      resource.rarity,
      resource.barType,
      resource.time_of_day ?? null,
      resource.weather ?? null
    )
    .run();

  if (resourceResult.success) {
    for (const zoneName of resource.zones) {
      const zoneId = await getZoneId(db, zoneName);
      if (zoneId) {
        await db
          .prepare(`
            INSERT OR IGNORE INTO resourceTypeZones (resource_type_id, zone_id)
            VALUES ((SELECT id FROM resourceTypes WHERE name = ?), ?)
          `)
          .bind(resource.species, zoneId)
          .run();
      }
    }
  }
}
console.log('Resource types seeded successfully.');


 for (const fish of fishTypes) {
  const fishResult = await db
    .prepare(`
      INSERT OR IGNORE INTO fishTypes
        (species, base_weight, base_length, stamina, tugStrength, changeRate, changeStrength, sell_price, rarity, barType, time_of_day, weather)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      fish.species,
      fish.base_weight,
      fish.base_length,
      fish.stamina,
      fish.tug_strength,
      fish.direction_change_rate,
      fish.change_strength ?? 100,
      fish.sell_price,
      fish.rarity,
      fish.barType ?? 'middle',
      fish.time_of_day ?? null,
      fish.weather ?? null
    )
    .run();

  if (fishResult.success) {
    for (const zoneName of fish.zones) {
      const zoneId = await getZoneId(db, zoneName);
      if (zoneId) {
        await db
          .prepare(`
            INSERT OR IGNORE INTO fishTypeZones (fish_type_id, zone_id)
            VALUES ((SELECT id FROM fishTypes WHERE species = ?), ?)
          `)
          .bind(fish.species, zoneId)
          .run();
      }
    }
  }
}
console.log('Fish types seeded successfully.');


    // Seed rod types
    for (const rod of rodTypes) {
      await db
        .prepare(`
          INSERT OR IGNORE INTO rodTypes (name, base_stats)
          VALUES (?, ?)
        `)
        .bind(rod.name, JSON.stringify(rod.stats))
        .run();
    }
    console.log('Rod types seeded successfully.');

    // Seed hook types
    for (const hook of hookTypes) {
      await db
        .prepare(`
          INSERT OR IGNORE INTO hookTypes (name, base_stats)
          VALUES (?, ?)
        `)
        .bind(hook.name, JSON.stringify(hook.stats))
        .run();
    }
    console.log('Hook types seeded successfully.');

    // Seed bait types
    for (const bait of baitTypes) {
      await db
        .prepare(`
          INSERT OR IGNORE INTO baitTypes (name, base_stats, sell_price)
          VALUES (?, ?, ?)
        `)
        .bind(bait.name, JSON.stringify(bait.stats), bait.sell_price)
        .run();
    }
    console.log('Bait types seeded successfully.');

    // Seed consumable types (new)
for (const consumable of consumableTypes) {
  await db
    .prepare(`
      INSERT OR IGNORE INTO consumableTypes (name, description, effect, duration, sell_price)
      VALUES (?, ?, ?, ?, ?)
    `)
    .bind(
      consumable.name,
      consumable.description || null,
      consumable.effect || null,
      consumable.duration || null,
      consumable.sell_price
    )
    .run();
}
console.log('Consumable types seeded successfully.');


// Seed crafting recipes (new)
for (const recipe of craftingRecipes) {
  await db
    .prepare(`
      INSERT OR IGNORE INTO craftingRecipes (name, requiredMaterials, outputType, outputTypeId)
      VALUES (?, ?, ?, ?)
    `)
    .bind(
      recipe.name,
      recipe.requiredMaterials,      // already stringified
      recipe.outputType,
      recipe.outputTypeId
    )
    .run();
}
console.log('Crafting recipes seeded successfully.');

    // Seed quests
    for (const quest of quests) {
      const zoneId = quest.zone ? await getZoneId(db, quest.zone) : null;

      await db
        .prepare(`
          INSERT OR IGNORE INTO questTemplates
            (key, description, type, target, rarity_exact, rarity_min, requires_modified, requires_no_bait, requires_no_rod, requires_no_hook, time_of_day, zone_id, weather, reward_xp, reward_gold)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          quest.key,
          quest.description,
          quest.type,
          quest.target,
          quest.rarity_exact ?? null,
          quest.rarity_min ?? null,
          quest.requires_modified ? 1 : 0,
          quest.requires_no_bait ? 1 : 0,
          quest.requires_no_rod ? 1 : 0,
          quest.requires_no_hook ? 1 : 0,
          quest.time_of_day ?? null,
          zoneId,
          quest.weather ?? null,
          quest.reward.xp,
          quest.reward.gold
        )
        .run();
    }
    console.log('Quest templates seeded successfully.');

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// POST /seed route
seedRouter.post('/seed', async (c) => {
  const db = c.env.DB;
  try {
    await seedDatabase(db);
    return c.json({ message: 'Database seeded successfully.' });
  } catch (err) {
    console.error('Error during seeding:', err);
    if (err instanceof Error) {
      return c.json({ error: 'Seeding failed', details: err.message }, 500);
    }
    return c.json({ error: 'Seeding failed', details: String(err) }, 500);
  }
});

export default seedRouter;