// src/services/putFish.ts
export async function saveCaughtFish(userId: number, item: any, db: D1Database) {
  if (item.isResource) {
    // Save resource (no weight/length)
    const existingResource = await db
      .prepare(`SELECT * FROM resources WHERE user_id = ? AND name = ?`)
      .bind(userId, item.species)
      .first();

    if (existingResource) {
      await db.prepare(`UPDATE resources SET quantity = quantity + 1 WHERE id = ?`).bind(existingResource.id).run();
    } else {
      await db
        .prepare(
          `INSERT INTO resources (user_id, name, rarity, quantity, caught_at)
           VALUES (?, ?, ?, 1, datetime('now'))`
        )
        .bind(userId, item.species, item.rarity)
        .run();
    }
  } else {
    const modifier = item.modifier || null;

    const existingFish = await db
      .prepare(
        `SELECT * FROM fish WHERE user_id = ? AND species = ? AND (modifier IS ? OR modifier = ?)`
      )
      .bind(userId, item.species, modifier, modifier)
      .first();

    if (existingFish) {
      await db.prepare(`UPDATE fish SET quantity = quantity + 1 WHERE id = ?`).bind(existingFish.id).run();
    } else {
      await db
        .prepare(
          `INSERT INTO fish (user_id, species, rarity, weight, length, modifier, quantity, caught_at)
           VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`
        )
        .bind(userId, item.species, item.rarity, item.weight, item.length, modifier)
        .run();
    }

    const biggest = (await db
      .prepare(`SELECT * FROM biggest_fish WHERE user_id = ? AND species = ?`)
      .bind(userId, item.species)
      .first()) as { max_weight: number; max_length: number; id: string; rarity?: string | null } | undefined;

    if (
      !biggest ||
      item.weight > biggest.max_weight ||
      (item.weight === biggest.max_weight && item.length > biggest.max_length)
    ) {
      if (biggest) {
        await db
          .prepare(
            `UPDATE biggest_fish SET max_weight = ?, max_length = ?, modifier = ?, rarity = ?, caught_at = datetime('now') WHERE id = ?`
          )
          .bind(item.weight, item.length, modifier, item.rarity, biggest.id)
          .run();
      } else {
        await db
          .prepare(
            `INSERT INTO biggest_fish (user_id, species, rarity, max_weight, max_length, modifier, caught_at)
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
          )
          .bind(userId, item.species, item.rarity, item.weight, item.length, modifier)
          .run();
      }
    }
  }
// --- XP gain and level up ---
const rarityXP: Record<'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic', number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 10,
  legendary: 50,
  mythic: 200,
};

const rarityKey = (String(item.rarity).toLowerCase() as keyof typeof rarityXP);
const fishXP: number = rarityXP[rarityKey] ?? 0;

const user = await db
  .prepare(`SELECT xp, level, current_zone_id FROM users WHERE id = ?`)
  .bind(userId)
  .first<{ xp: number; level: number; current_zone_id: number }>();

if (user) {
  const zone = await db
    .prepare(`SELECT xp_multiplier FROM zoneTypes WHERE id = ?`)
    .bind(user.current_zone_id)
    .first<{ xp_multiplier: number }>();

  const multiplier: number = typeof zone?.xp_multiplier === 'number' ? zone.xp_multiplier : 1.0;
  const gainedXP: number = Math.round(fishXP * multiplier);
  const newXP: number = user.xp + gainedXP;

  const xpToLevel = (n: number): number => Math.round(10 * Math.pow(1.056, n - 1));
  const totalXpToLevel = (n: number): number => {
    let total = 0;
    for (let i = 1; i < n; i++) total += xpToLevel(i);
    return total;
  };

  let newLevel: number = user.level;
  while (newXP >= totalXpToLevel(newLevel + 1)) newLevel++;

  await db
    .prepare(`UPDATE users SET xp = ?, level = ? WHERE id = ?`)
    .bind(newXP, newLevel, userId)
    .run();
}
}