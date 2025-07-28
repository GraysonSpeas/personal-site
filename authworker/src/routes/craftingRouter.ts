// src/routes/craftingRouter.ts
import { Hono } from 'hono';
import { craftItem } from '../services/craftingService';

interface Bindings {
  DB: D1Database;
}

const craftingRouter = new Hono<{ Bindings: Bindings }>();

craftingRouter.post('/craft', async (c) => {
  return craftItem(c);
});

craftingRouter.get('/recipes', async (c) => {
  const db = c.env.DB as D1Database;
  try {
    const recipes = await db.prepare('SELECT id, name, requiredMaterials, outputType, outputTypeId FROM craftingRecipes').all();
    return c.json({ recipes: recipes.results || [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch recipes' }, 500);
  }
});

export default craftingRouter;