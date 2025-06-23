// src/services/generateFishService.ts
import type { Context } from 'hono';

interface FishType {
  species: string;
  base_weight: number;
  base_length: number;
  stamina: number;
  tug_strength: number;
  direction_change_rate: number;
  sell_price: number;
  rarity: string;
  zones: string[];
}

const modifierChances = [
  { name: 'Albino', weight: 25 },
  { name: 'Buff', weight: 30 },
  { name: 'Elusive', weight: 30 },
  { name: 'Golden', weight: 5 },
  { name: 'Glowing', weight: 10 },
];

const baseRarityWeights = {
  mythic: 0.001,
  legendary: 0.01,
  epic: 0.05,
  rare: 0.10,
  uncommon: 0.20,
  common: 0.639,
};

const weatherRarityMultipliers: Record<number, Partial<Record<string, number>>> = {
  1: {}, 
  2: {    
    mythic: 1.25,
    legendary: 1.25,
    epic: 1.25,
    rare: 1.25,
    uncommon: 1.25,
  },
};

function getAdjustedWeights(weatherId: number) {
  const multipliers = weatherRarityMultipliers[weatherId] || {};
  const adjustedWeights: Record<string, number> = {};
  let total = 0;
  for (const [rarity, baseWeight] of Object.entries(baseRarityWeights)) {
    const multiplier = multipliers[rarity] ?? 1;
    adjustedWeights[rarity] = baseWeight * multiplier;
    total += adjustedWeights[rarity];
  }
  for (const rarity in adjustedWeights) {
    adjustedWeights[rarity] /= total;
  }
  return adjustedWeights;
}

function pickRarity(weatherId: number) {
  const adjustedWeights = getAdjustedWeights(weatherId);
  const roll = Math.random();
  let acc = 0;
  for (const [rarity, weight] of Object.entries(adjustedWeights)) {
    acc += weight;
    if (roll <= acc) return rarity;
  }
  return 'common';
}

function pickModifier(): string | null {
  if (Math.random() > 0.01) return null; 

  const roll = Math.random() * 100;
  let acc = 0;
  for (const mod of modifierChances) {
    acc += mod.weight;
    if (roll <= acc) return mod.name;
  }
  return null;
}

function generateLength(weight: number, baseWeight: number, baseLength: number): number {
  const ratio = weight / baseWeight;
  return +(baseLength * ratio).toFixed(1);
}

function isMassive(weight: number, baseWeight: number): boolean {
  const max = baseWeight * 1.5;
  const min = baseWeight * 0.5;
  return weight >= max - (max - min) * 0.05;
}

export async function generateFish(
  fishTypes: FishType[],
  weatherId: number,
  zoneName: string
) {
  console.log('Zone name passed to generateFish:', zoneName); // Log the zone name
  console.log('Fish types received in generateFish:', fishTypes); // Log the fishTypes array

  const fishInZone = fishTypes.filter((f) => 
  Array.isArray(f.zones) && f.zones.some(zone => zone.trim().toLowerCase() === zoneName.trim().toLowerCase())
  );

  console.log('Fish filtered by zone:', fishInZone); // Log fish types filtered by zone

  if (!fishInZone.length) {
    console.error('No fish in this zone:', zoneName); // Log error if no fish in zone
    throw new Error('No fish in this zone');
  }

  const rarity = pickRarity(weatherId);
  console.log('Selected rarity:', rarity); // Log the selected rarity

  const possibleFish = fishInZone.filter((f) => f.rarity === rarity);
  console.log('Possible fish matching rarity:', possibleFish); // Log fish matching rarity

  const chosenFishPool = possibleFish.length ? possibleFish : fishInZone.filter((f) => f.rarity === 'common');
  console.log('Final chosen fish pool:', chosenFishPool); // Log the final pool of fish

  const fish = chosenFishPool[Math.floor(Math.random() * chosenFishPool.length)];
  console.log('Selected fish:', fish); // Log the selected fish

  const weight = +(fish.base_weight * (0.5 + Math.random())).toFixed(2);
  const length = generateLength(weight, fish.base_weight, fish.base_length);
  const massive = isMassive(weight, fish.base_weight);
  const modifier = pickModifier();

  console.log('Generated stats - Weight:', weight, 'Length:', length, 'Massive:', massive, 'Modifier:', modifier);

  let stamina = fish.stamina;
  let tug_strength = fish.tug_strength;
  let direction_change_rate = fish.direction_change_rate;

  if (modifier === 'Buff') stamina = Math.round(stamina * 1.3);
  else if (modifier === 'Elusive') tug_strength = Math.round(tug_strength * 1.2);

  return {
    species: fish.species,
    rarity,
    weight,
    length,
    massive,
    modifier,
    stamina,
    tug_strength,
    direction_change_rate,
    sell_price: fish.sell_price,
  };
}