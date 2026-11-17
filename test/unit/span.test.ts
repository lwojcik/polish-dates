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

  describe('with od … do', () => {
    it.each([
      ['od 23 do 27 listopada 2026', '2026-11-23', '2026-11-27'],
      ['Od 23 do 27 listopada 2026 r.', '2026-11-23', '2026-11-27'],
      ['od 30 listopada do 2 grudnia 2026', '2026-11-30', '2026-12-02'],
      ['od 30 listopada 2025 do 2 grudnia 2026', '2025-11-30', '2026-12-02'],
      ['od 23.11.2026 do 27.11.2026', '2026-11-23', '2026-11-27'],
    ])('reads %s', (text, start, end) => {
      expect(dateSpanIn(text)).toEqual({ start, end });
    });

    it('gives null for a range that runs backwards', () => {
      expect(dateSpanIn('od 27 do 23 listopada 2026')).toBeNull();
    });
  });

  describe('with a list of days', () => {
    it.each([
      ['5, 6 i 7 grudnia 2026', '2026-12-05', '2026-12-07'],
      ['5, 6, 7 grudnia 2026', '2026-12-05', '2026-12-07'],
      ['5, 12 i 19 grudnia 2026', '2026-12-05', '2026-12-19'],
      ['5,6 i 7 grudnia 2026', '2026-12-05', '2026-12-07'],
    ])(
      'reads %s as the span from the first to the last day',
      (text, start, end) => {
        expect(dateSpanIn(text)).toEqual({ start, end });
      },
    );

    it('gives null when a day of the list does not exist or does not follow', () => {
      expect(dateSpanIn('5, 31 i 7 listopada 2026')).toBeNull();
      expect(dateSpanIn('7, 6 i 5 grudnia 2026')).toBeNull();
    });
  });

  describe('with a year suffix and a time', () => {
    it.each([
      ['5 grudnia 2026 r.', '2026-12-05', '2026-12-05'],
      ['5 grudnia 2026 roku', '2026-12-05', '2026-12-05'],
      ['5 grudnia 2026 r. o godz. 18:00', '2026-12-05', '2026-12-05'],
      ['23–27 listopada 2026 r. godz. 9.00', '2026-11-23', '2026-11-27'],
      ['5 grudnia 2026r.', '2026-12-05', '2026-12-05'],
    ])('reads %s', (text, start, end) => {
      expect(dateSpanIn(text)).toEqual({ start, end });
    });

    it('does not take the hour for a day or a year', () => {
      expect(dateSpanIn('godz. 18.00, 5 grudnia 2026')).toEqual({
        start: '2026-12-05',
        end: '2026-12-05',
      });
    });
  });

  describe('with a numeric range', () => {
    it.each([
      ['23.11–27.11.2026', '2026-11-23', '2026-11-27'],
      ['23.11 - 27.11.2026', '2026-11-23', '2026-11-27'],
      ['23-27.11.2026', '2026-11-23', '2026-11-27'],
      ['23–27.11.2026 r.', '2026-11-23', '2026-11-27'],
      ['23.11.2026 - 27.11.2026', '2026-11-23', '2026-11-27'],
      ['30.11–2.12.2026', '2026-11-30', '2026-12-02'],
      ['30.11.2025 – 2.12.2026', '2025-11-30', '2026-12-02'],
    ])('reads %s', (text, start, end) => {
      expect(dateSpanIn(text)).toEqual({ start, end });
    });

    it('gives null for a numeric range that runs backwards or does not exist', () => {
      expect(dateSpanIn('27-23.11.2026')).toBeNull();
      expect(dateSpanIn('1-31.11.2026')).toBeNull();
      expect(dateSpanIn('1.12–30.11.2026')).toBeNull();
    });
  });

  describe('with other numeric forms of one day', () => {
    it.each([
      ['5.12.2026', '2026-12-05'],
      ['Termin: 5.12.2026 r.', '2026-12-05'],
      ['05/12/2026', '2026-12-05'],
      ['5/12/2026', '2026-12-05'],
      ['2026-12-05', '2026-12-05'],
      ['05.12.26', '2026-12-05'],
      ['5.12.26 r.', '2026-12-05'],
      ['5 XII 2026', '2026-12-05'],
      ['5 xii 2026 r.', '2026-12-05'],
      ['23 XI 2026', '2026-11-23'],
    ])('reads %s', (text, day) => {
      expect(dateSpanIn(text)).toEqual({ start: day, end: day });
    });

    it('reads a range with a Roman-numeral month', () => {
      expect(dateSpanIn('23–27 XI 2026')).toEqual({
        start: '2026-11-23',
        end: '2026-11-27',
      });
      expect(dateSpanIn('30 XI – 2 XII 2026')).toEqual({
        start: '2026-11-30',
        end: '2026-12-02',
      });
    });

    it('gives null for a day or a month that does not exist', () => {
      expect(dateSpanIn('5/13/2026')).toBeNull();
      expect(dateSpanIn('2026-02-30')).toBeNull();
      expect(dateSpanIn('5 XIII 2026')).toBeNull();
    });
  });
});
