import { describe, expect, it } from 'vitest';

import { parseDate } from '@polish/parse';
import { dateSpanIn } from '@polish/span';

const today = { today: '2026-11-18' };
const tolerant = { today: '2026-11-18', tolerant: true };

const MONTHS = [
  ['01', 'stycznia', 'styczeń', 'styczniu', 31],
  ['02', 'lutego', 'luty', 'lutym', 28],
  ['03', 'marca', 'marzec', 'marcu', 31],
  ['04', 'kwietnia', 'kwiecień', 'kwietniu', 30],
  ['05', 'maja', 'maj', 'maju', 31],
  ['06', 'czerwca', 'czerwiec', 'czerwcu', 30],
  ['07', 'lipca', 'lipiec', 'lipcu', 31],
  ['08', 'sierpnia', 'sierpień', 'sierpniu', 31],
  ['09', 'września', 'wrzesień', 'wrześniu', 30],
  ['10', 'października', 'październik', 'październiku', 31],
  ['11', 'listopada', 'listopad', 'listopadzie', 30],
  ['12', 'grudnia', 'grudzień', 'grudniu', 31],
] as const;

const whole = (month: string, last: number, year = 2026) => ({
  start: `${year}-${month}-01`,
  end: `${year}-${month}-${last}`,
});

describe('a whole month', () => {
  describe('with a year', () => {
    it.each(MONTHS)(
      'reads month %s in the genitive, nominative and locative',
      (month, genitive, nominative, locative, last) => {
        const expected = whole(month, last);

        expect(dateSpanIn(`${genitive} 2026`)).toEqual(expected);
        expect(dateSpanIn(`${nominative} 2026`)).toEqual(expected);
        expect(
          dateSpanIn(
            `${nominative[0]?.toUpperCase()}${nominative.slice(1)} 2026`,
          ),
        ).toEqual(expected);
        expect(dateSpanIn(`w ${locative} 2026`)).toEqual(expected);
        expect(dateSpanIn(`w ${locative} 2026 r.`)).toEqual(expected);
        expect(dateSpanIn(`W ${locative.toUpperCase()} 2026`)).toEqual(
          expected,
        );
      },
    );

    it('knows how many days February has', () => {
      expect(dateSpanIn('w lutym 2028')).toEqual(whole('02', 29, 2028));
      expect(dateSpanIn('luty 2100')).toEqual(whole('02', 28, 2100));
      expect(dateSpanIn('luty 2000')).toEqual(whole('02', 29, 2000));
    });

    it('reads a month of a sentence', () => {
      expect(dateSpanIn('Raport za grudzień 2026, wersja 2')).toEqual(
        whole('12', 31),
      );
      expect(
        dateSpanIn('Koncert odbędzie się w grudniu 2026 r. w Poznaniu'),
      ).toEqual(whole('12', 31));
    });

    it('prefers a day to the whole month', () => {
      expect(dateSpanIn('5 grudnia 2026')).toEqual({
        start: '2026-12-05',
        end: '2026-12-05',
      });
      expect(dateSpanIn('5 i 6 grudnia 2026')).toEqual({
        start: '2026-12-05',
        end: '2026-12-06',
      });
      expect(dateSpanIn('23–27 listopada 2026')).toEqual({
        start: '2026-11-23',
        end: '2026-11-27',
      });
    });

    it('does not take an adjective for a month', () => {
      expect(dateSpanIn('grudniowy koncert 2026')).toBeNull();
      expect(dateSpanIn('listopadowy 2026')).toBeNull();
      expect(dateSpanIn('majowy 2026')).toBeNull();
    });

    it('gives null for a year that is not one', () => {
      expect(dateSpanIn('w grudniu 20')).toBeNull();
      expect(dateSpanIn('grudzień 202')).toBeNull();
    });
  });

  describe('without a year', () => {
    it.each([
      ['w grudniu', '2026-12-01', '2026-12-31'],
      ['grudzień', '2026-12-01', '2026-12-31'],
      ['w listopadzie', '2026-11-01', '2026-11-30'],
      ['w styczniu', '2027-01-01', '2027-01-31'],
      ['w październiku', '2027-10-01', '2027-10-31'],
      ['w lutym', '2027-02-01', '2027-02-28'],
      ['w grudniu br.', '2026-12-01', '2026-12-31'],
      ['w październiku br.', '2026-10-01', '2026-10-31'],
      ['w styczniu w przyszłym roku', '2027-01-01', '2027-01-31'],
      ['w grudniu przyszłego roku', '2027-12-01', '2027-12-31'],
    ])('reads %s as the next time it comes', (text, start, end) => {
      expect(dateSpanIn(text, today)).toEqual({ start, end });
    });

    it('reads the month that is on', () => {
      expect(dateSpanIn('w listopadzie', { today: '2026-11-30' })).toEqual(
        whole('11', 30),
      );
      expect(dateSpanIn('w listopadzie', { today: '2026-12-01' })).toEqual(
        whole('11', 30, 2027),
      );
    });

    it('gives null without today', () => {
      expect(dateSpanIn('w grudniu')).toBeNull();
      expect(dateSpanIn('grudzień')).toBeNull();
      expect(dateSpanIn('w grudniu br.')).toBeNull();
    });
  });

  describe('as a range of months', () => {
    it.each([
      ['od listopada do grudnia 2026', '2026-11-01', '2026-12-31'],
      ['listopad - grudzień 2026', '2026-11-01', '2026-12-31'],
      ['od listopada 2025 do grudnia 2026', '2025-11-01', '2026-12-31'],
      ['w listopadzie i grudniu 2026', '2026-11-01', '2026-12-31'],
    ])('reads %s', (text, start, end) => {
      expect(dateSpanIn(text)).toEqual({ start, end });
    });

    it('reads a range that stays in a year', () => {
      expect(dateSpanIn('od lutego do maja', today)).toEqual({
        start: '2027-02-01',
        end: '2027-05-31',
      });
    });

    it('runs into the next year', () => {
      expect(dateSpanIn('od listopada do stycznia', today)).toEqual({
        start: '2026-11-01',
        end: '2027-01-31',
      });
    });

    it('gives null for a range that runs backwards', () => {
      expect(dateSpanIn('od grudnia do listopada 2026')).toBeNull();
    });
  });
});

describe('a part of a month', () => {
  it.each([
    ['I połowa grudnia 2026', '2026-12-01', '2026-12-15'],
    ['II połowa grudnia 2026', '2026-12-16', '2026-12-31'],
    ['pierwsza połowa grudnia 2026', '2026-12-01', '2026-12-15'],
    ['druga połowa listopada 2026', '2026-11-16', '2026-11-30'],
    ['w pierwszej połowie grudnia 2026', '2026-12-01', '2026-12-15'],
    ['w drugiej połowie grudnia 2026', '2026-12-16', '2026-12-31'],
    ['w drugiej połowie lutego 2026', '2026-02-16', '2026-02-28'],
    ['początek stycznia 2027', '2027-01-01', '2027-01-10'],
    ['na początku stycznia 2027', '2027-01-01', '2027-01-10'],
    ['w połowie grudnia 2026', '2026-12-11', '2026-12-20'],
    ['środek grudnia 2026', '2026-12-11', '2026-12-20'],
    ['koniec listopada 2026', '2026-11-21', '2026-11-30'],
    ['pod koniec listopada 2026', '2026-11-21', '2026-11-30'],
    ['na końcu listopada 2026', '2026-11-21', '2026-11-30'],
    ['koniec grudnia 2026 r.', '2026-12-21', '2026-12-31'],
    ['koniec lutego 2026', '2026-02-21', '2026-02-28'],
    ['koniec lutego 2028', '2028-02-21', '2028-02-29'],
    ['Początek Października 2026', '2026-10-01', '2026-10-10'],
  ])('reads %s', (text, start, end) => {
    expect(dateSpanIn(text)).toEqual({ start, end });
  });

  it('reads every form of the words for a part', () => {
    ['koniec', 'końca', 'końcu', 'końcem', 'pod koniec', 'na końcu'].forEach(
      (word) =>
        expect(dateSpanIn(`${word} grudnia 2026`)).toEqual({
          start: '2026-12-21',
          end: '2026-12-31',
        }),
    );
    ['początek', 'początku', 'początkiem', 'na początku'].forEach((word) =>
      expect(dateSpanIn(`${word} grudnia 2026`)).toEqual({
        start: '2026-12-01',
        end: '2026-12-10',
      }),
    );
  });

  it.each([
    ['koniec listopada', '2026-11-21', '2026-11-30'],
    ['początek listopada', '2027-11-01', '2027-11-10'],
    ['II połowa grudnia', '2026-12-16', '2026-12-31'],
    ['pod koniec stycznia', '2027-01-21', '2027-01-31'],
    ['w połowie listopada', '2026-11-11', '2026-11-20'],
    ['początek stycznia przyszłego roku', '2027-01-01', '2027-01-10'],
    ['koniec grudnia br.', '2026-12-21', '2026-12-31'],
  ])('reads %s against today', (text, start, end) => {
    expect(dateSpanIn(text, today)).toEqual({ start, end });
  });

  it('gives null without a year and without today', () => {
    expect(dateSpanIn('koniec listopada')).toBeNull();
    expect(dateSpanIn('I połowa grudnia')).toBeNull();
  });

  it('does not take other words for a part of a month', () => {
    expect(dateSpanIn('koniec świata 2026')).toBeNull();
    expect(dateSpanIn('połowa ceny 2026')).toBeNull();
    expect(dateSpanIn('początek roku 2026')).toBeNull();
  });
});

describe('an abbreviated month', () => {
  it.each([
    ['5 sty 2026', '2026-01-05'],
    ['5 stycz. 2026', '2026-01-05'],
    ['5 lut 2026', '2026-02-05'],
    ['5 lut. 2026', '2026-02-05'],
    ['5 mar 2026', '2026-03-05'],
    ['5 marz. 2026', '2026-03-05'],
    ['5 kwi 2026', '2026-04-05'],
    ['5 kwiet. 2026', '2026-04-05'],
    ['5 maj 2026', '2026-05-05'],
    ['5 cze 2026', '2026-06-05'],
    ['5 czer. 2026', '2026-06-05'],
    ['5 lip 2026', '2026-07-05'],
    ['5 lip. 2026', '2026-07-05'],
    ['5 sie 2026', '2026-08-05'],
    ['5 sierp. 2026', '2026-08-05'],
    ['5 wrz 2026', '2026-09-05'],
    ['5 wrzes. 2026', '2026-09-05'],
    ['5 paź 2026', '2026-10-05'],
    ['5 paźdz. 2026', '2026-10-05'],
    ['5 lis 2026', '2026-11-05'],
    ['5 listop. 2026', '2026-11-05'],
    ['5 gru 2026', '2026-12-05'],
    ['5 grud. 2026', '2026-12-05'],
    ['5 GRUD. 2026', '2026-12-05'],
    ['5 Gru. 2026 r.', '2026-12-05'],
  ])('reads %s', (text, day) => {
    expect(dateSpanIn(text)).toEqual({ start: day, end: day });
  });

  it('reads it in a range and a list', () => {
    expect(dateSpanIn('23–27 lis 2026')).toEqual({
      start: '2026-11-23',
      end: '2026-11-27',
    });
    expect(dateSpanIn('30 lis - 2 gru 2026')).toEqual({
      start: '2026-11-30',
      end: '2026-12-02',
    });
    expect(dateSpanIn('od 30 lis do 2 gru 2026')).toEqual({
      start: '2026-11-30',
      end: '2026-12-02',
    });
    expect(dateSpanIn('5 i 6 gru 2026')).toEqual({
      start: '2026-12-05',
      end: '2026-12-06',
    });
  });

  it('reads it without a year against today', () => {
    expect(dateSpanIn('5 gru', today)).toEqual({
      start: '2026-12-05',
      end: '2026-12-05',
    });
    expect(dateSpanIn('23–27 lis', today)).toEqual({
      start: '2026-11-23',
      end: '2026-11-27',
    });
    expect(dateSpanIn('5 gru')).toBeNull();
  });

  it('reads it as a whole month', () => {
    expect(dateSpanIn('gru 2026')).toEqual(whole('12', 31));
    expect(dateSpanIn('grud. 2026')).toEqual(whole('12', 31));
    expect(dateSpanIn('koniec lis 2026')).toEqual({
      start: '2026-11-21',
      end: '2026-11-30',
    });
  });

  it('does not take the start of another word for a month', () => {
    expect(dateSpanIn('5 listewek 2026')).toBeNull();
    expect(dateSpanIn('5 grubych 2026')).toBeNull();
    expect(dateSpanIn('5 marzenie 2026')).toBeNull();
    expect(dateSpanIn('5 siedem 2026')).toBeNull();
  });
});

describe('with the tolerant flag', () => {
  it('reads these forms without the Polish letters', () => {
    expect(dateSpanIn('wrzesien 2026', { tolerant: true })).toEqual(
      whole('09', 30),
    );
    expect(dateSpanIn('w pazdzierniku 2026', { tolerant: true })).toEqual(
      whole('10', 31),
    );
    expect(dateSpanIn('II polowa grudnia 2026', { tolerant: true })).toEqual({
      start: '2026-12-16',
      end: '2026-12-31',
    });
    expect(dateSpanIn('koniec wrzesnia 2026', { tolerant: true })).toEqual({
      start: '2026-09-21',
      end: '2026-09-30',
    });
    expect(dateSpanIn('5 paz 2026', { tolerant: true })).toEqual({
      start: '2026-10-05',
      end: '2026-10-05',
    });
    expect(dateSpanIn('na poczatku grudnia', tolerant)).toEqual({
      start: '2026-12-01',
      end: '2026-12-10',
    });
  });

  it('is needed for them', () => {
    expect(dateSpanIn('wrzesien 2026')).toBeNull();
    expect(dateSpanIn('w pazdzierniku 2026')).toBeNull();
  });

  it('reads only the month of a part written without the letters', () => {
    expect(dateSpanIn('II polowa grudnia 2026')).toEqual(whole('12', 31));
  });
});

describe('parseDate with a month', () => {
  it('reads the time beside a whole month or a part of it', () => {
    expect(parseDate('Koncert w grudniu 2026, godz. 19:00')).toEqual({
      start: '2026-12-01',
      end: '2026-12-31',
      times: [[19, 0]],
    });
    expect(parseDate('koniec listopada o 18.30', today)).toEqual({
      start: '2026-11-21',
      end: '2026-11-30',
      times: [[18, 30]],
    });
  });
});
