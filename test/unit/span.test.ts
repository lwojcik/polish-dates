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

  describe('with today, for a date without a year', () => {
    const today = { today: '2026-11-18' };

    it.each([
      ['5 grudnia', '2026-12-05', '2026-12-05'],
      ['w sobotę 5 grudnia', '2026-12-05', '2026-12-05'],
      ['5 XII', '2026-12-05', '2026-12-05'],
      ['5 i 6 grudnia', '2026-12-05', '2026-12-06'],
      ['23–27 listopada', '2026-11-23', '2026-11-27'],
      ['od 23 do 27 listopada', '2026-11-23', '2026-11-27'],
      ['30 listopada - 2 grudnia', '2026-11-30', '2026-12-02'],
      ['5.12', '2026-12-05', '2026-12-05'],
      ['Termin: 5.12.', '2026-12-05', '2026-12-05'],
      ['23-27.11', '2026-11-23', '2026-11-27'],
      ['23.11–27.11', '2026-11-23', '2026-11-27'],
    ])('reads %s as the next time it comes', (text, start, end) => {
      expect(dateSpanIn(text, today)).toEqual({ start, end });
    });

    it('takes today for the next time, and a day gone by for the next year', () => {
      expect(dateSpanIn('18 listopada', today)).toEqual({
        start: '2026-11-18',
        end: '2026-11-18',
      });
      expect(dateSpanIn('17 listopada', today)).toEqual({
        start: '2027-11-17',
        end: '2027-11-17',
      });
      expect(dateSpanIn('5 stycznia', today)).toEqual({
        start: '2027-01-05',
        end: '2027-01-05',
      });
    });

    it('lets a range across the new year run into the next year', () => {
      expect(dateSpanIn('30 grudnia - 2 stycznia', today)).toEqual({
        start: '2026-12-30',
        end: '2027-01-02',
      });
      expect(dateSpanIn('30.12–2.01', today)).toEqual({
        start: '2026-12-30',
        end: '2027-01-02',
      });
    });

    it('skips to a year that has the day', () => {
      expect(dateSpanIn('29 lutego', today)).toEqual({
        start: '2028-02-29',
        end: '2028-02-29',
      });
    });

    it('leaves a date with a year where it stands', () => {
      expect(dateSpanIn('5 grudnia 2025', today)).toEqual({
        start: '2025-12-05',
        end: '2025-12-05',
      });
      expect(dateSpanIn('05.12.2025', today)).toEqual({
        start: '2025-12-05',
        end: '2025-12-05',
      });
    });

    it.each([
      ['17 listopada br.', '2026-11-17'],
      ['17 listopada w tym roku', '2026-11-17'],
      ['17 listopada bieżącego roku', '2026-11-17'],
      ['5 grudnia w przyszłym roku', '2027-12-05'],
      ['5 grudnia przyszłego roku', '2027-12-05'],
      ['5 grudnia w zeszłym roku', '2025-12-05'],
      ['5 grudnia w ubiegłym roku', '2025-12-05'],
    ])('reads the year from the words in %s', (text, day) => {
      expect(dateSpanIn(text, today)).toEqual({ start: day, end: day });
    });

    it('reads the year from the words for a range too', () => {
      expect(dateSpanIn('23–27 listopada w przyszłym roku', today)).toEqual({
        start: '2027-11-23',
        end: '2027-11-27',
      });
    });

    it('does not take a time of day or a price for a date', () => {
      expect(dateSpanIn('o godz. 10.12', today)).toBeNull();
      expect(dateSpanIn('godzina 9.05', today)).toBeNull();
      expect(dateSpanIn('o godz. 17.30', today)).toBeNull();
      expect(dateSpanIn('12.60 zł', today)).toBeNull();
    });

    it('still gives null for a day that does not exist or a range that runs backwards', () => {
      expect(dateSpanIn('31 listopada', today)).toBeNull();
      expect(dateSpanIn('30 lutego', today)).toBeNull();
      expect(dateSpanIn('27-23 listopada', today)).toBeNull();
      expect(dateSpanIn('31.11', today)).toBeNull();
    });

    it('gives null for a today that is not a date', () => {
      expect(dateSpanIn('5 grudnia', { today: 'jutro' })).toBeNull();
      expect(dateSpanIn('5 grudnia', { today: '2026-02-30' })).toBeNull();
      expect(dateSpanIn('5 grudnia 2026', { today: 'jutro' })).toEqual({
        start: '2026-12-05',
        end: '2026-12-05',
      });
    });
  });

  describe('without today, for a date without a year', () => {
    it.each([
      '5 grudnia',
      '5 grudnia br.',
      '5 grudnia w przyszłym roku',
      '5.12',
      '23-27.11',
    ])('gives null for %s', (text) => {
      expect(dateSpanIn(text)).toBeNull();
      expect(dateSpanIn(text, {})).toBeNull();
    });
  });

  describe('with a weekday beside a date', () => {
    it.each([
      ['pon., 7 grudnia 2026', '2026-12-07'],
      ['pn. 7.12.2026', '2026-12-07'],
      ['w poniedziałek 7 grudnia 2026', '2026-12-07'],
      ['we wtorek 8 grudnia 2026', '2026-12-08'],
      ['wt. 8.12.2026', '2026-12-08'],
      ['w środę 9 grudnia 2026', '2026-12-09'],
      ['śr. 9.12.2026', '2026-12-09'],
      ['w czwartek, 10 grudnia 2026', '2026-12-10'],
      ['czw. 10.12.2026', '2026-12-10'],
      ['pt., 4 grudnia 2026', '2026-12-04'],
      ['w piątek 4 grudnia 2026 r. o godz. 18', '2026-12-04'],
      ['w sobotę, 5 grudnia 2026', '2026-12-05'],
      ['sob. 5.12.2026', '2026-12-05'],
      ['sb. 5.12.2026', '2026-12-05'],
      ['w niedzielę 6 grudnia 2026', '2026-12-06'],
      ['niedz. 6.12.2026', '2026-12-06'],
      ['nd. 6.12.2026', '2026-12-06'],
      ['Sobota 5 GRUDNIA 2026', '2026-12-05'],
    ])('reads %s when the weekday fits', (text, day) => {
      expect(dateSpanIn(text)).toEqual({ start: day, end: day });
    });

    it('gives null when the weekday does not fit the date', () => {
      expect(dateSpanIn('w niedzielę 5 grudnia 2026')).toBeNull();
      expect(dateSpanIn('pt. 5.12.2026')).toBeNull();
      expect(dateSpanIn('wtorek 2026-12-05')).toBeNull();
    });

    it('does not take the start of another word for a weekday', () => {
      expect(dateSpanIn('ul. Sobieskiego 6 grudnia 2026')).toEqual({
        start: '2026-12-06',
        end: '2026-12-06',
      });
      expect(dateSpanIn('Standard: 5 grudnia 2026')).toEqual({
        start: '2026-12-05',
        end: '2026-12-05',
      });
    });

    it.each([
      ['pt. 4 – nd. 6 grudnia 2026', '2026-12-04', '2026-12-06'],
      ['pt. 4 - nd. 6 grudnia 2026', '2026-12-04', '2026-12-06'],
      ['od piątku 4 do niedzieli 6 grudnia 2026', '2026-12-04', '2026-12-06'],
      ['piątek–niedziela, 4–6 grudnia 2026', '2026-12-04', '2026-12-06'],
      ['sob. 5.12 - nd. 6.12.2026', '2026-12-05', '2026-12-06'],
      ['pt. 4 – nd. 6 grudnia', '2026-12-04', '2026-12-06'],
    ])('reads %s as a range', (text, start, end) => {
      expect(dateSpanIn(text, { today: '2026-11-18' })).toEqual({
        start,
        end,
      });
    });

    it('gives null when a weekday of a range does not fit', () => {
      expect(dateSpanIn('pt. 4 – pn. 6 grudnia 2026')).toBeNull();
      expect(dateSpanIn('sob. 4 – nd. 6 grudnia 2026')).toBeNull();
    });

    it('picks the next year the weekday fits for a date without a year', () => {
      const today = { today: '2026-11-18' };

      expect(dateSpanIn('sobota 5 grudnia', today)).toEqual({
        start: '2026-12-05',
        end: '2026-12-05',
      });
      expect(dateSpanIn('niedziela 5.12', today)).toEqual({
        start: '2027-12-05',
        end: '2027-12-05',
      });
      expect(dateSpanIn('we wtorek 5 grudnia', today)).toEqual({
        start: '2028-12-05',
        end: '2028-12-05',
      });
    });
  });

  describe('with a day named by a word', () => {
    const today = { today: '2026-11-18' };

    it.each([
      ['dziś', '2026-11-18'],
      ['Dzisiaj', '2026-11-18'],
      ['jutro', '2026-11-19'],
      ['JUTRO', '2026-11-19'],
      ['Koncert jutro o godz. 18:00', '2026-11-19'],
      ['pojutrze', '2026-11-20'],
      ['wczoraj', '2026-11-17'],
      ['przedwczoraj', '2026-11-16'],
      ['za 3 dni', '2026-11-21'],
      ['za dwa dni', '2026-11-20'],
      ['za tydzień', '2026-11-25'],
      ['za 2 tygodnie', '2026-12-02'],
      ['za 5 tygodni', '2026-12-23'],
      ['3 dni temu', '2026-11-15'],
      ['tydzień temu', '2026-11-11'],
      ['dwa tygodnie temu', '2026-11-04'],
    ])('reads %s', (text, day) => {
      expect(dateSpanIn(text, today)).toEqual({ start: day, end: day });
    });

    it('gives the day across the new year and the leap day', () => {
      expect(dateSpanIn('jutro', { today: '2026-12-31' })).toEqual({
        start: '2027-01-01',
        end: '2027-01-01',
      });
      expect(dateSpanIn('wczoraj', { today: '2028-03-01' })).toEqual({
        start: '2028-02-29',
        end: '2028-02-29',
      });
    });

    it.each([
      ['w piątek', '2026-11-20'],
      ['w najbliższy piątek', '2026-11-20'],
      ['w ten piątek', '2026-11-20'],
      ['w czwartek', '2026-11-19'],
      ['w niedzielę', '2026-11-22'],
      ['w środę', '2026-11-25'],
      ['w poniedziałek', '2026-11-23'],
      ['w przyszły piątek', '2026-11-27'],
      ['w zeszły piątek', '2026-11-13'],
      ['w ubiegły piątek', '2026-11-13'],
    ])('reads %s as a weekday near today', (text, day) => {
      expect(dateSpanIn(text, today)).toEqual({ start: day, end: day });
    });

    it.each([
      ['w ten weekend', '2026-11-21', '2026-11-22'],
      ['w weekend', '2026-11-21', '2026-11-22'],
      ['w przyszły weekend', '2026-11-28', '2026-11-29'],
      ['w zeszły weekend', '2026-11-14', '2026-11-15'],
      ['w sobotę i niedzielę', '2026-11-21', '2026-11-22'],
      ['od piątku do niedzieli', '2026-11-20', '2026-11-22'],
      ['od poniedziałku do piątku', '2026-11-23', '2026-11-27'],
      ['od soboty do poniedziałku', '2026-11-21', '2026-11-23'],
    ])('reads %s as a range', (text, start, end) => {
      expect(dateSpanIn(text, today)).toEqual({ start, end });
    });

    it('takes the weekend that is on for a Saturday or a Sunday', () => {
      ['2026-11-21', '2026-11-22'].forEach((day) =>
        expect(dateSpanIn('w ten weekend', { today: day })).toEqual({
          start: '2026-11-21',
          end: '2026-11-22',
        }),
      );
      expect(dateSpanIn('w przyszły weekend', { today: '2026-11-21' })).toEqual(
        {
          start: '2026-11-28',
          end: '2026-11-29',
        },
      );
    });

    it('prefers a date written out over a word', () => {
      expect(dateSpanIn('jutro, czyli 5 grudnia 2026', today)).toEqual({
        start: '2026-12-05',
        end: '2026-12-05',
      });
      expect(dateSpanIn('dziś, 19 listopada', today)).toEqual({
        start: '2026-11-19',
        end: '2026-11-19',
      });
    });

    it('gives null without today or with a today that is not a date', () => {
      [
        'dziś',
        'jutro',
        'wczoraj',
        'w piątek',
        'w ten weekend',
        'za tydzień',
        '3 dni temu',
      ].forEach((text) => {
        expect(dateSpanIn(text)).toBeNull();
        expect(dateSpanIn(text, { today: 'jutro' })).toBeNull();
      });
    });

    it('does not take a part of another word for one of these', () => {
      expect(dateSpanIn('Wczorajsza rozmowa', today)).toBeNull();
      expect(dateSpanIn('Podjutrzenie', today)).toBeNull();
      expect(dateSpanIn('Bezdzisiejszy', today)).toBeNull();
    });
  });
});
