// src/services/putFish.ts
export async function saveCaughtFish(userId: number, fish: any, db: D1Database) {
  const modifier = fish.modifier || null;
  const difficulty = fish.difficulty ?? 1;

  const existingFish = await db
    .prepare(
      `SELECT * FROM fish WHERE user_id = ? AND species = ? AND (modifier IS ? OR modifier = ?)`
    )
    .bind(userId, fish.species, modifier, modifier)
    .first();

  if (existingFish) {
    await db.prepare(`UPDATE fish SET quantity = quantity + 1 WHERE id = ?`).bind(existingFish.id).run();
  } else {
    await db
      .prepare(
        `INSERT INTO fish (user_id, species, rarity, weight, length, modifier, quantity, difficulty, caught_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, datetime('now'))`
      )
      .bind(userId, fish.species, fish.rarity, fish.weight, fish.length, modifier, difficulty)
      .run();
  }

  const biggest = (await db
    .prepare(`SELECT * FROM biggest_fish WHERE user_id = ? AND species = ?`)
    .bind(userId, fish.species)
    .first()) as { max_weight: number; max_length: number; id: string } | undefined;

  if (
    !biggest ||
    fish.weight > biggest.max_weight ||
    (fish.weight === biggest.max_weight && fish.length > biggest.max_length)
  ) {
    if (biggest) {
      await db
        .prepare(
          `UPDATE biggest_fish SET max_weight = ?, max_length = ?, modifier = ?, caught_at = datetime('now') WHERE id = ?`
        )
        .bind(fish.weight, fish.length, modifier, biggest.id)
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO biggest_fish (user_id, species, max_weight, max_length, modifier, caught_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))`
        )
        .bind(userId, fish.species, fish.weight, fish.length, modifier)
        .run();
    }
  }
}