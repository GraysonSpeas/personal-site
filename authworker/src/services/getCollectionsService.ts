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
  thresholds: number[]; // [5,10,20]
  reward_gold: number;
  reward_xp: number;
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
  { key: 'common_fish_collector', rarity: 'common', thresholds: [5, 10, 20], reward_gold: 50, reward_xp: 25 },
  { key: 'uncommon_fish_collector', rarity: 'uncommon', thresholds: [5, 10, 20], reward_gold: 75, reward_xp: 35 },
  { key: 'rare_fish_collector', rarity: 'rare', thresholds: [5, 10, 20], reward_gold: 100, reward_xp: 50 },
  { key: 'epic_fish_collector', rarity: 'epic', thresholds: [5, 10, 20], reward_gold: 150, reward_xp: 75 },
  { key: 'legendary_fish_collector', rarity: 'legendary', thresholds: [5, 10, 20], reward_gold: 200, reward_xp: 100 },
  { key: 'mythic_fish_collector', rarity: 'mythic', thresholds: [5, 10, 20], reward_gold: 250, reward_xp: 125 },
];

export async function getCollectionsService(c: Context<{ Bindings: any }>) {
  const session = getCookie(c, 'session');
  if (!session) return { error: 'Unauthorized' };

  let email: string;
  try { email = atob(session); } catch { return { error: 'Invalid session' }; }

  const db = c.env.DB;

  // Get user
  const userRow = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  const user = userRow as { id: number } | null;
  if (!user) return { error: 'User not found' };
  const userId = user.id;

  // Biggest fish
  const fishRows = await db.prepare(`SELECT species, rarity FROM biggest_fish WHERE user_id = ?`).bind(userId).all();
  const biggestFish = (fishRows as any).results as { species: string; rarity: string }[];
  const speciesCaught = new Set(biggestFish.map(f => f.species));

  // --- Collections ---
  const collections: any[] = [];
  for (const col of collectionTemplates) {
    const caughtCount = col.species.filter(s => speciesCaught.has(s)).length;
    const completed = caughtCount >= col.species.length ? 1 : 0;

    // Get or create collection row
let colRow = await db
  .prepare(`SELECT * FROM collections WHERE user_id = ? AND collection_key = ?`)
  .bind(userId, col.key)
  .first();

colRow = colRow as { progress: number; completed: number; claimed: number } | null;
    if (!colRow) {
      await db.prepare(`INSERT INTO collections (user_id, collection_key, progress, completed, claimed) VALUES (?, ?, 0, 0, 0)`)
        .bind(userId, col.key).run();
      colRow = { progress: 0, completed: 0, claimed: 0 };
    }

    // Update progress/completed
    if (colRow.progress !== caughtCount || colRow.completed !== completed) {
      await db.prepare(`UPDATE collections SET progress = ?, completed = ? WHERE user_id = ? AND collection_key = ?`)
        .bind(caughtCount, completed, userId, col.key).run();
    }

collections.push({
  key: col.key,
  species: col.species,
  total: col.species.length,
  caught: caughtCount,
  completed,
  claimed: colRow.claimed,
  reward_gold: col.reward_gold,
  reward_xp: col.reward_xp,
  claimable: completed && !colRow.claimed ? true : false,
});
  }

  // --- Achievements ---
  const achievements: any[] = [];
  for (const template of achievementTemplates) {
    const count = biggestFish.filter(f => f.rarity === template.rarity).length;

    // Get or create achievement record
let achRow = await db
  .prepare(`SELECT * FROM achievements WHERE user_id = ? AND achievement_key = ?`)
  .bind(userId, template.key)
  .first();

achRow = achRow as { id: number; progress: number; completed: number; claimed_stages: string } | null;
    
    if (!achRow) {
      await db.prepare(`INSERT INTO achievements (user_id, achievement_key, progress, completed, claimed_stages) VALUES (?, ?, 0, 0, '[]')`)
        .bind(userId, template.key).run();
      achRow = { id: 0, progress: 0, completed: 0, claimed_stages: '[]' };
    }

    // Parse claimed stages
    let claimedStages: number[] = [];
    try { claimedStages = JSON.parse(achRow.claimed_stages); } catch {}

    let newProgress = count;
    let completedStage = 0;
    const claimable: number[] = [];
    let rewardGold = 0;
    let rewardXP = 0;

    for (const threshold of template.thresholds) {
      if (newProgress >= threshold) {
        completedStage = threshold;
        if (!claimedStages.includes(threshold)) {
          claimable.push(threshold);
          rewardGold += template.reward_gold;
          rewardXP += template.reward_xp;
        }
      }
    }

    // Update progress/completed
    if (achRow.progress !== newProgress || achRow.completed !== completedStage) {
      await db.prepare(`UPDATE achievements
        SET progress = ?, completed = ?, completed_at = CASE WHEN ? > 0 THEN datetime('now') ELSE NULL END
        WHERE user_id = ? AND achievement_key = ?`)
        .bind(newProgress, completedStage, completedStage, userId, template.key).run();
    }

    achievements.push({
      key: template.key,
      rarity: template.rarity,
      thresholds: template.thresholds,
      progress: newProgress,
      completed: completedStage,
      claimable_stages: claimable,
      reward_gold: rewardGold,
      reward_xp: rewardXP,
    });
  }

  return { collections, achievements };
}