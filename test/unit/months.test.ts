import { describe, expect, it } from 'vitest';

import { MONTH_PATTERN, monthNumber, POLISH_MONTHS } from '@polish/months';

describe('monthNumber', () => {
  it('numbers the genitive month names from 1, in any case', () => {
    expect(POLISH_MONTHS.map(monthNumber)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    expect(monthNumber('Września')).toBe(9);
  });

  it('gives 0 for a word that is not one, such as the nominative', () => {
    expect(monthNumber('wrzesień')).toBe(0);
  });

  it('has a pattern of all twelve for a regular expression', () => {
    expect(MONTH_PATTERN.split('|')).toHaveLength(12);
    expect(new RegExp(`^(?:${MONTH_PATTERN})$`).test('października')).toBe(
      true,
    );
  });
});
