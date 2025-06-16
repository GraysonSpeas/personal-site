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
    { species: 'Clownfish', base_weight: 1.2, base_length: 10.5, stamina: 50, tug_strength: 20, direction_change_rate: 10, sell_price: 100, zones: ['Ocean', 'Jungle'], rarity: 'common' },
    { species: 'Bass', base_weight: 4.5, base_length: 20.3, stamina: 80, tug_strength: 40, direction_change_rate: 15, sell_price: 200, zones: ['River', 'Jungle'], rarity: 'common' },
    { species: 'Catfish', base_weight: 5.0, base_length: 25.0, stamina: 100, tug_strength: 60, direction_change_rate: 5, sell_price: 250, zones: ['River'], rarity: 'common' },
    { species: 'Lavafish', base_weight: 3.0, base_length: 15.0, stamina: 70, tug_strength: 50, direction_change_rate: 20, sell_price: 300, zones: ['Lava'], rarity: 'common' }
];