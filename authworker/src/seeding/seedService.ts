// src/seeding/seedService.ts
import { Hono } from 'hono';
import { weatherTypes, zoneTypes, resourceTypes, fishTypes } from './staticData'; // Import all data
import type { D1Database } from '@cloudflare/workers-types';

const seedRouter = new Hono<{ Bindings: { DB: D1Database } }>();

// Database seeding logic
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

    // Seed resource types with rarity and zones
    for (const resource of resourceTypes) {
      // Insert resource type
      const resourceResult = await db
        .prepare(`INSERT OR IGNORE INTO resourceTypes (name, rarity) VALUES (?, ?)`)
        .bind(resource.name, resource.rarity)
        .run();

      if (resourceResult.success) {
        console.log(`Resource type '${resource.name}' seeded successfully.`);

        // Map resource to zones
        for (const zoneName of resource.zones) {
          const zoneResult = await db
            .prepare(`SELECT id FROM zoneTypes WHERE name = ?`)
            .bind(zoneName)
            .all();

          const zoneId = zoneResult.results?.[0]?.id;
          if (zoneId) {
            await db
              .prepare(
                `INSERT OR IGNORE INTO resourceTypeZones (resource_type_id, zone_id) VALUES (
                  (SELECT id FROM resourceTypes WHERE name = ?),
                  ?
                )`
              )
              .bind(resource.name, zoneId)
              .run();
            console.log(`Mapped resource '${resource.name}' to zone '${zoneName}'.`);
          } else {
            console.warn(`Zone '${zoneName}' not found for resource '${resource.name}'.`);
          }
        }
      }
    }
    console.log('Resource types seeded successfully.');

    // Seed fish types with rarity and zones
    for (const fish of fishTypes) {
      // Insert fish type
      const fishResult = await db
        .prepare(
          `INSERT OR IGNORE INTO fishTypes 
          (species, base_weight, base_length, stamina, tug_strength, direction_change_rate, sell_price, rarity) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          fish.species,
          fish.base_weight,
          fish.base_length,
          fish.stamina,
          fish.tug_strength,
          fish.direction_change_rate,
          fish.sell_price,
          fish.rarity
        )
        .run();

      if (fishResult.success) {
        console.log(`Fish type '${fish.species}' seeded successfully.`);

        // Map fish to zones
        for (const zoneName of fish.zones) {
          const zoneResult = await db
            .prepare(`SELECT id FROM zoneTypes WHERE name = ?`)
            .bind(zoneName)
            .all();

          const zoneId = zoneResult.results?.[0]?.id;
          if (zoneId) {
            await db
              .prepare(
                `INSERT OR IGNORE INTO fishTypeZones (fish_type_id, zone_id) VALUES (
                  (SELECT id FROM fishTypes WHERE species = ?),
                  ?
                )`
              )
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

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error; // Rethrow for error handling
  }
}

// POST /seed route for seeding database
seedRouter.post('/seed', async (c) => {
  const db = c.env.DB; // Access the D1Database binding
  try {
    await seedDatabase(db); // Call the seeding function
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