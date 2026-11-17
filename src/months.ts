export const POLISH_MONTHS = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
] as const;

export const MONTH_PATTERN = POLISH_MONTHS.join('|');

export const monthNumber = (name: string): number =>
  POLISH_MONTHS.findIndex((month) => month === name.toLowerCase()) + 1;
