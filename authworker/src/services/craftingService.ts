import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

export async function craftItem(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  let email: string;
  try {
    email = atob(session);
  } catch {
    return c.json({ error: 'Invalid session' }, 401);
  }

  const db = c.env.DB as D1Database;
  const user = await db
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: number }>();
  if (!user) return c.json({ error: 'User not found' }, 404);
  const userId = user.id;

  const { recipeId } = await c.req.json();
  if (!recipeId) return c.json({ error: 'Missing recipeId' }, 400);

  const recipe = await db
    .prepare('SELECT * FROM craftingRecipes WHERE id = ?')
    .bind(recipeId)
    .first<{
      id: number;
      name: string;
      requiredMaterials: string;
      outputType: string;
      outputTypeId: number | null;
    }>();
  if (!recipe) return c.json({ error: 'Invalid recipe' }, 400);

  if (!recipe.outputTypeId) {
    return c.json({ error: 'Recipe missing outputTypeId' }, 400);
  }

  const requiredMaterials = JSON.parse(recipe.requiredMaterials);

  // Check materials
  for (const mat of requiredMaterials) {
    if (mat.type === 'gold') {
      const goldRes = await db
        .prepare('SELECT gold FROM currencies WHERE user_id = ?')
        .bind(userId)
        .first<{ gold: number }>();
      if ((goldRes?.gold ?? 0) < mat.quantity) {
        return c.json({ error: 'Not enough gold' }, 400);
      }
    } else if (mat.type === 'fish') {
      const fishRes = await db
        .prepare('SELECT quantity FROM fish WHERE user_id = ? AND species = ?')
        .bind(userId, mat.species)
        .first<{ quantity: number }>();
      if ((fishRes?.quantity ?? 0) < mat.quantity) {
        return c.json({ error: `Not enough fish: ${mat.species}` }, 400);
      }
    } else if (mat.type === 'resource') {
      const resRes = await db
        .prepare('SELECT quantity FROM resources WHERE user_id = ? AND name = ?')
        .bind(userId, mat.name)
        .first<{ quantity: number }>();
      if ((resRes?.quantity ?? 0) < mat.quantity) {
        return c.json({ error: `Not enough resource: ${mat.name}` }, 400);
      }
    }
  }

  // Subtract materials
  for (const mat of requiredMaterials) {
    if (mat.type === 'gold') {
      await db
        .prepare('UPDATE currencies SET gold = gold - ? WHERE user_id = ?')
        .bind(mat.quantity, userId)
        .run();
    } else if (mat.type === 'fish') {
      await db
        .prepare('UPDATE fish SET quantity = quantity - ? WHERE user_id = ? AND species = ?')
        .bind(mat.quantity, userId, mat.species)
        .run();
      await db
        .prepare('DELETE FROM fish WHERE user_id = ? AND species = ? AND quantity <= 0')
        .bind(userId, mat.species)
        .run();
    } else if (mat.type === 'resource') {
      await db
        .prepare('UPDATE resources SET quantity = quantity - ? WHERE user_id = ? AND name = ?')
        .bind(mat.quantity, userId, mat.name)
        .run();
      await db
        .prepare('DELETE FROM resources WHERE user_id = ? AND name = ? AND quantity <= 0')
        .bind(userId, mat.name)
        .run();
    }
  }

  // Add crafted item
if (recipe.outputType === 'rod' || recipe.outputType === 'hook') {
  // Prevent crafting if already owned
  const owned = await db
    .prepare('SELECT id FROM gear WHERE user_id = ? AND gear_type = ? AND type_id = ?')
    .bind(userId, recipe.outputType, recipe.outputTypeId)
    .first<{ id: number }>();

  if (owned) {
    return c.json({ error: `You already own this ${recipe.outputType}` }, 400);
  }

  // Fetch stats from rodTypes table
  const rodStats = await db
    .prepare('SELECT base_stats FROM rodTypes WHERE id = ?')
    .bind(recipe.outputTypeId)
    .first<{ base_stats: string }>();

  if (rodStats && rodStats.base_stats) {
    await db
      .prepare(
        `INSERT INTO gear (user_id, gear_type, type_id, stats) VALUES (?, ?, ?, ?)`
      )
      .bind(userId, recipe.outputType, recipe.outputTypeId, rodStats.base_stats)
      .run();
  } else {
    // fallback without stats if not found
    await db
      .prepare(
        `INSERT INTO gear (user_id, gear_type, type_id) VALUES (?, ?, ?)`
      )
      .bind(userId, recipe.outputType, recipe.outputTypeId)
      .run();
  }
} else if (recipe.outputType === 'bait') {
    const existing = await db
      .prepare('SELECT id FROM bait WHERE user_id = ? AND type_id = ?')
      .bind(userId, recipe.outputTypeId)
      .first<{ id: number }>();

    if (existing) {
      await db
        .prepare('UPDATE bait SET quantity = quantity + 1 WHERE id = ?')
        .bind(existing.id)
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO bait (user_id, type_id, quantity, sell_price) VALUES (?, ?, 1, 0)`
        )
        .bind(userId, recipe.outputTypeId)
        .run();
    }

  } else if (recipe.outputType === 'consumable') {
    const existing = await db
      .prepare('SELECT id FROM consumables WHERE user_id = ? AND type_id = ?')
      .bind(userId, recipe.outputTypeId)
      .first<{ id: number }>();

    if (existing) {
      await db
        .prepare('UPDATE consumables SET quantity = quantity + 1 WHERE id = ?')
        .bind(existing.id)
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO consumables (user_id, type_id, quantity) VALUES (?, ?, 1)`
        )
        .bind(userId, recipe.outputTypeId)
        .run();
    }

  } else {
    return c.json({ error: 'Unsupported output type' }, 400);
  }

  return c.json({ success: true, message: 'Item crafted' });
}