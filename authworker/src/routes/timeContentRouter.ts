// src/routes/timeContentRouter.ts
import { Hono } from 'hono';
import { requireUser } from '../services/authHelperService';
import { getWorldState, getCatchOfTheDay } from '../services/timeContentService';
import type { D1Database } from '@cloudflare/workers-types';
import { getQuestKeys } from '../services/questService';

interface Bindings {
  DB: D1Database;
}

const timeContentRouter = new Hono<{ Bindings: Bindings }>();

timeContentRouter.get('/', async (c) => {
  const db = c.env.DB;
  if (!db) return c.json({ error: 'Missing database' }, 500);

  const userEmail = await requireUser(c);
  if (!userEmail) return c.json({ error: 'Unauthorized' }, 401);

  const user = await db
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(userEmail)
    .first<{ id: number }>();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const questKeys = getQuestKeys();

  const questRows = await db
    .prepare(`
      SELECT qt.key, qt.description, qt.type, qt.target, qt.rarity_min, qt.rarity_exact, qt.requires_modified, 
             qt.requires_no_bait, qt.requires_no_rod, qt.requires_no_hook, qt.time_of_day, qt.zone_id, qt.weather,
             uq.progress, uq.completed
      FROM questTemplates qt
      LEFT JOIN user_quests uq ON uq.user_id = ? AND uq.quest_key = qt.key || '_' || ?
      WHERE qt.type IN ('daily', 'weekly', 'monthly')
    `)
    .bind(user.id, questKeys.daily)
    .all();

  const world = getWorldState();
  const weather = world.isRaining ? 'Rainy' : 'Sunny';

  const fishTypes = await db
    .prepare('SELECT species, rarity FROM fishTypes')
    .all<{ species: string; rarity: string }>();
  const rawFishTypes = fishTypes?.results ?? [];
  const catchOfTheDay = getCatchOfTheDay(rawFishTypes);

return c.json({
  quests: questRows.results,
  weather,
  catchOfTheDay: catchOfTheDay.fishes,
  worldState: world, // ← this line is missing
});

});

export default timeContentRouter;