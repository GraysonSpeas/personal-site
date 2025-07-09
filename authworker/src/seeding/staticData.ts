export const weatherTypes = [
	{ description: 'Sunny' },
	{ description: 'Rainy' },
];

export const zoneTypes = [
  { name: 'Jungle', xp_multiplier: 1.0 },
  { name: 'Ocean', xp_multiplier: 1.1 },
  { name: 'River', xp_multiplier: 1.2 },
  { name: 'Lava', xp_multiplier: 1.3 },
];

export const resourceTypes = [
  { species: 'Shells', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle'], rarity: 'common', barType: 'middle' },
  { species: 'Rare herbs', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle', 'River'], rarity: 'common', barType: 'middle' },
  { species: 'Berries', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Ocean'], rarity: 'common', barType: 'low' },
  { species: 'Algae', base_weight: 100, base_length: 100, stamina: 100, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Lava'], rarity: 'common', barType: 'dynamicLarge' }
];

export const fishTypes = [
  // common (existing)
  { species: 'Clownfish', base_weight: 1.2, base_length: 10.5, stamina: 150, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 100, zones: ['Jungle'], rarity: 'common', barType: 'middle' },
  { species: 'Bass', base_weight: 4.5, base_length: 20.3, stamina: 150, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 200, zones: ['Jungle', 'River'], rarity: 'common', barType: 'middle' },
  { species: 'Catfish', base_weight: 5.0, base_length: 25.0, stamina: 150, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 250, zones: ['Ocean'], rarity: 'common', barType: 'high' },
  { species: 'Lavafish', base_weight: 3.0, base_length: 15.0, stamina: 150, tug_strength: 100, direction_change_rate: 100, change_strength: 100, sell_price: 300, zones: ['Lava'], rarity: 'common', barType: 'dynamicLarge' },

  // uncommon
  { species: 'Bluegill', base_weight: 2.0, base_length: 12.0, stamina: 170, tug_strength: 110, direction_change_rate: 120, change_strength: 115, sell_price: 150, zones: ['River'], rarity: 'uncommon', barType: 'middle' },
  { species: 'Rainbow Trout', base_weight: 3.5, base_length: 18.0, stamina: 160, tug_strength: 130, direction_change_rate: 105, change_strength: 120, sell_price: 180, zones: ['River', 'Lake'], rarity: 'uncommon', barType: 'high' },

  // rare
  { species: 'Golden Carp', base_weight: 6.0, base_length: 28.0, stamina: 200, tug_strength: 150, direction_change_rate: 90, change_strength: 130, sell_price: 500, zones: ['Lake'], rarity: 'rare', barType: 'dynamicSmall' },
  { species: 'Electric Eel', base_weight: 7.5, base_length: 30.0, stamina: 210, tug_strength: 160, direction_change_rate: 80, change_strength: 140, sell_price: 600, zones: ['River'], rarity: 'rare', barType: 'dynamicLarge' },

  // epic
  { species: 'Dragonfish', base_weight: 10.0, base_length: 40.0, stamina: 250, tug_strength: 200, direction_change_rate: 70, change_strength: 160, sell_price: 1000, zones: ['Lava'], rarity: 'epic', barType: 'high' },
  { species: 'Leviathan', base_weight: 15.0, base_length: 55.0, stamina: 300, tug_strength: 250, direction_change_rate: 60, change_strength: 180, sell_price: 1500, zones: ['Ocean'], rarity: 'epic', barType: 'dynamicLarge' },
];

export const rodTypes = [
  { id: 1, name: 'Rusty Rod', stats: { focus: 25, lineTension: 25, luck: 0 } },
];

export const hookTypes = [
  { id: 1, name: 'Rusty Hook', stats: { focus: 25, lineTension: 25, luck: 0 } },
];

export const baitTypes = [
  { id: 1, name: 'Broken Bait', stats: { focus: 10, lineTension: 10, luck: 0 }, sell_price: 1 },
];

export interface Quest {
  key: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
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
  {
    key: 'daily_catch_10',
    description: 'Catch 10 fish',
    target: 10,
    type: 'daily',
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
    key: 'weekly_catch_50',
    description: 'Catch 50 fish',
    target: 50,
    type: 'weekly',
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
    key: 'monthly_catch_300',
    description: 'Catch 300 fish',
    target: 300,
    type: 'monthly',
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
    key: 'daily_no_bait_catch_5',
    description: 'Catch 5 fish without bait equipped',
    target: 5,
    type: 'daily',
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
    key: 'weekly_night_catch_10',
    description: 'Catch 10 fish at night',
    target: 10,
    type: 'weekly',
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
    key: 'monthly_river_zone_catch_20',
    description: 'Catch 20 fish in the River zone',
    target: 20,
    type: 'monthly',
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
    key: 'daily_rainy_weather_catch_3',
    description: 'Catch 3 fish during rainy weather',
    target: 3,
    type: 'daily',
    rarity_min: undefined,
    rarity_exact: undefined,
    requires_modified: 0,
    requires_no_bait: false,
    requires_no_rod: false,
    requires_no_hook: false,
    time_of_day: null,
    zone: null,
    weather: 'Rainy',
    condition: null,
  },
];