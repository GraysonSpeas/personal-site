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
    // Save fish as before
    const modifier = item.modifier || null;
    const difficulty = item.difficulty ?? 1;

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
          `INSERT INTO fish (user_id, species, rarity, weight, length, modifier, quantity, difficulty, caught_at)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?, datetime('now'))`
        )
        .bind(userId, item.species, item.rarity, item.weight, item.length, modifier, difficulty)
        .run();
    }

    const biggest = (await db
      .prepare(`SELECT * FROM biggest_fish WHERE user_id = ? AND species = ?`)
      .bind(userId, item.species)
      .first()) as { max_weight: number; max_length: number; id: string } | undefined;

    if (
      !biggest ||
      item.weight > biggest.max_weight ||
      (item.weight === biggest.max_weight && item.length > biggest.max_length)
    ) {
      if (biggest) {
        await db
          .prepare(
            `UPDATE biggest_fish SET max_weight = ?, max_length = ?, modifier = ?, caught_at = datetime('now') WHERE id = ?`
          )
          .bind(item.weight, item.length, modifier, biggest.id)
          .run();
      } else {
        await db
          .prepare(
            `INSERT INTO biggest_fish (user_id, species, max_weight, max_length, modifier, caught_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`
          )
          .bind(userId, item.species, item.weight, item.length, modifier)
          .run();
      }
    }
  }
}