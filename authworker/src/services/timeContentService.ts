import type { D1Database } from '@cloudflare/workers-types';

export interface WorldState {
  phase: 'day' | 'night';
  cycleNum: number;
  cycleMin: number;
  isRaining: boolean;
  rainStartMin: number | null;
}

export interface CatchOfTheDayFish {
  species: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  sellLimit: number;
}

export interface CatchOfTheDay {
  fishes: CatchOfTheDayFish[];
}

export interface QuestTemplate {
  id: number;
  key: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
}

export interface UserQuest extends QuestTemplate {
  progress: number;
  completed: boolean;
  updated_at: string;
}

// -- Utilities --

export function toCST(date: Date): Date {
  const cstString = date.toLocaleString('en-US', { timeZone: 'America/Chicago' });
  return new Date(cstString);
}

export function startOfDayCST(date: Date): Date {
  const cst = toCST(date);
  cst.setHours(0, 0, 0, 0);
  return cst;
}

function seededRandom(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(array: T[], rand: () => number): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getCurrentTimeCST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
}

// -- World State --

export function getWorldState(now = Date.now()): WorldState {
  const cycleLength = 150 * 60 * 1000; // 150 min total

  const worldStart = new Date('2025-07-01T05:00:00Z').getTime();
  const msSinceStart = Math.max(0, now - worldStart);

  const cycleNum = Math.floor(msSinceStart / cycleLength);
  const cycleMin = (msSinceStart % cycleLength) / (60 * 1000);

  const isDay = cycleMin < 120;
  const phase = isDay ? 'day' : 'night';

  let isRaining = false;
  let rainStartMin: number | null = null;

  if (cycleNum % 3 === 2) {
    const rainSchedule = [15, 90, 105];
    const rainIndex = Math.floor((cycleNum / 3) % rainSchedule.length);
    rainStartMin = rainSchedule[rainIndex];
    const rainEndMin = rainStartMin + 45;
    if (cycleMin >= rainStartMin && cycleMin < rainEndMin) {
      isRaining = true;
    }
  }

  return { phase, cycleNum, cycleMin, isRaining, rainStartMin };
}

// -- Catch of the Day --

export function getCatchOfTheDay(
  fishTypes: { species: string; rarity: string }[],
  now = Date.now()
): CatchOfTheDay {
  const dayKey = startOfDayCST(new Date(now)).getTime();
  const rand = seededRandom(dayKey);

  const commonUncommon = fishTypes.filter(
    (f) => f.rarity === 'common' || f.rarity === 'uncommon'
  );
  const rare = fishTypes.filter((f) => f.rarity === 'rare');
  const epic = fishTypes.filter((f) => f.rarity === 'epic');

  const pickFromGroup = (group: typeof fishTypes, count: number) =>
    shuffleSeeded(group, rand).slice(0, count);

  const firstGroup = pickFromGroup(commonUncommon, 1)[0];
  const secondGroup = pickFromGroup(rare, 1)[0];
  const thirdGroup = pickFromGroup(epic, 1)[0];

  const sellLimitForRarity = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 5;
      case 'uncommon':
        return 3;
      case 'rare':
        return 2;
      case 'epic':
        return 1;
      default:
        return 5;
    }
  };

  return {
    fishes: [
      {
        species: firstGroup.species,
        rarity: firstGroup.rarity as any,
        sellLimit: sellLimitForRarity(firstGroup.rarity),
      },
      {
        species: secondGroup.species,
        rarity: secondGroup.rarity as any,
        sellLimit: sellLimitForRarity(secondGroup.rarity),
      },
      {
        species: thirdGroup.species,
        rarity: thirdGroup.rarity as any,
        sellLimit: sellLimitForRarity(thirdGroup.rarity),
      },
    ],
  };
}

// -- Quest Scheduling Logic --

function getCurrentWeekNumber(date: Date): number {
  const cstDate = toCST(date);
  const janFirst = new Date(cstDate.getFullYear(), 0, 1);
  const days =
    Math.floor((cstDate.getTime() - janFirst.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + janFirst.getDay() + 1) / 7);
}

function questsValid(
  quests: UserQuest[],
  type: 'daily' | 'weekly' | 'monthly',
  today: number,
  thisWeek: number,
  thisMonth: number
): boolean {
  const filtered = quests.filter((q) => q.type === type);
  if (filtered.length === 0) return false;

  const latest = filtered.reduce((a, b) =>
    new Date(a.updated_at) > new Date(b.updated_at) ? a : b
  );
  const updatedAt = new Date(latest.updated_at);
  const updatedCST = toCST(updatedAt);

  if (type === 'daily') {
    return startOfDayCST(updatedAt).getTime() === today;
  } else if (type === 'weekly') {
    return getCurrentWeekNumber(updatedAt) === thisWeek;
  } else if (type === 'monthly') {
    return updatedCST.getMonth() === thisMonth;
  }
  return false;
}

async function queryDb<T>(db: D1Database, sql: string, params: any[] = []): Promise<T[]> {
  const result = await db.prepare(sql).bind(...params).all<T>();
  return result.results ?? [];
}

export async function assignNewQuests(
  db: D1Database,
  userId: number,
  type: 'daily' | 'weekly' | 'monthly'
) {
  await db.prepare(
    `
    DELETE FROM user_quests
    WHERE user_id = ? AND quest_template_id IN (
      SELECT id FROM questTemplates WHERE type = ?
    )
  `
  ).bind(userId, type).run();

  const quests = await queryDb<QuestTemplate>(
    db,
    `SELECT id, key, description, type, target FROM questTemplates WHERE type = ? ORDER BY RANDOM() LIMIT 3`,
    [type]
  );

  for (const quest of quests) {
    await db.prepare(
      `
      INSERT INTO user_quests (user_id, quest_template_id, quest_key, progress, completed, updated_at)
      VALUES (?, ?, ?, 0, 0, datetime('now'))
    `
    ).bind(userId, quest.id, quest.key).run();
  }
}

export async function checkAndAssignQuests(
  db: D1Database,
  userId: number
): Promise<UserQuest[]> {
  const now = new Date();
  const cstNow = toCST(now);
  const today = startOfDayCST(now).getTime();
  const thisWeek = getCurrentWeekNumber(now);
  const thisMonth = cstNow.getMonth();

  const userQuests = await queryDb<UserQuest>(
    db,
    `
    SELECT uq.*, qt.description, qt.target, qt.type
    FROM user_quests uq
    JOIN questTemplates qt ON uq.quest_template_id = qt.id
    WHERE uq.user_id = ?
  `,
    [userId]
  );

  if (!questsValid(userQuests, 'daily', today, thisWeek, thisMonth)) {
    await assignNewQuests(db, userId, 'daily');
  }
  if (!questsValid(userQuests, 'weekly', today, thisWeek, thisMonth)) {
    await assignNewQuests(db, userId, 'weekly');
  }
  if (!questsValid(userQuests, 'monthly', today, thisWeek, thisMonth)) {
    await assignNewQuests(db, userId, 'monthly');
  }

  const updatedQuests = await queryDb<UserQuest>(
    db,
    `
    SELECT uq.*, qt.description, qt.target, qt.type
    FROM user_quests uq
    JOIN questTemplates qt ON uq.quest_template_id = qt.id
    WHERE uq.user_id = ?
    ORDER BY uq.id
  `,
    [userId]
  );

  return updatedQuests;
}