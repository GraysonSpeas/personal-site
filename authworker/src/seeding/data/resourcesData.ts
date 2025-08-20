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

  // bait resources
  // merchant only
  { species: 'bait_resource', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, buy_price: 50, zones: ['Lava'], rarity: 'rare', barType: 'middle', time_of_day: null, weather: null },
];