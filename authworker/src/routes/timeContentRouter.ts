import { Hono } from 'hono';
import { requireUser } from '../services/authHelperService';
import {
  getWorldState,
  getCatchOfTheDay,
  assignCatchOfTheDayToUser,
  getCycleStartTimestamp,
} from '../services/timeContentService';
import type { D1Database } from '@cloudflare/workers-types';
import { updateQuestProgress, getAllQuests, getQuestKeys } from '../services/questService';

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

  await assignCatchOfTheDayToUser(db, user.id);

  const questKeys = getQuestKeys();
  const allQuests = await getAllQuests(db);
  const world = getWorldState();
  const cycleStartTimestamp = getCycleStartTimestamp();

  const playerContext = {
    timeOfDay: world.phase,
    zone: 'unknown',
    weather: world.isRaining ? 'Rainy' : 'Sunny',
    hasBait: true,
    hasRod: true,
    hasHook: true,
  };

  await updateQuestProgress(db, user.id, [], allQuests, questKeys, playerContext);

  const questsQuery = `
    SELECT
      uq.quest_key AS key,
      qt.description,
      qt.type,
      qt.target,
      qt.reward_xp AS reward_xp,
      qt.reward_gold AS reward_gold,
      qt.rarity_min,
      qt.rarity_exact,
      qt.requires_modified,
      qt.requires_no_bait,
      qt.requires_no_rod,
      qt.requires_no_hook,
      qt.time_of_day,
      qt.zone_id,
      qt.weather,
      uq.progress,
      uq.completed
    FROM user_quests uq
    JOIN questTemplates qt ON uq.quest_template_id = qt.id
    WHERE uq.user_id = ?
    ORDER BY
      CASE qt.type
        WHEN 'daily' THEN 1
        WHEN 'weekly' THEN 2
        WHEN 'monthly' THEN 3
        ELSE 4
      END,
      uq.updated_at DESC
    LIMIT 9
  `;

  const questRows = await db.prepare(questsQuery).bind(user.id).all();

  const weather = world.isRaining ? 'Rainy' : 'Sunny';
  const rainTimeRemaining =
    world.rainStartMin !== null ? Math.max(0, world.rainStartMin + 45 - world.cycleMin) : 0;

  const fishTypes = await db
    .prepare('SELECT species, rarity FROM fishTypes')
    .all<{ species: string; rarity: string }>();
  const rawFishTypes = fishTypes?.results ?? [];
  const catchOfTheDay = getCatchOfTheDay(rawFishTypes);

  const userFishSales = await db
    .prepare('SELECT species, sell_amount FROM user_fish_sales WHERE user_id = ?')
    .bind(user.id)
    .all<{ species: string; sell_amount: number }>();

  const sellAmountsMap = new Map<string, number>();
  (userFishSales.results ?? []).forEach(({ species, sell_amount }) => {
    sellAmountsMap.set(species, sell_amount);
  });

  const catchOfTheDayWithSell = catchOfTheDay.fishes.map((fish) => ({
    ...fish,
    sellAmount: sellAmountsMap.get(fish.species) || 0,
  }));

  return c.json({
    quests: questRows.results.map((quest) => ({
      ...quest,
      reward_xp: quest.reward_xp || 0,
      reward_gold: quest.reward_gold || 0,
    })),
    weather,
    rainTimeRemaining,
    catchOfTheDay: catchOfTheDayWithSell,
    worldState: world,
    cycleStartTimestamp,
  });
});

export default timeContentRouter;