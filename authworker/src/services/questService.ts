/// <reference types="@cloudflare/workers-types" />

import type { D1Database } from '@cloudflare/workers-types';

export interface Quest {
  key: string;
  description: string;
  target: number;
  condition?: ((fish: { rarity: string; modified?: boolean }) => boolean) | null;
  type: 'daily' | 'weekly' | 'monthly';
  reward: { xp: number; gold: number };
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

function startOfDayCST(date: Date): Date {
  const cst = toCST(date);
  cst.setHours(0, 0, 0, 0);
  return cst;
}

function startOfWeekCST(date: Date): Date {
  const cst = toCST(date);
  const diff = cst.getDay();
  cst.setDate(cst.getDate() - diff);
  cst.setHours(0, 0, 0, 0);
  return cst;
}

function startOfMonthCST(date: Date): Date {
  const cst = toCST(date);
  cst.setDate(1);
  cst.setHours(0, 0, 0, 0);
  return cst;
}

function prevDayCST(date: Date): Date {
  const d = toCST(date);
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function prevWeekCST(date: Date): Date {
  // compute start of this week, then back up 7 days
  const cw = startOfWeekCST(date);
  cw.setDate(cw.getDate() - 7);
  return cw;
}

function prevMonthCST(date: Date): Date {
  const d = toCST(date);
  d.setMonth(d.getMonth() - 1);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getQuestKeys(now = Date.now()): QuestKeys {
  return {
    daily: startOfDayCST(new Date(now)).toISOString().slice(0, 10),
    weekly: startOfWeekCST(new Date(now)).toISOString().slice(0, 10),
    monthly: startOfMonthCST(new Date(now)).toISOString().slice(0, 7),
  };
}

export function getPrevQuestKeys(now = Date.now()): QuestKeys {
  return {
    daily: prevDayCST(new Date(now)).toISOString().slice(0, 10),
    weekly: prevWeekCST(new Date(now)).toISOString().slice(0, 10),
    monthly: prevMonthCST(new Date(now)).toISOString().slice(0, 7),
  };
}

function meetsRarityMin(fishRarity: string, rarityMin: string): boolean {
  return rarityOrder.indexOf(fishRarity) >= rarityOrder.indexOf(rarityMin);
}

export async function getAllQuests(db: D1Database): Promise<Quest[]> {
  const rows = await db.prepare(`
    SELECT qt.*, z.name AS zone_name
    FROM questTemplates qt
    LEFT JOIN zoneTypes z ON qt.zone_id = z.id
  `).all();

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
    zone: typeof row.zone_name === 'string' ? row.zone_name : null,
    weather: row.weather ? String(row.weather) : null,
  }));
}

async function cleanOldQuests(db: D1Database, userId: number, questKeys: QuestKeys) {
  const { daily, weekly, monthly } = questKeys;

  // remove old dailies & weeklies that aren’t in today’s/this week’s slots
  await db.prepare(`
    DELETE FROM user_quests
    WHERE user_id = ?
      AND (
        (quest_key LIKE 'daily_%'   AND quest_key NOT LIKE ?)
     OR (quest_key LIKE 'weekly_%'  AND quest_key NOT LIKE ?)
      )
  `).bind(userId, `%_${daily}`, `%_${weekly}`).run();

  // remove *all* monthlies for current YYYY‑MM so you start fresh
  await db.prepare(`
    DELETE FROM user_quests
    WHERE user_id = ?
      AND quest_key LIKE ?
  `).bind(userId, `%_${monthly}`).run();
}

export async function assignNewQuests(
  db: D1Database,
  userId: number,
  quests: Quest[],
  questKeys: QuestKeys
) {
  await cleanOldQuests(db, userId, questKeys);

  for (const type of ['daily', 'weekly', 'monthly'] as const) {
    const filtered = quests.filter(q => q.type === type);
    const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const quest of selected) {
      const periodKey = questKeys[type];
      const questUniqueKey = `${quest.key}_${periodKey}`;
      const exists = await db
        .prepare('SELECT 1 FROM user_quests WHERE user_id = ? AND quest_key = ?')
        .bind(userId, questUniqueKey)
        .first();
      if (!exists) {
        const tpl = await db
          .prepare('SELECT id FROM questTemplates WHERE key = ?')
          .bind(quest.key)
          .first<{ id: number }>();
        if (tpl?.id) {
          await db.prepare(`
            INSERT INTO user_quests
              (user_id, quest_template_id, quest_key, progress, completed, updated_at)
            VALUES (?, ?, ?, 0, 0, datetime('now'))
          `).bind(userId, tpl.id, questUniqueKey).run();
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
  // Load current user_quests
  const res = await db
    .prepare('SELECT quest_key FROM user_quests WHERE user_id = ?')
    .bind(userId)
    .all();
  const userQuestKeys = new Set(res.results.map(r => String(r.quest_key)));

  // If any from previous period remain, delete them & re-assign
for (const t of ['daily', 'weekly', 'monthly'] as const) {
  const currentKey = questKeys[t];
  const hasCurrent = [...userQuestKeys].some(k => k.endsWith(currentKey));
  if (!hasCurrent) {
    // Clean old quests for this period before assigning new
    const prevKey = getPrevQuestKeys()[t];
    await db
      .prepare(`DELETE FROM user_quests WHERE user_id = ? AND quest_key LIKE ?`)
      .bind(userId, `%_${prevKey}`)
      .run();

    await assignNewQuests(db, userId, quests, questKeys);

    // Refresh userQuestKeys
    const refreshed = await db
      .prepare('SELECT quest_key FROM user_quests WHERE user_id = ?')
      .bind(userId)
      .all();
    refreshed.results.forEach(r => userQuestKeys.add(String(r.quest_key)));

    break;
  }
}

  // Update progress/completion
  for (const quest of quests) {
    const key = `${quest.key}_${questKeys[quest.type]}`;
    if (!userQuestKeys.has(key)) continue;
    if (quest.requires_no_bait && context.hasBait) continue;
    if (quest.requires_no_rod && context.hasRod) continue;
    if (quest.requires_no_hook && context.hasHook) continue;
    if (quest.time_of_day && quest.time_of_day !== context.timeOfDay) continue;
    if (quest.zone && quest.zone !== context.zone) continue;
    if (quest.weather && quest.weather !== context.weather) continue;

    const matchCount = caughtFish.filter(f => {
      if (quest.rarity_exact && f.rarity !== quest.rarity_exact) return false;
      if (quest.rarity_min && !meetsRarityMin(f.rarity, quest.rarity_min!)) return false;
      if (quest.requires_modified && !f.modified) return false;
      if (quest.condition && !quest.condition(f)) return false;
      return true;
    }).length;
    if (matchCount === 0) continue;

    const row = await db
      .prepare('SELECT progress, completed FROM user_quests WHERE user_id = ? AND quest_key = ?')
      .bind(userId, key)
      .first<{ progress: number; completed: number }>();
    if (row?.completed) continue;

    const newProg = Math.min((row?.progress ?? 0) + matchCount, quest.target);
    const done = newProg >= quest.target;

    await db.prepare(`
      UPDATE user_quests
      SET progress = ?, completed = ?, updated_at = datetime('now')
      WHERE user_id = ? AND quest_key = ?
    `).bind(newProg, done ? 1 : 0, userId, key).run();

    if (done) {
      // grant rewards and handle leveling
      await db.prepare(`UPDATE users SET xp = xp + ? WHERE id = ?`)
        .bind(quest.reward.xp, userId).run();
      await db.prepare(`UPDATE currencies SET gold = gold + ? WHERE user_id = ?`)
        .bind(quest.reward.gold, userId).run();

      const user = await db.prepare('SELECT xp, level, current_zone_id FROM users WHERE id = ?')
        .bind(userId).first<{ xp: number; level: number; current_zone_id: number }>();
      if (user) {
        const z = await db.prepare('SELECT xp_multiplier FROM zoneTypes WHERE id = ?')
          .bind(user.current_zone_id).first<{ xp_multiplier: number }>();
        const mult = z?.xp_multiplier ?? 1;
        const xpToLevel = (n: number) => Math.round(10 * Math.pow(1.056, n - 1));
        const totalXp = (n: number) => {
          let sum = 0;
          for (let i = 1; i < n; i++) sum += xpToLevel(i);
          return sum;
        };
        let lvl = user.level;
        while (user.xp >= totalXp(lvl + 1)) lvl++;
        if (lvl > user.level) {
          await db.prepare(`UPDATE users SET level = ? WHERE id = ?`)
            .bind(lvl, userId).run();
        }
      }
    }
  }
}