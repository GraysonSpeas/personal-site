/// <reference types="@cloudflare/workers-types" />

export interface Quest {
  key: string;
  description: string;
  target: number;
  condition?: ((fish: { rarity: string; modified?: boolean }) => boolean) | null;
  type: 'daily' | 'weekly' | 'monthly';
  reward: {
    xp: number;
    gold: number;
  };
  rarity_min?: string;
  rarity_exact?: string;
  requires_modified?: boolean;
  requires_no_bait?: boolean;
  requires_no_rod?: boolean;
  requires_no_hook?: boolean;
  time_of_day?: string | null;
  zone?: string | null;
  weather?: string | null;
}

export interface QuestKeys {
  daily: string;
  weekly: string;
  monthly: string;
}

interface PlayerContext {
  timeOfDay: string;
  zone: string;
  weather: string;
  hasBait: boolean;
  hasRod: boolean;
  hasHook: boolean;
}

const rarityOrder = ['common', 'rare', 'epic', 'legendary'];

function toCST(date: Date): Date {
  const cstString = date.toLocaleString('en-US', { timeZone: 'America/Chicago' });
  return new Date(cstString);
}

function startOfCSTDay(date: Date): Date {
  const cst = toCST(date);
  cst.setHours(0, 0, 0, 0);
  return new Date(cst.getTime() - (-5 * 60 * 60 * 1000));
}

function startOfWeekCST(date: Date): Date {
  const cst = toCST(date);
  const diff = cst.getDay();
  const start = new Date(cst);
  start.setDate(cst.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return new Date(start.getTime() - (-5 * 60 * 60 * 1000));
}

function startOfMonthCST(date: Date): Date {
  const cst = toCST(date);
  const start = new Date(cst.getFullYear(), cst.getMonth(), 1);
  return new Date(start.getTime() - (-5 * 60 * 60 * 1000));
}

export function getQuestKeys(now = Date.now()): QuestKeys {
  return {
    daily: startOfCSTDay(new Date(now)).toISOString().slice(0, 10),
    weekly: startOfWeekCST(new Date(now)).toISOString().slice(0, 10),
    monthly: startOfMonthCST(new Date(now)).toISOString().slice(0, 7),
  };
}

function meetsRarityMin(fishRarity: string, rarityMin: string): boolean {
  return rarityOrder.indexOf(fishRarity) >= rarityOrder.indexOf(rarityMin);
}

// New helper to fetch quests from questTemplates table
export async function getAllQuests(db: D1Database): Promise<Quest[]> {
  const rows = await db.prepare('SELECT * FROM questTemplates').all();
return rows.results.map(row => ({
  key: String(row.key),
  description: String(row.description),
  target: Number(row.target),
  condition: null,
  type: row.type as 'daily' | 'weekly' | 'monthly',
  reward: {
    xp: Number(row.reward_xp),
    gold: Number(row.reward_gold),
  },
  rarity_min: row.rarity_min ? String(row.rarity_min) : undefined,
  rarity_exact: row.rarity_exact ? String(row.rarity_exact) : undefined,
  requires_modified: Boolean(row.requires_modified),
  requires_no_bait: Boolean(row.requires_no_bait),
  requires_no_rod: Boolean(row.requires_no_rod),
  requires_no_hook: Boolean(row.requires_no_hook),
  time_of_day: row.time_of_day ? String(row.time_of_day) : null,
  zone: row.zone ? String(row.zone) : null,
  weather: row.weather ? String(row.weather) : null,
}));

}

export async function assignNewQuests(
  db: D1Database,
  userId: number,
  quests: Quest[],
  questKeys: QuestKeys
) {
  const types: ('daily' | 'weekly' | 'monthly')[] = ['daily', 'weekly', 'monthly'];

  for (const type of types) {
    const filtered = quests.filter(q => q.type === type);
    const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);

    for (const quest of selected) {
      const periodKey = questKeys[quest.type];
      const questUniqueKey = `${quest.key}_${periodKey}`;

      const exists = await db
        .prepare('SELECT 1 FROM user_quests WHERE user_id = ? AND quest_key = ?')
        .bind(userId, questUniqueKey)
        .first();

      if (!exists) {
        // get quest_template_id from questTemplates
        const template = await db
          .prepare('SELECT id FROM questTemplates WHERE key = ?')
          .bind(quest.key)
          .first();

        if (template?.id) {
          await db.prepare(`
            INSERT INTO user_quests (user_id, quest_template_id, quest_key, progress, completed, updated_at)
            VALUES (?, ?, ?, 0, 0, datetime('now'))
          `).bind(userId, template.id, questUniqueKey).run();
        }
      }
    }
  }
}


export async function updateQuestProgress(
  db: D1Database,
  userId: number,
  caughtFish: { rarity: string; modified?: boolean }[],
  quests: Quest[],
  questKeys: QuestKeys,
  context: PlayerContext
) {
  for (const quest of quests) {
    if (quest.requires_no_bait && context.hasBait) continue;
    if (quest.requires_no_rod && context.hasRod) continue;
    if (quest.requires_no_hook && context.hasHook) continue;

    if (quest.time_of_day && quest.time_of_day !== context.timeOfDay) continue;
    if (quest.zone && quest.zone !== context.zone) continue;
    if (quest.weather && quest.weather !== context.weather) continue;

    const periodKey = questKeys[quest.type];
    const questUniqueKey = `${quest.key}_${periodKey}`;

    const matchedCount = caughtFish.filter(fish => {
      if (quest.rarity_exact && fish.rarity !== quest.rarity_exact) return false;
      if (quest.rarity_min && !meetsRarityMin(fish.rarity, quest.rarity_min)) return false;
      if (quest.requires_modified && !fish.modified) return false;
      if (quest.condition && !quest.condition(fish)) return false;
      return true;
    }).length;

    if (matchedCount === 0) continue;

    const row = await db
      .prepare(`SELECT progress, completed FROM user_quests WHERE user_id = ? AND quest_key = ?`)
      .bind(userId, questUniqueKey)
      .first<{ progress: number; completed: number }>();

    const currentProgress = row?.progress ?? 0;
    const completed = row?.completed ?? 0;
    if (completed) continue;

    const newProgress = Math.min(currentProgress + matchedCount, quest.target);
    const isCompleted = newProgress >= quest.target;

    if (row) {
      await db.prepare(`
        UPDATE user_quests SET progress = ?, completed = ?, updated_at = datetime('now')
        WHERE user_id = ? AND quest_key = ?
      `).bind(newProgress, isCompleted ? 1 : 0, userId, questUniqueKey).run();
    } else {
      await db.prepare(`
        INSERT INTO user_quests (user_id, quest_key, progress, completed, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `).bind(userId, questUniqueKey, newProgress, isCompleted ? 1 : 0).run();
    }

    if (isCompleted) {
      await db.prepare(`
        UPDATE users SET xp = xp + ?, updated_at = datetime('now') WHERE id = ?
      `).bind(quest.reward.xp, userId).run();

      await db.prepare(`
        UPDATE currencies SET gold = gold + ? WHERE user_id = ?
      `).bind(quest.reward.gold, userId).run();
    }
  }
}