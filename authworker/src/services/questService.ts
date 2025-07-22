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

// Previous period helpers
function prevDayCST(date: Date): Date {
  const d = toCST(date);
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - (-5 * 60 * 60 * 1000));
}

function prevWeekCST(date: Date): Date {
  const d = toCST(date);
  const diff = d.getDay() + 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - (-5 * 60 * 60 * 1000));
}

function prevMonthCST(date: Date): Date {
  const d = toCST(date);
  d.setMonth(d.getMonth() - 1);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - (-5 * 60 * 60 * 1000));
}

export function getQuestKeys(now = Date.now()): QuestKeys {
  return {
    daily: startOfCSTDay(new Date(now)).toISOString().slice(0, 10),
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
  // Get all user quests for current period keys to restrict update only to assigned quests
  const userQuestsRes = await db
    .prepare('SELECT quest_key FROM user_quests WHERE user_id = ?')
    .bind(userId)
    .all();

const userQuestKeys = new Set<string>(userQuestsRes.results.map(r => String(r.quest_key)));
  // Auto-refresh quests if missing current period keys
  const missingTypes = new Set<'daily' | 'weekly' | 'monthly'>();

const prevKeys = getPrevQuestKeys(Date.now());
for (const type of ['daily', 'weekly', 'monthly'] as const) {
  const prevPeriodKey = prevKeys[type];
  const hasOld = [...userQuestKeys].some(key => key.endsWith(prevPeriodKey));
  if (hasOld) {
    missingTypes.add(type);
  }
}


  if (missingTypes.size > 0) {
    const prevKeys = getPrevQuestKeys(Date.now());
    for (const type of missingTypes) {
      await db.prepare(`DELETE FROM user_quests WHERE user_id = ? AND quest_key LIKE ?`)
        .bind(userId, `%_${prevKeys[type]}%`)
        .run();
    }
    await assignNewQuests(db, userId, quests, questKeys);

    // Refresh userQuestKeys after assignment
    const refreshed = await db
      .prepare('SELECT quest_key FROM user_quests WHERE user_id = ?')
      .bind(userId)
      .all();
refreshed.results.forEach(r => userQuestKeys.add(String(r.quest_key)));
  }

  // Update progress only for quests assigned for current period
  for (const quest of quests) {
    const periodKey = questKeys[quest.type];
    const questUniqueKey = `${quest.key}_${periodKey}`;

    if (!userQuestKeys.has(questUniqueKey)) {
      continue; // Skip unassigned quests
    }
console.log(`[Quest Check] key=${quest.key}`);
console.log(`- questUniqueKey: ${questUniqueKey}`);
console.log(`- assigned: ${userQuestKeys.has(questUniqueKey)}`);
console.log(`- context:`, context);
console.log(`- quest.requires_no_bait: ${quest.requires_no_bait}`);
console.log(`- quest.requires_no_rod: ${quest.requires_no_rod}`);
console.log(`- quest.requires_no_hook: ${quest.requires_no_hook}`);
console.log(`- quest.time_of_day: ${quest.time_of_day}`);
console.log(`- quest.zone: ${quest.zone}`);
console.log(`- quest.weather: ${quest.weather}`);

if (quest.requires_no_bait && context.hasBait) {
  console.log(`[Skipped] ${quest.key} - has bait but requires none`);
  continue;
}
if (quest.requires_no_rod && context.hasRod) {
  console.log(`[Skipped] ${quest.key} - has rod but requires none`);
  continue;
}
if (quest.requires_no_hook && context.hasHook) {
  console.log(`[Skipped] ${quest.key} - has hook but requires none`);
  continue;
}
if (quest.time_of_day && quest.time_of_day !== context.timeOfDay) {
  console.log(`[Skipped] ${quest.key} - time mismatch`);
  continue;
}
if (quest.zone && quest.zone !== context.zone) {
  console.log(`[Skipped] ${quest.key} - zone mismatch`);
  continue;
}
if (quest.weather && quest.weather !== context.weather) {
  console.log(`[Skipped] ${quest.key} - weather mismatch`);
  continue;
}


console.log(`[Quest Check] key=${quest.key} - caughtFish:`, caughtFish);

const matchedCount = caughtFish.filter(fish => {
  if (quest.rarity_exact && fish.rarity !== quest.rarity_exact) return false;
  if (quest.rarity_min && !meetsRarityMin(fish.rarity, quest.rarity_min)) return false;
  if (quest.requires_modified && !fish.modified) return false;
  if (quest.condition && !quest.condition(fish)) return false;
  return true;
}).length;

console.log(`[Quest Check] key=${quest.key} - matchedCount: ${matchedCount}`);

if (matchedCount === 0) {
  console.log(`[Quest Check] key=${quest.key} - no matching fish, skipping progress update`);
  continue;
}


    const row = await db
      .prepare(`SELECT progress, completed FROM user_quests WHERE user_id = ? AND quest_key = ?`)
      .bind(userId, questUniqueKey)
      .first<{ progress: number; completed: number }>();

    const currentProgress = row?.progress ?? 0;
    const completed = row?.completed ?? 0;
    if (completed) continue;

    const newProgress = Math.min(currentProgress + matchedCount, quest.target);
    const isCompleted = newProgress >= quest.target;
    
await db.prepare(`
  UPDATE user_quests
  SET progress = ?, completed = ?, updated_at = datetime('now')
  WHERE user_id = ? AND quest_key = ?
`).bind(newProgress, isCompleted ? 1 : 0, userId, questUniqueKey).run();

if (isCompleted) {
  // Add XP and gold
  await db.prepare(`UPDATE users SET xp = xp + ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(quest.reward.xp, userId).run();

  await db.prepare(`UPDATE currencies SET gold = gold + ? WHERE user_id = ?`)
    .bind(quest.reward.gold, userId).run();

  // Recalculate level
  const user = await db.prepare(`SELECT xp, level, current_zone_id FROM users WHERE id = ?`)
    .bind(userId).first<{ xp: number; level: number; current_zone_id: number }>();

  if (user) {
    const zone = await db.prepare(`SELECT xp_multiplier FROM zoneTypes WHERE id = ?`)
      .bind(user.current_zone_id).first<{ xp_multiplier: number }>();

    const multiplier = typeof zone?.xp_multiplier === 'number' ? zone.xp_multiplier : 1.0;

    // Use total user XP (already updated above)
    const xpToLevel = (n: number) => Math.round(10 * Math.pow(1.056, n - 1));
    const totalXpToLevel = (n: number) => {
      let total = 0;
      for (let i = 1; i < n; i++) total += xpToLevel(i);
      return total;
    };

    let newLevel = user.level;
    while (user.xp >= totalXpToLevel(newLevel + 1)) newLevel++;

    if (newLevel > user.level) {
      await db.prepare(`UPDATE users SET level = ?, updated_at = datetime('now') WHERE id = ?`)
        .bind(newLevel, userId).run();
    }
  }
}
}
}