/** Shop odds available before a game starts. Values are percentages. */
export const SHOP_ODDS: Array<{ level: number; odds: [number, number, number, number, number] }> = [
  { level: 1, odds: [100, 0, 0, 0, 0] },
  { level: 2, odds: [100, 0, 0, 0, 0] },
  { level: 3, odds: [75, 25, 0, 0, 0] },
  { level: 4, odds: [55, 30, 15, 0, 0] },
  { level: 5, odds: [45, 33, 20, 2, 0] },
  { level: 6, odds: [30, 40, 25, 5, 0] },
  { level: 7, odds: [19, 30, 40, 10, 1] },
  { level: 8, odds: [18, 25, 32, 22, 3] },
  { level: 9, odds: [10, 20, 25, 35, 10] },
  { level: 10, odds: [5, 10, 20, 40, 25] },
  { level: 11, odds: [1, 2, 12, 50, 35] },
];
