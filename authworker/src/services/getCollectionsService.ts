// src/services/getCollectionsService.ts
import type { Context } from 'hono';
import { getCookie } from 'hono/cookie';

type CollectionTemplate = {
  key: string;
  species: string[];
  reward_gold: number;
  reward_xp: number;
};

type AchievementTemplate = {
  key: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  thresholds: number[];
  reward_gold: number[];
  reward_xp: number[];
};

type BiggestFish = {
  species: string;
  rarity: string;
  max_weight?: number;
  max_length?: number;
  caught_at?: string;
};

type CollectionRow = {
  collection_key: string;
  progress: number;
  completed: number;
  claimed: number;
  completed_at?: string | null;
};

type AchievementRow = {
  achievement_key: string;
  progress: number;
  completed: number;
  claimed_stages: string;
  completed_at?: string | null;
};

type RarityRow = {
  rarity: string;
  total_caught: number;
};

const collectionTemplates: CollectionTemplate[] = [
  // Jungle
  { key: 'jungle_common', species: ['jungle_common_day_fish','jungle_common_night_fish','jungle_common_rain_fish'], reward_gold: 100, reward_xp: 50 },
  { key: 'jungle_uncommon', species: ['jungle_uncommon_day_fish','jungle_uncommon_night_fish','jungle_uncommon_rain_fish'], reward_gold: 150, reward_xp: 75 },
  { key: 'jungle_rare', species: ['jungle_rare_day_fish','jungle_rare_night_fish','jungle_rare_rain_fish'], reward_gold: 200, reward_xp: 100 },
  { key: 'jungle_epic', species: ['jungle_epic_day_fish','jungle_epic_night_fish','jungle_epic_rain_fish'], reward_gold: 250, reward_xp: 125 },
  { key: 'jungle_legendary', species: ['jungle_legendary_day_fish','jungle_legendary_night_fish','jungle_legendary_rain_fish'], reward_gold: 300, reward_xp: 150 },
  { key: 'jungle_mythic', species: ['jungle_mythic_day_fish','jungle_mythic_night_fish','jungle_mythic_rain_fish'], reward_gold: 350, reward_xp: 175 },
  // Ocean
  { key: 'ocean_common', species: ['ocean_common_fish'], reward_gold: 100, reward_xp: 50 },
  { key: 'ocean_uncommon', species: ['ocean_uncommon_fish'], reward_gold: 150, reward_xp: 75 },
  { key: 'ocean_rare', species: ['ocean_rare_fish'], reward_gold: 200, reward_xp: 100 },
  { key: 'ocean_epic', species: ['ocean_epic_fish'], reward_gold: 250, reward_xp: 125 },
  { key: 'ocean_legendary', species: ['ocean_legendary_fish'], reward_gold: 300, reward_xp: 150 },
  { key: 'ocean_mythic', species: ['ocean_mythic_fish'], reward_gold: 350, reward_xp: 175 },
  // River
  { key: 'river_common', species: ['river_common_fish'], reward_gold: 100, reward_xp: 50 },
  { key: 'river_uncommon', species: ['river_uncommon_fish'], reward_gold: 150, reward_xp: 75 },
  { key: 'river_rare', species: ['river_rare_fish'], reward_gold: 200, reward_xp: 100 },
  { key: 'river_epic', species: ['river_epic_fish'], reward_gold: 250, reward_xp: 125 },
  { key: 'river_legendary', species: ['river_legendary_fish'], reward_gold: 300, reward_xp: 150 },
  { key: 'river_mythic', species: ['river_mythic_fish'], reward_gold: 350, reward_xp: 175 },
  // Lava
  { key: 'lava_common', species: ['lava_common_fish'], reward_gold: 100, reward_xp: 50 },
  { key: 'lava_uncommon', species: ['lava_uncommon_fish'], reward_gold: 150, reward_xp: 75 },
  { key: 'lava_rare', species: ['lava_rare_fish'], reward_gold: 200, reward_xp: 100 },
  { key: 'lava_epic', species: ['lava_epic_fish'], reward_gold: 250, reward_xp: 125 },
  { key: 'lava_legendary', species: ['lava_legendary_fish'], reward_gold: 300, reward_xp: 150 },
  { key: 'lava_mythic', species: ['lava_mythic_fish'], reward_gold: 350, reward_xp: 175 },
  // Tidal
  { key: 'tidal_common', species: ['tidal_common_fish'], reward_gold: 100, reward_xp: 50 },
];

const achievementTemplates: AchievementTemplate[] = [
  { key: 'common_fish_collector', rarity: 'common', thresholds: [5, 15, 35], reward_gold: [50, 100, 200], reward_xp: [25, 50, 100] },
  { key: 'uncommon_fish_collector', rarity: 'uncommon', thresholds: [5, 15, 35], reward_gold: [75, 150, 300], reward_xp: [35, 70, 140] },
  { key: 'rare_fish_collector', rarity: 'rare', thresholds: [5, 15, 35], reward_gold: [100, 200, 400], reward_xp: [50, 100, 200] },
  { key: 'epic_fish_collector', rarity: 'epic', thresholds: [5, 15, 35], reward_gold: [150, 300, 600], reward_xp: [75, 150, 300] },
  { key: 'legendary_fish_collector', rarity: 'legendary', thresholds: [5, 15, 35], reward_gold: [200, 400, 800], reward_xp: [100, 200, 400] },
  { key: 'mythic_fish_collector', rarity: 'mythic', thresholds: [5, 15, 35], reward_gold: [250, 500, 1000], reward_xp: [125, 250, 500] },
];

export async function getCollectionsService(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return { error: 'Unauthorized' };
  let email: string;
  try { email = atob(session); } catch { return { error: 'Invalid session' }; }

  const db = c.env.DB as any;

  const userRowRaw = await db.prepare('SELECT id, xp, level FROM users WHERE email = ?').bind(email).first();
  const userRow = userRowRaw as { id: number; xp: number; level: number } | null;
  if (!userRow) return { error: 'User not found' };
  const userId = userRow.id;

  // preload everything in parallel
  const [fishRowsRaw, collectionRowsRaw, achRowsRaw, rarityRowsRaw] = await Promise.all([
    db.prepare('SELECT species, rarity, max_weight, max_length, caught_at FROM biggest_fish WHERE user_id = ?').bind(userId).all(),
    db.prepare('SELECT * FROM collections WHERE user_id = ?').bind(userId).all(),
    db.prepare('SELECT * FROM achievements WHERE user_id = ?').bind(userId).all(),
    db.prepare('SELECT * FROM user_rarity_progress WHERE user_id = ?').bind(userId).all(),
  ]);

  const biggestFish = (fishRowsRaw?.results ?? []) as BiggestFish[];
  const collectionsRows = (collectionRowsRaw?.results ?? []) as CollectionRow[];
  const achievementsRows = (achRowsRaw?.results ?? []) as AchievementRow[];
  const rarityRows = (rarityRowsRaw?.results ?? []) as RarityRow[];

  const speciesCaught = new Set(biggestFish.map(f => f.species));
  const collectionsMap = new Map(collectionsRows.map(r => [r.collection_key, r] as const));
  const achievementsMap = new Map(achievementsRows.map(r => [r.achievement_key, r] as const));
  const rarityMap = new Map(rarityRows.map(r => [r.rarity, r.total_caught] as const));

  const writes: any[] = [];
  const collections: any[] = [];

  for (const col of collectionTemplates) {
    const caughtCount = col.species.filter(s => speciesCaught.has(s)).length;
    const completed = caughtCount >= col.species.length ? 1 : 0;

    const existing = collectionsMap.get(col.key) as CollectionRow | undefined;

    if (!existing || existing.progress !== caughtCount || existing.completed !== completed) {
      // upsert with correct binds order
      writes.push(
        db.prepare(`
          INSERT INTO collections (user_id, collection_key, progress, completed, claimed, completed_at)
          VALUES (?, ?, ?, ?, COALESCE((SELECT claimed FROM collections WHERE user_id=? AND collection_key=?), 0),
                  CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END)
          ON CONFLICT(user_id, collection_key)
          DO UPDATE SET
            progress = excluded.progress,
            completed = excluded.completed,
            completed_at = CASE WHEN excluded.completed = 1 THEN excluded.completed_at ELSE collections.completed_at END
        `).bind(userId, col.key, caughtCount, completed, userId, col.key, completed)
      );
    }

    collections.push({
      key: col.key,
      species: col.species,
      total: col.species.length,
      caught: caughtCount,
      completed,
      claimed: existing?.claimed ?? 0,
      completed_at: existing?.completed_at ?? null,
      reward_gold: col.reward_gold,
      reward_xp: col.reward_xp,
      claimable: completed === 1 && !(existing?.claimed ?? 0),
      biggestFish: col.species.map(s => {
        const fish = biggestFish.find(f => f.species === s);
        return fish ? { ...fish, caught: true } : { species: s, rarity: 'none', max_weight: 0, max_length: 0, caught_at: '', caught: false };
      }),
    });
  }

  const achievements: any[] = [];
  for (const template of achievementTemplates) {
    const count = rarityMap.get(template.rarity) ?? 0;
    const achRow = achievementsMap.get(template.key) as AchievementRow | undefined;
    let claimedStages: number[] = [];
    try { claimedStages = achRow ? JSON.parse(achRow.claimed_stages || '[]') : []; } catch { claimedStages = []; }

    const newProgress = count;
    const claimable: { stage: number; reward_gold: number; reward_xp: number }[] = [];
    for (let i = 0; i < template.thresholds.length; i++) {
      const t = template.thresholds[i];
      if (newProgress >= t && !claimedStages.includes(t)) {
        claimable.push({ stage: t, reward_gold: template.reward_gold[i], reward_xp: template.reward_xp[i] });
      }
    }

    const completedStage = template.thresholds.filter(t => newProgress >= t).slice(-1)[0] || 0;
    if (!achRow || achRow.progress !== newProgress || achRow.completed !== completedStage) {
      writes.push(
        db.prepare(`
          INSERT INTO achievements (user_id, achievement_key, progress, completed, claimed_stages, completed_at)
          VALUES (?, ?, ?, ?, COALESCE((SELECT claimed_stages FROM achievements WHERE user_id=? AND achievement_key=?), "[]"), CASE WHEN ? > 0 THEN datetime('now') ELSE NULL END)
          ON CONFLICT(user_id, achievement_key)
          DO UPDATE SET
            progress = excluded.progress,
            completed = excluded.completed,
            completed_at = CASE WHEN excluded.completed > 0 THEN excluded.completed_at ELSE achievements.completed_at END
        `).bind(userId, template.key, newProgress, completedStage, userId, template.key, completedStage)
      );
    }

    const nextThresholdIndex = template.thresholds.findIndex(t => t > newProgress);
    const nextThreshold = nextThresholdIndex !== -1 ? template.thresholds[nextThresholdIndex] : 0;

    achievements.push({
      key: template.key,
      rarity: template.rarity,
      thresholds: template.thresholds,
      progress: newProgress,
      completed: completedStage,
      claimable_stages: claimable,
      reward_gold: template.reward_gold,
      reward_xp: template.reward_xp,
      next_threshold: nextThreshold,
      next_reward_gold: nextThreshold ? template.reward_gold[nextThresholdIndex] : 0,
      next_reward_xp: nextThreshold ? template.reward_xp[nextThresholdIndex] : 0,
    });
  }

  if (writes.length) {
    await db.batch(writes);
  }

  return { collections, achievements };
}

export async function claimRewardService(
  c: Context<{ Bindings: { DB: any } }>,
  body: { type: 'collection' | 'achievement'; key: string; stage?: number }
) {
  const session = getCookie(c, 'session');
  if (!session) return { error: 'Unauthorized' };
  let email: string;
  try { email = atob(session); } catch { return { error: 'Invalid session' }; }

  const db = c.env.DB as any;
  const userRowRaw = await db.prepare('SELECT id, xp, level FROM users WHERE email = ?').bind(email).first();
  const userRow = userRowRaw as { id: number; xp: number; level: number } | null;
  if (!userRow) return { error: 'User not found' };
  const userId = userRow.id;

  // deferred level recalculation
  const recalcLevel = async () => {
    const uRaw = await db.prepare('SELECT xp, level FROM users WHERE id = ?').bind(userId).first();
    const user = uRaw as { xp: number; level: number } | null;
    if (!user) return;
    const xpToLevel = (n: number) => Math.round(10 * Math.pow(1.056, n - 1));
    let lvl = user.level;
    let cumulative = 0;
    while (true) {
      cumulative += xpToLevel(lvl);
      if (user.xp < cumulative) break;
      lvl++;
      if (lvl > 10000) break;
    }
    if (lvl > user.level) {
      await db.prepare('UPDATE users SET level = ? WHERE id = ?').bind(lvl, userId).run();
    }
  };

  if (body.type === 'collection') {
    const rowRaw = await db.prepare('SELECT completed, claimed FROM collections WHERE user_id = ? AND collection_key = ?').bind(userId, body.key).first();
    const row = rowRaw as { completed: number; claimed: number } | null;
    if (!row) return { error: 'Collection not found' };
    if (!row.completed) return { error: 'Not completed yet' };
    if (row.claimed) return { error: 'Already claimed' };

    const template = collectionTemplates.find(t => t.key === body.key);
    if (!template) return { error: 'Template not found' };

    await db.batch([
      db.prepare('UPDATE collections SET claimed = 1 WHERE user_id = ? AND collection_key = ?').bind(userId, body.key),
      db.prepare('INSERT INTO currencies(user_id, gold) VALUES(?, 0) ON CONFLICT(user_id) DO NOTHING').bind(userId),
      db.prepare('UPDATE currencies SET gold = gold + ? WHERE user_id = ?').bind(template.reward_gold, userId),
      db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').bind(template.reward_xp, userId),
    ]);

    try { c.executionCtx.waitUntil(recalcLevel()); } catch {}

    return { success: true, type: 'collection', key: body.key, reward_gold: template.reward_gold, reward_xp: template.reward_xp };
  }

  if (body.type === 'achievement') {
    if (!body.stage) return { error: 'Stage required' };

    const rowRaw = await db.prepare('SELECT claimed_stages, progress FROM achievements WHERE user_id = ? AND achievement_key = ?').bind(userId, body.key).first();
    const row = rowRaw as { claimed_stages: string; progress: number } | null;
    if (!row) return { error: 'Achievement not found' };

    let claimedStages: number[] = [];
    try { claimedStages = row.claimed_stages ? JSON.parse(row.claimed_stages) : []; } catch { claimedStages = []; }
    if (claimedStages.includes(body.stage)) return { error: 'Stage already claimed' };
    if ((row.progress || 0) < body.stage) return { error: 'Not enough progress yet' };

    const template = achievementTemplates.find(t => t.key === body.key);
    if (!template) return { error: 'Template not found' };

    const stageIndex = template.thresholds.indexOf(body.stage);
    if (stageIndex === -1) return { error: 'Invalid stage' };

    const rewardGold = template.reward_gold[stageIndex];
    const rewardXp = template.reward_xp[stageIndex];

    claimedStages.push(body.stage);

    await db.batch([
      db.prepare('UPDATE achievements SET claimed_stages = ? WHERE user_id = ? AND achievement_key = ?').bind(JSON.stringify(claimedStages), userId, body.key),
      db.prepare('INSERT INTO currencies(user_id, gold) VALUES(?, 0) ON CONFLICT(user_id) DO NOTHING').bind(userId),
      db.prepare('UPDATE currencies SET gold = gold + ? WHERE user_id = ?').bind(rewardGold, userId),
      db.prepare('UPDATE users SET xp = xp + ? WHERE id = ?').bind(rewardXp, userId),
    ]);

    try { c.executionCtx.waitUntil(recalcLevel()); } catch {}

    return { success: true, type: 'achievement', key: body.key, stage: body.stage, reward_gold: rewardGold, reward_xp: rewardXp };
  }

  return { error: 'Invalid type' };
}