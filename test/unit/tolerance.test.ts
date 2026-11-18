import { describe, expect, it } from 'vitest';

import { parseDate } from '@polish/parse';
import { dateSpanIn } from '@polish/span';

const tolerant = { tolerant: true };
const today = { today: '2026-11-18', tolerant: true };

const day = (date: string) => ({ start: date, end: date });

describe('tolerant reading', () => {
  describe('of words written without the Polish letters', () => {
    it.each([
      ['5 wrzesnia 2026', '2026-09-05'],
      ['12 pazdziernika 2026', '2026-10-12'],
      ['5 WRZESNIA 2026', '2026-09-05'],
      ['sroda, 9 grudnia 2026', '2026-12-09'],
      ['w srode 9 grudnia 2026', '2026-12-09'],
      ['sr. 9.12.2026', '2026-12-09'],
      ['w sobote, 5 grudnia 2026', '2026-12-05'],
      ['5 września 2026', '2026-09-05'],
      ['5 września 2026', '2026-09-05'],
    ])('reads %s', (text, date) => {
      expect(dateSpanIn(text, tolerant)).toEqual(day(date));
    });

    it('keeps a weekday that does not fit as an error', () => {
      expect(dateSpanIn('w niedziele 5 grudnia 2026', tolerant)).toBeNull();
    });

    it('reads the words for a day', () => {
      expect(dateSpanIn('dzis', today)).toEqual(day('2026-11-18'));
      expect(dateSpanIn('w piatek', today)).toEqual(day('2026-11-20'));
      expect(dateSpanIn('w przyszly piatek', today)).toEqual(day('2026-11-27'));
      expect(dateSpanIn('za piec dni', today)).toEqual(day('2026-11-23'));
      expect(dateSpanIn('w zeszly weekend', today)).toEqual({
        start: '2026-11-14',
        end: '2026-11-15',
      });
      expect(dateSpanIn('17 listopada biezacego roku', today)).toEqual(
        day('2026-11-17'),
      );
    });
  });

  describe('of a month with one letter wrong', () => {
    it.each([
      ['5 grudznia 2026', '2026-12-05'],
      ['5 grudni 2026', '2026-12-05'],
      ['5 listpada 2026', '2026-11-05'],
      ['5 listopad 2026', '2026-11-05'],
      ['5 lstopada 2026', '2026-11-05'],
      ['5 stycznai 2026', '2026-01-05'],
      ['5 kwietnai 2026', '2026-04-05'],
      ['5 wrzesnai 2026', '2026-09-05'],
      ['5 GRUDNAI 2026', '2026-12-05'],
    ])('reads %s', (text, date) => {
      expect(dateSpanIn(text, tolerant)).toEqual(day(date));
    });

    it('reads it in a range and a list', () => {
      expect(dateSpanIn('30 listoapda - 2 grudnia 2026', tolerant)).toEqual({
        start: '2026-11-30',
        end: '2026-12-02',
      });
      expect(dateSpanIn('5 i 6 grudnai 2026', tolerant)).toEqual({
        start: '2026-12-05',
        end: '2026-12-06',
      });
    });

    it('leaves a word that is not near a month alone', () => {
      expect(dateSpanIn('5 dzieci 2026', tolerant)).toBeNull();
      expect(dateSpanIn('2 lutowy 2026', tolerant)).toBeNull();
      expect(dateSpanIn('5 majo 2026', tolerant)).toBeNull();
    });

    it('reads the word after a number only', () => {
      expect(dateSpanIn('grudznia 5 2026', tolerant)).toBeNull();
    });
  });

  describe('of spaces and dots around a month', () => {
    it.each([
      '5grudnia2026',
      '5 grudnia2026',
      '5grudnia 2026',
      '5. grudnia 2026',
      '5.grudnia 2026',
      '5.  grudnia   2026',
      '5 grudnia 2026',
    ])('reads %s', (text) => {
      expect(dateSpanIn(text, tolerant)).toEqual(day('2026-12-05'));
    });

    it('reads a range without the spaces', () => {
      expect(dateSpanIn('23–27grudnia2026', tolerant)).toEqual({
        start: '2026-12-23',
        end: '2026-12-27',
      });
    });
  });

  describe('of the separators of a date in digits', () => {
    it.each([
      ['17,07.2026', '2026-07-17'],
      ['17.07,2026', '2026-07-17'],
      ['17,07,2026', '2026-07-17'],
      ['5. 12. 2026', '2026-12-05'],
      ['05-12-2026', '2026-12-05'],
      ['5-12-2026', '2026-12-05'],
      ['5/12.2026', '2026-12-05'],
      ['02..08.2025', '2025-08-02'],
      ['17,,07.2026', '2026-07-17'],
      ['17.07..2026', '2026-07-17'],
      ['5:12:2026', '2026-12-05'],
      ['5.,12,.2026', '2026-12-05'],
    ])('reads %s', (text, date) => {
      expect(dateSpanIn(text, tolerant)).toEqual(day(date));
    });

    it('reads a date with a doubled separator beside a clock', () => {
      expect(parseDate('02..08.2025 r. godz. 17.00', tolerant)).toEqual({
        start: '2025-08-02',
        end: '2025-08-02',
        times: [[17, 0]],
      });
    });

    it('leaves a clock with a doubled separator unread', () => {
      expect(parseDate('o 19..00', tolerant).times).toEqual([]);
    });

    it('reads a range with a comma', () => {
      expect(dateSpanIn('23.11 – 27,11.2026', tolerant)).toEqual({
        start: '2026-11-23',
        end: '2026-11-27',
      });
    });

    it('still gives null for a day that does not exist', () => {
      expect(dateSpanIn('31,11.2026', tolerant)).toBeNull();
      expect(dateSpanIn('31-11-2026', tolerant)).toBeNull();
      expect(dateSpanIn('30 lutgo 2026', tolerant)).toBeNull();
    });

    it('does not take a list of numbers for a date', () => {
      expect(dateSpanIn('5, 12, 2026', tolerant)).toBeNull();
      expect(dateSpanIn('12,50 zł', today)).toBeNull();
    });
  });
});

describe('without the flag', () => {
  it.each([
    '5 wrzesnia 2026',
    '5 grudznia 2026',
    '5grudnia2026',
    '5. grudnia 2026',
    '17,07.2026',
    '5. 12. 2026',
    '05-12-2026',
    '02..08.2025',
  ])('does not read %s', (text) => {
    expect(dateSpanIn(text)).toBeNull();
    expect(dateSpanIn(text, { tolerant: false })).toBeNull();
  });

  it('does not read the words without the letters', () => {
    expect(dateSpanIn('dzis', { today: '2026-11-18' })).toBeNull();
    expect(dateSpanIn('w piatek', { today: '2026-11-18' })).toBeNull();
  });

  it('ignores a weekday without the letters', () => {
    expect(dateSpanIn('w niedziele 5 grudnia 2026')).toEqual(day('2026-12-05'));
  });
});
