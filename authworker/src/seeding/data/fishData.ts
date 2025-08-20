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