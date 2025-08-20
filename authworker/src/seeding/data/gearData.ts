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