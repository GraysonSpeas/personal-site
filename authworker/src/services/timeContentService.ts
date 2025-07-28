import type { D1Database } from '@cloudflare/workers-types';
import { getAllQuests, assignNewQuests, getQuestKeys } from './questService';

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

export function getCurrentTimeCST(): Date {
  return toCST(new Date());
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

export async function assignCatchOfTheDayToUser(db: D1Database, userId: number) {
  const today = startOfDayCST(new Date()).toISOString();

  const lastAssignedRow = await db
    .prepare('SELECT MAX(last_assigned) as lastAssigned FROM user_fish_sales WHERE user_id = ?')
    .bind(userId)
    .first<{ lastAssigned: string | null }>();

  if (lastAssignedRow?.lastAssigned === today) {
    return;
  }

  const fishTypes = await db
    .prepare('SELECT species, rarity FROM fishTypes')
    .all<{ species: string; rarity: string }>();

  const catchOfTheDay = getCatchOfTheDay(fishTypes.results ?? []);

  await db.prepare('DELETE FROM user_fish_sales WHERE user_id = ?').bind(userId).run();

  for (const fish of catchOfTheDay.fishes) {
    await db.prepare(
      `INSERT INTO user_fish_sales (user_id, species, sell_limit, sell_amount, last_assigned)
       VALUES (?, ?, ?, 0, ?)`
    ).bind(userId, fish.species, fish.sellLimit, today).run();
  }
}

export async function checkAndAssignQuests(db: D1Database, userId: number) {
  const quests = await getAllQuests(db);
  const questKeys = getQuestKeys();
  await assignNewQuests(db, userId, quests, questKeys);

  const userQuests = await db.prepare(`
    SELECT uq.*, qt.description, qt.target, qt.type
    FROM user_quests uq
    JOIN questTemplates qt ON uq.quest_template_id = qt.id
    WHERE uq.user_id = ?
    ORDER BY uq.id
  `).bind(userId).all();

  return userQuests.results;
}