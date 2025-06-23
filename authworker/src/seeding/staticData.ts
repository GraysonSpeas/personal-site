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
  { name: 'Shells', rarity: 'common', zones: ['Ocean'] },
  { name: 'Rare herbs', rarity: 'common', zones: ['Jungle'] },
  { name: 'Berries', rarity: 'common', zones: ['Jungle', 'River'] },
  { name: 'Algae', rarity: 'common', zones: ['River', 'Ocean'] }
];

export const fishTypes = [
    { species: 'Clownfish', base_weight: 1.2, base_length: 10.5, stamina: 150, tug_strength: 105, direction_change_rate: 100, sell_price: 100, zones: ['Ocean'], rarity: 'common' },
    { species: 'Bass', base_weight: 4.5, base_length: 20.3, stamina: 150, tug_strength: 100, direction_change_rate: 100, sell_price: 200, zones: ['River', 'Jungle'], rarity: 'common' },
    { species: 'Catfish', base_weight: 5.0, base_length: 25.0, stamina: 150, tug_strength: 100, direction_change_rate: 100, sell_price: 250, zones: ['River'], rarity: 'common' },
    { species: 'Lavafish', base_weight: 3.0, base_length: 15.0, stamina: 150, tug_strength: 110, direction_change_rate: 100, sell_price: 300, zones: ['Lava'], rarity: 'common' }
];