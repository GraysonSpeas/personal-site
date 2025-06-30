export const weatherTypes = [
	{ description: 'Sunny' },
	{ description: 'Rainy' },
];

export const zoneTypes = [
    { name: 'Jungle' },
    { name: 'Ocean' },
    { name: 'River' },
    { name: 'Lava' }
];

export const resourceTypes = [
  { species: 'Shells', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Ocean'], rarity: 'common', barType: 'middle' },
  { species: 'Rare herbs', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle'], rarity: 'common', barType: 'middle' },
  { species: 'Berries', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle', 'River'], rarity: 'common', barType: 'middle' },
  { species: 'Algae', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['River', 'Ocean'], rarity: 'common', barType: 'middle' }
];

export const fishTypes = [
  { species: 'Clownfish', base_weight: 1.2, base_length: 10.5, stamina: 150, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Ocean'], rarity: 'common', barType: 'middle' },
  { species: 'Bass', base_weight: 4.5, base_length: 20.3, stamina: 150, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['River', 'Jungle'], rarity: 'common', barType: 'low' },
  { species: 'Catfish', base_weight: 5.0, base_length: 25.0, stamina: 150, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['River'], rarity: 'common', barType: 'high' },
  { species: 'Lavafish', base_weight: 3.0, base_length: 15.0, stamina: 150, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Lava'], rarity: 'common', barType: 'middle' }
];

export const rodTypes = [
  { id: 1, name: 'Basic Rod', stats: { focus: 1, lineTension: 1, luck: 1 }, sell_price: 1 },
  { id: 2, name: 'Advanced Rod', stats: { focus: 1, lineTension: 1, luck: 1 }, sell_price: 1 },
];

export const hookTypes = [
  { id: 1, name: 'Basic Hook', stats: { focus: 1, lineTension: 1, luck: 1 }, sell_price: 1 },
  { id: 2, name: 'Advanced Hook', stats: { focus: 1, lineTension: 1, luck: 1 }, sell_price: 1 },
];

export const baitTypes = [
  { id: 1, name: 'Basic Bait', stats: { focus: 1, lineTension: 1, luck: 1 }, sell_price: 1 },
  { id: 2, name: 'Special Bait', stats: { focus: 1, lineTension: 1, luck: 1 }, sell_price: 1 },
];

