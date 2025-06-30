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
} from './staticData';
import type { D1Database } from '@cloudflare/workers-types';

const seedRouter = new Hono<{ Bindings: { DB: D1Database } }>();

export async function seedDatabase(db: D1Database) {
  try {
    console.log('Starting database seeding...');

    // Seed zone types
    for (const zone of zoneTypes) {
      await db
        .prepare(`INSERT OR IGNORE INTO zoneTypes (name) VALUES (?)`)
        .bind(zone.name)
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

    // Seed resource types with all fields and zones
    for (const resource of resourceTypes) {
      const resourceResult = await db
        .prepare(`
          INSERT OR IGNORE INTO resourceTypes 
          (name, base_weight, base_length, stamina, tugStrength, changeRate, changeStrength, sell_price, rarity, barType)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          resource.barType
        )
        .run();

      if (resourceResult.success) {
        console.log(`Resource type '${resource.species}' seeded successfully.`);

        for (const zoneName of resource.zones) {
          const zoneResult = await db
            .prepare(`SELECT id FROM zoneTypes WHERE name = ?`)
            .bind(zoneName)
            .all();

          const zoneId = zoneResult.results?.[0]?.id;
          if (zoneId) {
            await db
              .prepare(`
                INSERT OR IGNORE INTO resourceTypeZones (resource_type_id, zone_id) VALUES (
                  (SELECT id FROM resourceTypes WHERE name = ?),
                  ?
                )
              `)
              .bind(resource.species, zoneId)
              .run();
            console.log(`Mapped resource '${resource.species}' to zone '${zoneName}'.`);
          } else {
            console.warn(`Zone '${zoneName}' not found for resource '${resource.species}'.`);
          }
        }
      }
    }
    console.log('Resource types seeded successfully.');

    // Seed fish types with all required fields and zones
    for (const fish of fishTypes) {
      const fishResult = await db
        .prepare(`
          INSERT OR IGNORE INTO fishTypes 
          (species, base_weight, base_length, stamina, tugStrength, changeRate, changeStrength, sell_price, rarity, barType) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          fish.barType ?? 'middle'
        )
        .run();

      if (fishResult.success) {
        console.log(`Fish type '${fish.species}' seeded successfully.`);

        for (const zoneName of fish.zones) {
          const zoneResult = await db
            .prepare(`SELECT id FROM zoneTypes WHERE name = ?`)
            .bind(zoneName)
            .all();

          const zoneId = zoneResult.results?.[0]?.id;
          if (zoneId) {
            await db
              .prepare(`
                INSERT OR IGNORE INTO fishTypeZones (fish_type_id, zone_id) VALUES (
                  (SELECT id FROM fishTypes WHERE species = ?),
                  ?
                )
              `)
              .bind(fish.species, zoneId)
              .run();
            console.log(`Mapped fish '${fish.species}' to zone '${zoneName}'.`);
          } else {
            console.warn(`Zone '${zoneName}' not found for fish '${fish.species}'.`);
          }
        }
      }
    }
    console.log('Fish types seeded successfully.');

    // Seed rods
    for (const rod of rodTypes) {
      await db.prepare(`
        INSERT OR IGNORE INTO gear (gear_type, gear_name, stats)
        VALUES (?, ?, ?)
      `).bind(
        'rod',
        rod.name,
        JSON.stringify(rod.stats)
      ).run();
    }
    console.log('Rod types seeded successfully.');

    // Seed hooks
    for (const hook of hookTypes) {
      await db.prepare(`
        INSERT OR IGNORE INTO gear (gear_type, gear_name, stats)
        VALUES (?, ?, ?)
      `).bind(
        'hook',
        hook.name,
        JSON.stringify(hook.stats)
      ).run();
    }
    console.log('Hook types seeded successfully.');

    // Seed baits with full fields
    for (const bait of baitTypes) {
      await db.prepare(`
        INSERT OR IGNORE INTO bait 
        (bait_name, stats, sell_price, quantity)
        VALUES (?, ?, ?, ?)
      `).bind(
        bait.name,
        JSON.stringify(bait.stats),
        bait.sell_price,
        0
      ).run();
    }
    console.log('Bait types seeded successfully.');

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