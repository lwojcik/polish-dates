import { describe, expect, it } from 'vitest';

import { parseDate } from '@polish/parse';

const today = { today: '2026-11-18' };

describe('parseDate', () => {
  it.each([
    [
      'W dniach 23–27 listopada 2026 r., godz. 9.00 – 17:30',
      {
        start: '2026-11-23',
        end: '2026-11-27',
        times: [
          [9, 0],
          [17, 30],
        ],
      },
    ],
    [
      'Sobota, 5 grudnia 2026 o godz. 18',
      { start: '2026-12-05', end: '2026-12-05', times: [[18, 0]] },
    ],
    [
      '2026-12-05T18:45',
      { start: '2026-12-05', end: '2026-12-05', times: [[18, 45]] },
    ],
    [
      '04.12.2026, 19:00',
      { start: '2026-12-04', end: '2026-12-04', times: [[19, 0]] },
    ],
    [
      '5 i 6 grudnia 2026',
      { start: '2026-12-05', end: '2026-12-06', times: [] },
    ],
  ])('reads %s', (text, expected) => {
    expect(parseDate(text)).toEqual(expected);
  });

  it('reads a date against today, with the time', () => {
    expect(parseDate('jutro o godz. 18:30', today)).toEqual({
      start: '2026-11-19',
      end: '2026-11-19',
      times: [[18, 30]],
    });
    expect(parseDate('niedziela 5.12, godz. 10.15', today)).toEqual({
      start: '2027-12-05',
      end: '2027-12-05',
      times: [[10, 15]],
    });
  });

  it('gives the time alone when there is no date', () => {
    expect(parseDate('godz. 17.30')).toEqual({
      start: null,
      end: null,
      times: [[17, 30]],
    });
  });

  it('does not take the day and the month of a date for a time', () => {
    expect(parseDate('5.12 oraz 04.12.2026', today).times).toEqual([]);
  });

  it('gives nothing for a text without a date or a time', () => {
    expect(parseDate('wkrótce')).toEqual({ start: null, end: null, times: [] });
    expect(parseDate('')).toEqual({ start: null, end: null, times: [] });
    expect(parseDate('24:00 25:61')).toEqual({
      start: null,
      end: null,
      times: [],
    });
  });

  describe('with a time without godz.', () => {
    it.each([
      ['o 17.30', [[17, 30]]],
      ['10.00', [[10, 0]]],
      ['10:00', [[10, 0]]],
      [
        'od 9.00 do 17.30',
        [
          [9, 0],
          [17, 30],
        ],
      ],
      [
        'od 9.05 do 17.30',
        [
          [9, 5],
          [17, 30],
        ],
      ],
      [
        'godz. 10.00 -11:30 i 9.05',
        [
          [10, 0],
          [11, 30],
          [9, 5],
        ],
      ],
      ['5 grudnia 2026 o 18.15', [[18, 15]]],
      ['04.12.2026 18.30', [[18, 30]]],
      ['24.00 12.60', []],
    ])('reads %s', (text, times) => {
      expect(parseDate(text).times).toEqual(times);
    });

    it('reads it beside a date that has no year too', () => {
      expect(parseDate('jutro o 18.00', today)).toEqual({
        start: '2026-11-19',
        end: '2026-11-19',
        times: [[18, 0]],
      });
    });

    it('skips what may as well be a day and a month, or a price', () => {
      expect(parseDate('o 9.05').times).toEqual([]);
      expect(parseDate('5.12').times).toEqual([]);
      expect(parseDate('od 5.12 do 7.12', today).times).toEqual([]);
      expect(parseDate('od 23.11 do 27.11.2026').times).toEqual([]);
      expect(parseDate('23.11–27.11').times).toEqual([]);
      [
        '12.50 zł',
        '12.50 zl',
        '12.50 PLN',
        '12.50pln',
        '12.50 złotych',
        '12.50 USD',
        '12.50 dolarów',
        '12.50 $',
        '$12.50',
        '12.50 EUR',
        '12.50 euro',
        '€12.50',
        '12.50 GBP',
        '12.50 funtów',
        '12.50 CHF',
        '12.50 franków',
        'PLN 12.50',
        'USD 12.50',
        '12.50%',
      ].forEach((text) => expect(parseDate(text).times).toEqual([]));
    });
  });

  it('still reads a time followed by a word that only starts like a currency', () => {
    expect(parseDate('o 12.50 zlecenie').times).toEqual([[12, 50]]);
    expect(parseDate('o 12.50 eurostar').times).toEqual([[12, 50]]);
  });

  it('does not take a price for a day and a month', () => {
    ['12.05 PLN', '9.10 dolarów', '12.05 euro', '$12.05', 'PLN 12.05'].forEach(
      (text) =>
        expect(parseDate(text, today)).toEqual({
          start: null,
          end: null,
          times: [],
        }),
    );
  });

  describe('with a currency code or a time zone', () => {
    it.each(['SEK', 'NOK', 'JPY', 'CAD', 'CZK', 'UAH', 'XYZ', 'ABC'])(
      'skips 12.50 %s as a price',
      (code) => {
        expect(parseDate(`12.50 ${code}`).times).toEqual([]);
        expect(parseDate(`${code} 12.50`).times).toEqual([]);
        expect(parseDate(`12.05 ${code}`, today)).toEqual({
          start: null,
          end: null,
          times: [],
        });
      },
    );

    it.each([
      'UTC',
      'GMT',
      'CET',
      'CEST',
      'EST',
      'PST',
      'utc',
      'UTC+1',
      'GMT-5',
    ])('reads 12.50 %s as a time', (zone) => {
      expect(parseDate(`12.50 ${zone}`).times).toEqual([[12, 50]]);
      expect(parseDate(`o 12.50${zone}`).times).toEqual([[12, 50]]);
    });

    it('reads a time that could be a day and a month when a zone follows it', () => {
      expect(parseDate('12.05 UTC', today)).toEqual({
        start: null,
        end: null,
        times: [[12, 5]],
      });
      expect(parseDate('9.05 GMT').times).toEqual([[9, 5]]);
      expect(parseDate('od 9.00 do 17.00 CET').times).toEqual([
        [9, 0],
        [17, 0],
      ]);
    });

    it('takes a code of any three capitals, but not three small letters', () => {
      expect(parseDate('12.50 xyz').times).toEqual([[12, 50]]);
      expect(parseDate('12.50 dla').times).toEqual([[12, 50]]);
    });

    it('does not take an all-capitals word for a currency', () => {
      expect(parseDate('9.00 LUB 10.00').times).toEqual([
        [9, 0],
        [10, 0],
      ]);
      expect(parseDate('KONCERT 18.30').times).toEqual([[18, 30]]);
    });
  });

  describe('with the tolerant flag', () => {
    const tolerant = { tolerant: true };

    it('reads a comma after godz.', () => {
      expect(parseDate('godz. 18,30', tolerant).times).toEqual([[18, 30]]);
      expect(parseDate('godz. 9,00 - 17,30', tolerant).times).toEqual([
        [9, 0],
        [17, 30],
      ]);
    });

    it('reads everything at once', () => {
      expect(
        parseDate('Sroda, 9 grudznia 2026, godz. 18,30', tolerant),
      ).toEqual({ start: '2026-12-09', end: '2026-12-09', times: [[18, 30]] });
    });

    it('reads only the hour before a comma without the flag', () => {
      expect(parseDate('godz. 18,30').times).toEqual([[18, 0]]);
    });
  });
});
