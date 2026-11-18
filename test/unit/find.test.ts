import { describe, expect, it } from 'vitest';

import { findClocks } from '@polish/clock';
import { findDates, withoutDates } from '@polish/find';
import { dateSpanIn } from '@polish/span';

const TEXT = 'Środa, 9 grudnia 2026, godz. 18.30 oraz 12.12.2026';

describe('findDates', () => {
  it('gives every date with where it stands, in order', () => {
    const found = findDates(TEXT, { tolerant: true });

    expect(found).toEqual([
      { start: '2026-12-09', end: '2026-12-09', index: 0, length: 21 },
      { start: '2026-12-12', end: '2026-12-12', index: 40, length: 10 },
    ]);
    expect(TEXT.slice(found[0].index, found[0].index + found[0].length)).toBe(
      'Środa, 9 grudnia 2026',
    );
    expect(TEXT.slice(found[1].index)).toBe('12.12.2026');
  });

  it('reads the same date as dateSpanIn', () => {
    const [{ index, length, ...span }] = findDates(TEXT);

    expect(span).toEqual(dateSpanIn(TEXT));
    expect(index + length).toBeGreaterThan(0);
  });

  it('gives nothing when there is no date', () => {
    expect(findDates('Kraków, godz. 18.30')).toEqual([]);
  });

  it('skips a date that does not exist and goes on', () => {
    expect(
      findDates('31.02.2026 i 12.12.2026').map(({ index }) => index),
    ).toEqual([13]);
  });

  it('reads a date without a year when today is given, and the words around', () => {
    const text = 'jutro, a 5 grudnia, godz. 9.05';

    expect(findDates(text, { today: '2026-11-18' })).toEqual([
      { start: '2026-11-19', end: '2026-11-19', index: 0, length: 5 },
      { start: '2026-12-05', end: '2026-12-05', index: 9, length: 9 },
    ]);
  });

  it('points into the original text when a tolerant read corrects it', () => {
    const text = 'Sala 2: 5grudnia2026, potem 7 grudznia 2026!';
    const found = findDates(text, { tolerant: true });

    expect(found.map(({ start }) => start)).toEqual([
      '2026-12-05',
      '2026-12-07',
    ]);
    expect(
      found.map(({ index, length }) => text.slice(index, index + length)),
    ).toEqual(['5grudnia2026', '7 grudznia 2026']);
  });

  it('keeps the positions when the text has combining letters', () => {
    const text = 'Piątek 4 grudnia 2026';
    const [found] = findDates(text, { tolerant: true });

    expect(text.slice(found.index, found.index + found.length)).toBe(text);
  });
});

describe('withoutDates', () => {
  it('leaves what is not a date', () => {
    expect(withoutDates(TEXT, { tolerant: true })).toBe(', godz. 18.30 oraz ');
  });

  it('gives the text back when there is no date', () => {
    expect(withoutDates('Kraków')).toBe('Kraków');
  });
});

describe('findClocks', () => {
  it('gives each clock with where it stands', () => {
    expect(findClocks('od 9.05 do 17:30, 25.00')).toEqual([
      { clock: [9, 5], index: 3, length: 4 },
      { clock: [17, 30], index: 11, length: 5 },
    ]);
  });
});

describe('a date after a clock and do', () => {
  it('finds the date after a clock', () => {
    expect(findDates('od 11:00 do 30.08.2026')).toMatchObject([
      { start: '2026-08-30', end: '2026-08-30' },
    ]);
    expect(
      findDates('godz. 11:00 do 30.08.2026', { tolerant: true }),
    ).toMatchObject([{ start: '2026-08-30', end: '2026-08-30' }]);
  });

  it('finds both dates around clocks', () => {
    expect(
      findDates('28.08.2026 od godz. 11:00 do 30.08.2026 do godz. 15:00', {
        tolerant: true,
      }),
    ).toMatchObject([
      { start: '2026-08-28', end: '2026-08-28' },
      { start: '2026-08-30', end: '2026-08-30' },
    ]);
  });
});
