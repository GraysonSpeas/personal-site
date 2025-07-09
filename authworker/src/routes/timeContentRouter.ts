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

  // Prepare a map of keys for joining on quest_key
  // We'll fetch quests of all types and left join user_quests for each period key accordingly
  // For this, use UNION ALL for daily, weekly, monthly separately, then combine

  const questsQuery = `
    SELECT
      qt.key,
      qt.description,
      qt.type,
      qt.target,
      qt.rarity_min,
      qt.rarity_exact,
      qt.requires_modified,
      qt.requires_no_bait,
      qt.requires_no_rod,
      qt.requires_no_hook,
      qt.time_of_day,
      qt.zone_id,
      qt.weather,
      COALESCE(uq.progress, 0) AS progress,
      COALESCE(uq.completed, 0) AS completed
    FROM questTemplates qt
    LEFT JOIN user_quests uq ON uq.user_id = ? AND uq.quest_key = (qt.key || '_' || 
      CASE
        WHEN qt.type = 'daily' THEN ?
        WHEN qt.type = 'weekly' THEN ?
        WHEN qt.type = 'monthly' THEN ?
        ELSE ''
      END
    )
    WHERE qt.type IN ('daily', 'weekly', 'monthly')
  `;

  const questRows = await db
    .prepare(questsQuery)
    .bind(user.id, questKeys.daily, questKeys.weekly, questKeys.monthly)
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
    worldState: world,
  });
});

export default timeContentRouter;