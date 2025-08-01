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

export const consumableTypes = [
  {
    id: 1,
    name: 'Blue Bull',
    description: 'focus +15% bait save +5%',
    effect: 'focus +15%, bait +5%',
    duration: 300,
    sell_price: 100,
  },
  {
    id: 2,
    name: 'Gum',
    description: '100% bait save',
    effect: 'bait +100%',
    duration: 300,
    sell_price: 150,
  },
  {
    id: 3,
    name: 'Angler',
    description: '3% rare catch boost',
    effect: 'luck +3%',
    duration: 300,
    sell_price: 200,
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
  { id: 1, name: 'Rusty Rod', stats: { focus: 25, lineTension: 25, luck: 0 } },
  { id: 2, name: 'Simple Rod', stats: { focus: 5, lineTension: 5, luck: 5 } },
];

export const hookTypes = [
  { id: 1, name: 'Rusty Hook', stats: { focus: 25, lineTension: 25, luck: 0 } },
  { id: 2, name: 'Simple Hook', stats: { focus: 5, lineTension: 5, luck: 5 } },
];

export const baitTypes = [
  { id: 1, name: 'Broken Bait', stats: { focus: 10, lineTension: 10, luck: 0 }, sell_price: 50 },
  { id: 2, name: 'Simple Bait', stats: { focus: 5, lineTension: 5, luck: 5 }, sell_price: 25 },
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