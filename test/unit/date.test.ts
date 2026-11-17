import { describe, expect, it } from 'vitest';

import { dateOn } from '@polish/date';

const viaDate = ({
  year,
  month,
  day,
}: {
  year: number;
  month: number;
  day: number;
}) => {
  const date = new Date(0);

  date.setUTCFullYear(year, month - 1, day);

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? date.toISOString().slice(0, 10)
    : null;
};

describe('dateOn', () => {
  it('gives a valid day as a date', () => {
    expect(dateOn({ year: 2026, month: 11, day: 9 })).toBe('2026-11-09');
    expect(dateOn({ year: 26, month: 1, day: 5 })).toBe('0026-01-05');
  });

  it('gives null for a day the month does not have', () => {
    expect(dateOn({ year: 2026, month: 2, day: 30 })).toBeNull();
    expect(dateOn({ year: 2026, month: 13, day: 1 })).toBeNull();
    expect(dateOn({ year: 2026, month: 0, day: 1 })).toBeNull();
    expect(dateOn({ year: 2026, month: 4, day: 31 })).toBeNull();
    expect(dateOn({ year: 2026, month: 4, day: 0 })).toBeNull();
  });

  it('knows the leap years', () => {
    expect(dateOn({ year: 2028, month: 2, day: 29 })).toBe('2028-02-29');
    expect(dateOn({ year: 2027, month: 2, day: 29 })).toBeNull();
    expect(dateOn({ year: 2000, month: 2, day: 29 })).toBe('2000-02-29');
    expect(dateOn({ year: 1900, month: 2, day: 29 })).toBeNull();
  });

  it('refuses what is not a whole number or is negative', () => {
    expect(dateOn({ year: 2026, month: 1.5, day: 1 })).toBeNull();
    expect(dateOn({ year: 2026.5, month: 1, day: 1 })).toBeNull();
    expect(dateOn({ year: 2026, month: 1, day: 0.5 })).toBeNull();
    expect(dateOn({ year: -1, month: 1, day: 1 })).toBeNull();
    expect(dateOn({ year: Number.NaN, month: 1, day: 1 })).toBeNull();
  });

  it('agrees with the built-in Date on every day of 1900 to 2100', () => {
    const years = Array.from({ length: 201 }, (_, index) => 1900 + index);
    const months = Array.from({ length: 14 }, (_, index) => index);
    const days = Array.from({ length: 33 }, (_, index) => index);
    const mismatches = years.flatMap((year) =>
      months.flatMap((month) =>
        days
          .filter(
            (day) =>
              dateOn({ year, month, day }) !== viaDate({ year, month, day }),
          )
          .map((day) => `${year}-${month}-${day}`),
      ),
    );

    expect(mismatches).toEqual([]);
  });
});
