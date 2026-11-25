/** The months as they stand in a date, in the genitive. */
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

/** The genitive months joined with `|`, for a regular expression. */
export const MONTH_PATTERN = POLISH_MONTHS.join('|');

/** 1 to 12 for a genitive month, `0` for any other word. */
export const monthNumber = (name: string): number =>
  POLISH_MONTHS.findIndex((month) => month === name.toLowerCase()) + 1;
