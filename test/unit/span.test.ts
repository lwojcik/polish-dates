import { describe, expect, it } from 'vitest';

import { dateSpanIn } from '@polish/span';

describe('dateSpanIn', () => {
  it.each([
    ['W dniach 23–27 listopada 2026 odbędzie się', '2026-11-23', '2026-11-27'],
    ['23-27 listopada 2026', '2026-11-23', '2026-11-27'],
    ['5 i 6 grudnia 2026', '2026-12-05', '2026-12-06'],
    ['30 listopada - 2 grudnia 2026', '2026-11-30', '2026-12-02'],
    ['30 listopada 2025 – 2 grudnia 2026', '2025-11-30', '2026-12-02'],
    ['9 listopada 2026 o godz. 12', '2026-11-09', '2026-11-09'],
    ['Termin: 04.12.2026', '2026-12-04', '2026-12-04'],
    ['4 GRUDNIA 2026', '2026-12-04', '2026-12-04'],
  ])('reads %s', (text, start, end) => {
    expect(dateSpanIn(text)).toEqual({ start, end });
  });

  it('reads every dash a typist may use as a range', () => {
    ['‐', '–', '—', '―'].forEach((dash) =>
      expect(dateSpanIn(`23 ${dash} 27 listopada 2026`)).toEqual({
        start: '2026-11-23',
        end: '2026-11-27',
      }),
    );
  });

  it('does not guess a missing year', () => {
    expect(dateSpanIn('5 i 6 grudnia')).toBeNull();
    expect(dateSpanIn('30 listopada - 2 grudnia')).toBeNull();
  });

  it('gives null for a range that runs backwards or a day that does not exist', () => {
    expect(dateSpanIn('27-23 listopada 2026')).toBeNull();
    expect(dateSpanIn('30 lutego 2026')).toBeNull();
    expect(dateSpanIn('31.02.2026')).toBeNull();
    expect(dateSpanIn('1 - 31 listopada 2026')).toBeNull();
  });

  it('gives null when there is no date', () => {
    expect(dateSpanIn('wkrótce')).toBeNull();
    expect(dateSpanIn('')).toBeNull();
  });
});
