// timeContentService.ts
// Handles time, weather, world state, and catch of the day logic

const CST_OFFSET = -5 * 60; // minutes offset UTC→CST

interface WorldState {
  phase: 'day' | 'night';
  cycleNum: number;
  cycleMin: number;
  isRaining: boolean;
  rainStartMin: number | null;
}

interface CatchOfTheDayFish {
  species: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  sellLimit: number;
}

interface CatchOfTheDay {
  fishes: CatchOfTheDayFish[];
}

// -- Utilities --

function toCST(date: Date): Date {
  const cstString = date.toLocaleString('en-US', { timeZone: 'America/Chicago' });
  return new Date(cstString);
}

function startOfDayCST(date: Date): Date {
  const cst = toCST(date);
  cst.setHours(0, 0, 0, 0);
  return new Date(cst.getTime() - CST_OFFSET * 60 * 1000);
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
  const rainDuration = 45 * 60 * 1000;

  const worldStart = new Date('2025-07-01T05:00:00Z').getTime();
  const msSinceStart = now - worldStart;

  const cycleNum = Math.floor(msSinceStart / cycleLength);
  const cycleMin = (msSinceStart % cycleLength) / (60 * 1000);

  const isDay = cycleMin < 120;
  const phase = isDay ? 'day' : 'night';

  let isRaining = false;
  let rainStartMin: number | null = null;

  // Every 3rd cycle starting at cycle 2 rains at these mins (repeats)
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
      case 'common': return 5;
      case 'uncommon': return 3;
      case 'rare': return 2;
      case 'epic': return 1;
      default: return 5;
    }
  };

  return {
    fishes: [
      { species: firstGroup.species, rarity: firstGroup.rarity as any, sellLimit: sellLimitForRarity(firstGroup.rarity) },
      { species: secondGroup.species, rarity: secondGroup.rarity as any, sellLimit: sellLimitForRarity(secondGroup.rarity) },
      { species: thirdGroup.species, rarity: thirdGroup.rarity as any, sellLimit: sellLimitForRarity(thirdGroup.rarity) },
    ],
  };
}