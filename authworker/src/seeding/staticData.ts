export const weatherTypes = [
	{ description: 'Sunny' },
	{ description: 'Rainy' },
];

export const zoneTypes = [
  { name: 'Jungle', xp_multiplier: 1.0 },
  { name: 'Ocean', xp_multiplier: 1.1 },
  { name: 'River', xp_multiplier: 1.2 },
  { name: 'Lava', xp_multiplier: 1.3 },
  { name: 'Tidal', xp_multiplier: 1.0 }
];
export type ResourceType = {
  species: string;
  base_weight: number;
  base_length: number;
  stamina: number;
  tug_strength: number;
  direction_change_rate: number;
  change_strength: number;
  sell_price: number;
  buy_price?: number; // optional
  zones: string[];
  rarity: string;
  barType: string;
  time_of_day: 'day' | 'night' | null;
  weather: string | null;
};

export const resourceTypes: ResourceType[] = [
  // tidal resource
  { species: 'tidal_common_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Tidal'], rarity: 'common', barType: 'middle', time_of_day: null, weather: null },
  // Jungle zone (day/night/rain)
  { species: 'jungle_common_day_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle'], rarity: 'common', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_common_night_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle'], rarity: 'common', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_common_rain_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle'], rarity: 'common', barType: 'middle', time_of_day: null, weather: 'rain' },

  { species: 'jungle_uncommon_day_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['Jungle'], rarity: 'uncommon', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_uncommon_night_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['Jungle'], rarity: 'uncommon', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_uncommon_rain_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['Jungle'], rarity: 'uncommon', barType: 'middle', time_of_day: null, weather: 'rain' },

  { species: 'jungle_rare_day_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Jungle'], rarity: 'rare', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_rare_night_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Jungle'], rarity: 'rare', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_rare_rain_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Jungle'], rarity: 'rare', barType: 'middle', time_of_day: null, weather: 'rain' },

  { species: 'jungle_epic_day_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Jungle'], rarity: 'epic', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_epic_night_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Jungle'], rarity: 'epic', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_epic_rain_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Jungle'], rarity: 'epic', barType: 'middle', time_of_day: null, weather: 'rain' },

  { species: 'jungle_legendary_day_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Jungle'], rarity: 'legendary', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_legendary_night_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Jungle'], rarity: 'legendary', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_legendary_rain_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Jungle'], rarity: 'legendary', barType: 'middle', time_of_day: null, weather: 'rain' },

  { species: 'jungle_mythic_day_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['Jungle'], rarity: 'mythic', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_mythic_night_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['Jungle'], rarity: 'mythic', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_mythic_rain_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['Jungle'], rarity: 'mythic', barType: 'middle', time_of_day: null, weather: 'rain' },

  // Ocean zone
  { species: 'ocean_common_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Ocean'], rarity: 'common', barType: 'middle', time_of_day: null, weather: null },
  { species: 'ocean_uncommon_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['Ocean'], rarity: 'uncommon', barType: 'middle', time_of_day: null, weather: null },
  { species: 'ocean_rare_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Ocean'], rarity: 'rare', barType: 'middle', time_of_day: null, weather: null },
  { species: 'ocean_epic_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Ocean'], rarity: 'epic', barType: 'middle', time_of_day: null, weather: null },
  { species: 'ocean_legendary_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Ocean'], rarity: 'legendary', barType: 'middle', time_of_day: null, weather: null },
  { species: 'ocean_mythic_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['Ocean'], rarity: 'mythic', barType: 'middle', time_of_day: null, weather: null },

  // River zone
  { species: 'river_common_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['River'], rarity: 'common', barType: 'middle', time_of_day: null, weather: null },
  { species: 'river_uncommon_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['River'], rarity: 'uncommon', barType: 'middle', time_of_day: null, weather: null },
  { species: 'river_rare_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['River'], rarity: 'rare', barType: 'middle', time_of_day: null, weather: null },
  { species: 'river_epic_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['River'], rarity: 'epic', barType: 'middle', time_of_day: null, weather: null },
  { species: 'river_legendary_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['River'], rarity: 'legendary', barType: 'middle', time_of_day: null, weather: null },
  { species: 'river_mythic_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['River'], rarity: 'mythic', barType: 'middle', time_of_day: null, weather: null },

  // Lava zone
  { species: 'lava_common_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Lava'], rarity: 'common', barType: 'middle', time_of_day: null, weather: null },
  { species: 'lava_uncommon_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['Lava'], rarity: 'uncommon', barType: 'middle', time_of_day: null, weather: null },
  { species: 'lava_rare_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Lava'], rarity: 'rare', barType: 'middle', time_of_day: null, weather: null },
  { species: 'lava_epic_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Lava'], rarity: 'epic', barType: 'middle', time_of_day: null, weather: null },
  { species: 'lava_legendary_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Lava'], rarity: 'legendary', barType: 'middle', time_of_day: null, weather: null },
  { species: 'lava_mythic_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['Lava'], rarity: 'mythic', barType: 'middle', time_of_day: null, weather: null },

  // merchant only
  { species: 'merchant_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, buy_price: 50, zones: ['Lava'], rarity: 'rare', barType: 'middle', time_of_day: null, weather: null },
];

export const fishTypes = [
  //tidal fish
  { species: 'tidal_common_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Tidal'], rarity: 'common', barType: 'middle', time_of_day: null, weather: null },
  // Jungle zone
  // common
  { species: 'jungle_common_day_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle'], rarity: 'common', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_common_night_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle'], rarity: 'common', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_common_rain_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle'], rarity: 'common', barType: 'middle', time_of_day: null, weather: 'rain' },
  // uncommon
  { species: 'jungle_uncommon_day_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['Jungle'], rarity: 'uncommon', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_uncommon_night_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['Jungle'], rarity: 'uncommon', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_uncommon_rain_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['Jungle'], rarity: 'uncommon', barType: 'middle', time_of_day: null, weather: 'rain' },
  // rare
  { species: 'jungle_rare_day_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Jungle'], rarity: 'rare', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_rare_night_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Jungle'], rarity: 'rare', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_rare_rain_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Jungle'], rarity: 'rare', barType: 'middle', time_of_day: null, weather: 'rain' },
  // epic
  { species: 'jungle_epic_day_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Jungle'], rarity: 'epic', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_epic_night_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Jungle'], rarity: 'epic', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_epic_rain_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Jungle'], rarity: 'epic', barType: 'middle', time_of_day: null, weather: 'rain' },
  // legendary
  { species: 'jungle_legendary_day_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Jungle'], rarity: 'legendary', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_legendary_night_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Jungle'], rarity: 'legendary', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_legendary_rain_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Jungle'], rarity: 'legendary', barType: 'middle', time_of_day: null, weather: 'rain' },
  // mythic
  { species: 'jungle_mythic_day_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['Jungle'], rarity: 'mythic', barType: 'middle', time_of_day: 'day', weather: null },
  { species: 'jungle_mythic_night_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['Jungle'], rarity: 'mythic', barType: 'middle', time_of_day: 'night', weather: null },
  { species: 'jungle_mythic_rain_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['Jungle'], rarity: 'mythic', barType: 'middle', time_of_day: null, weather: 'rain' },

  // Ocean zone (rarities no time/weather)
  { species: 'ocean_common_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Ocean'], rarity: 'common', barType: 'middle', time_of_day: null, weather: null },
  { species: 'ocean_uncommon_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['Ocean'], rarity: 'uncommon', barType: 'middle', time_of_day: null, weather: null },
  { species: 'ocean_rare_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Ocean'], rarity: 'rare', barType: 'middle', time_of_day: null, weather: null },
  { species: 'ocean_epic_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Ocean'], rarity: 'epic', barType: 'middle', time_of_day: null, weather: null },
  { species: 'ocean_legendary_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Ocean'], rarity: 'legendary', barType: 'middle', time_of_day: null, weather: null },
  { species: 'ocean_mythic_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['Ocean'], rarity: 'mythic', barType: 'middle', time_of_day: null, weather: null },

  // River zone
  { species: 'river_common_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['River'], rarity: 'common', barType: 'middle', time_of_day: null, weather: null },
  { species: 'river_uncommon_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['River'], rarity: 'uncommon', barType: 'middle', time_of_day: null, weather: null },
  { species: 'river_rare_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['River'], rarity: 'rare', barType: 'middle', time_of_day: null, weather: null },
  { species: 'river_epic_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['River'], rarity: 'epic', barType: 'middle', time_of_day: null, weather: null },
  { species: 'river_legendary_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['River'], rarity: 'legendary', barType: 'middle', time_of_day: null, weather: null },
  { species: 'river_mythic_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['River'], rarity: 'mythic', barType: 'middle', time_of_day: null, weather: null },

  // Lava zone
  { species: 'lava_common_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Lava'], rarity: 'common', barType: 'middle', time_of_day: null, weather: null },
  { species: 'lava_uncommon_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 150, zones: ['Lava'], rarity: 'uncommon', barType: 'middle', time_of_day: null, weather: null },
  { species: 'lava_rare_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Lava'], rarity: 'rare', barType: 'middle', time_of_day: null, weather: null },
  { species: 'lava_epic_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Lava'], rarity: 'epic', barType: 'middle', time_of_day: null, weather: null },
  { species: 'lava_legendary_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Lava'], rarity: 'legendary', barType: 'middle', time_of_day: null, weather: null },
  { species: 'lava_mythic_fish', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 350, zones: ['Lava'], rarity: 'mythic', barType: 'middle', time_of_day: null, weather: null },
];

export const consumableTypes = [
  {
    id: 1,
    name: 'Blue Bull',
    description: 'focus +15% bait save +5%',
    effect: 'focus +15%, bait +5%',
    duration: 300,
    sell_price: 100,
    buy_price: 150,
  },
  {
    id: 2,
    name: 'Gum',
    description: '100% bait save',
    effect: 'bait +100%',
    duration: 300,
    sell_price: 150,
    buy_price: 200,
  },
  {
    id: 3,
    name: 'Angler',
    description: '3% rare catch boost',
    effect: 'luck +3%',
    duration: 300,
    sell_price: 200,
    buy_price: 250,
  },
];


export const craftingRecipes = [
  {
    id: 1,
    name: 'Simple Rod',
    description: 'Craft a simple rod',
    outputType: 'rod',              // use 'rod' instead of 'gear' + 'outputGearType'
    outputTypeId: 2,
    requiredMaterials: JSON.stringify([
      { type: 'resource', name: 'Shells', quantity: 2 },
      { type: 'gold', quantity: 500 },
    ]),
  },
  {
    id: 2,
    name: 'Blue Bull',
    description: 'Craft a consumable potion from fish',
    outputType: 'consumable',
    outputTypeId: 1,
    requiredMaterials: JSON.stringify([
      { type: 'fish', species: 'Clownfish', quantity: 2 },
      { type: 'gold', quantity: 100 },
    ]),
  },
];


export const rodTypes = [
  { id: 1, name: 'Rusty Rod', stats: { focus: 25, lineTension: 25, luck: 0 }, buy_price: 50 },
  { id: 2, name: 'Simple Rod', stats: { focus: 5, lineTension: 5, luck: 5 }, buy_price: 50 },
  { id: 3, name: 'Cold Resistant Rod', stats: { focus: 20, lineTension: 30, luck: 10, cold_resistant: true }, buy_price: 50 },
  { id: 4, name: 'Heat Resistant Rod', stats: { focus: 15, lineTension: 35, luck: 5, heat_resistant: true }, buy_price: 50 },
];

export const hookTypes = [
  { id: 1, name: 'Rusty Hook', stats: { focus: 25, lineTension: 25, luck: 0 }, buy_price: 50 },
  { id: 2, name: 'Simple Hook', stats: { focus: 5, lineTension: 5, luck: 5 }, buy_price: 50 },
  { id: 3, name: 'Cold Resistant Hook', stats: { focus: 20, lineTension: 30, luck: 10, cold_resistant: true }, buy_price: 50 },
  { id: 4, name: 'Heat Resistant Hook', stats: { focus: 15, lineTension: 35, luck: 5, heat_resistant: true }, buy_price: 50 },
];

export const baitTypes = [
  { id: 1, name: 'Broken Bait', stats: { focus: 10, lineTension: 10, luck: 0 } , sell_price: 50, buy_price: 50},
  { id: 2, name: 'Simple Bait', stats: { focus: 5, lineTension: 5, luck: 5 }, sell_price: 25, buy_price: 50 },
  { id: 3, name: 'Cold Resistant Bait', stats: { focus: 15, lineTension: 15, luck: 5, cold_resistant: true }, sell_price: 40, buy_price: 50 },
  { id: 4, name: 'Heat Resistant Bait', stats: { focus: 12, lineTension: 18, luck: 3, heat_resistant: true }, sell_price: 35, buy_price: 50 },
];

export interface Quest {
  key: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  reward: {
    xp: number;
    gold: number;
  };
  rarity_min?: string;
  rarity_exact?: string;
  requires_modified?: number | boolean;  // number (0/1) or boolean
  requires_no_bait?: boolean;
  requires_no_rod?: boolean;
  requires_no_hook?: boolean;
  time_of_day?: string | null;
  zone?: string | null;                   // Added optional zone
  weather?: string | null;
  condition?: null;
}

export const quests: Quest[] = [
  // Daily quests (6)
  {
    key: 'daily_catch_10',
    description: 'Catch 10 fish',
    target: 10,
    type: 'daily',
    reward: { xp: 10, gold: 1000 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'daily_catch_2_rarePlus',
    description: 'Catch 2 rare or higher fish',
    target: 2,
    type: 'daily',
    reward: { xp: 15, gold: 1200 },
    rarity_min: 'rare',
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'daily_catch_1_epicPlus',
    description: 'Catch 1 epic or higher fish',
    target: 1,
    type: 'daily',
    reward: { xp: 20, gold: 1500 },
    rarity_min: 'epic',
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'daily_no_bait_catch_5',
    description: 'Catch 5 fish without bait equipped',
    target: 5,
    type: 'daily',
    reward: { xp: 12, gold: 1100 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: true,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'daily_rainy_weather_catch_3',
    description: 'Catch 3 fish during rainy weather',
    target: 3,
    type: 'daily',
    reward: { xp: 18, gold: 1400 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: 'rainy',
    condition: null,
  },
  {
    key: 'daily_zone_jungle_catch_7',
    description: 'Catch 7 fish in Jungle zone',
    target: 7,
    type: 'daily',
    reward: { xp: 14, gold: 1300 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: 'Jungle',
    weather: null,
    condition: null,
  },

  // Weekly quests (6)
  {
    key: 'weekly_catch_50',
    description: 'Catch 50 fish',
    target: 50,
    type: 'weekly',
    reward: { xp: 70, gold: 10000 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'weekly_catch_8_rarePlus',
    description: 'Catch 8 rare or higher fish',
    target: 8,
    type: 'weekly',
    reward: { xp: 75, gold: 10500 },
    rarity_min: 'rare',
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'weekly_catch_3_epicPlus',
    description: 'Catch 3 epic or higher fish',
    target: 3,
    type: 'weekly',
    reward: { xp: 80, gold: 11000 },
    rarity_min: 'epic',
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'weekly_night_catch_10',
    description: 'Catch 10 fish at night',
    target: 10,
    type: 'weekly',
    reward: { xp: 72, gold: 10200 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: 'night',
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'weekly_no_hook_catch_5',
    description: 'Catch 5 fish without hook equipped',
    target: 5,
    type: 'weekly',
    reward: { xp: 74, gold: 10300 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: true,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'weekly_zone_ocean_catch_12',
    description: 'Catch 12 fish in Ocean zone',
    target: 12,
    type: 'weekly',
    reward: { xp: 77, gold: 10700 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: 'Ocean',
    weather: null,
    condition: null,
  },

  // Monthly quests (6)
  {
    key: 'monthly_catch_300',
    description: 'Catch 300 fish',
    target: 300,
    type: 'monthly',
    reward: { xp: 500, gold: 50000 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'monthly_catch_2_legendary',
    description: 'Catch 2 legendary fish',
    target: 2,
    type: 'monthly',
    reward: { xp: 550, gold: 52000 },
    rarity_min: undefined,
    rarity_exact: 'legendary',
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'monthly_catch_2_modified',
    description: 'Catch 2 modified fish',
    target: 2,
    type: 'monthly',
    reward: { xp: 600, gold: 53000 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 1,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'monthly_river_zone_catch_20',
    description: 'Catch 20 fish in the River zone',
    target: 20,
    type: 'monthly',
    reward: { xp: 650, gold: 54000 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: 'River',
    weather: null,
    condition: null,
  },
  {
    key: 'monthly_no_rod_catch_15',
    description: 'Catch 15 fish without rod equipped',
    target: 15,
    type: 'monthly',
    reward: { xp: 700, gold: 55000 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: true,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: null,
    condition: null,
  },
  {
    key: 'monthly_sunny_weather_catch_10',
    description: 'Catch 10 fish during sunny weather',
    target: 10,
    type: 'monthly',
    reward: { xp: 900, gold: 59000 },
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: 'sunny',
    condition: null,
  },
];