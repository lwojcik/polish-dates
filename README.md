# polish-dates

![NPM Version](https://img.shields.io/npm/v/polish-dates)
[![Build status](https://ci.appveyor.com/api/projects/status/s8sgan0csn6yk5bw/branch/main?svg=true)](https://ci.appveyor.com/project/lwojcik/polish-dates/branch/main)
[![codecov](https://codecov.io/github/lwojcik/polish-dates/graph/badge.svg?token=4bpiOiXmBK)](https://codecov.io/github/lwojcik/polish-dates)

Read dates and clock times written in Polish text, such as `5 i 6 grudnia 2026`, `23–27 listopada 2026`, `17,07.2026` or `godz. 17.30`. It has no dependencies and runs on Node 24 or newer.

## Install

```sh
npm install polish-dates
```

## Use

Paste any text and read the answer with `parseDate`:

```ts
import { parseDate } from 'polish-dates';

parseDate('W dniach 23–27 listopada 2026 r., godz. 9.00 – 17:30');
// { start: '2026-11-23', end: '2026-11-27', times: [[9, 0], [17, 30]] }

parseDate('jutro o godz. 18:30', { today: '2026-11-18' });
// { start: '2026-11-19', end: '2026-11-19', times: [[18, 30]] }

parseDate('wkrótce'); // { start: null, end: null, times: [] }
```

By default it reads only what is written correctly. Pass `{ tolerant: true }` to forgive the slips of a hasty typist:

```ts
parseDate('Sroda, 9 grudznia 2026, godz. 18,30', { tolerant: true });
// { start: '2026-12-09', end: '2026-12-09', times: [[18, 30]] }

parseDate('17,07.2026', { tolerant: true }); // { start: '2026-07-17', ... }
parseDate('17,07.2026'); // { start: null, end: null, times: [] }
```

The functions it is made of can be used on their own:

```ts
import {
  clockAfterHour,
  clocksIn,
  dateOn,
  dateSpanIn,
  findClocks,
  findDates,
  MONTH_PATTERN,
  monthNumber,
  parseDate,
  withoutDates,
} from 'polish-dates';

monthNumber('listopada'); // 11
monthNumber('Września'); // 9, in any case
monthNumber('wrzesień'); // 0, only the genitive is a date's month

dateOn({ year: 2026, month: 11, day: 9 }); // '2026-11-09'
dateOn({ year: 2026, month: 2, day: 30 }); // null, the month has no such day

clocksIn('godz. 10.00 -11:30 i 9.05'); // [[10, 0], [11, 30], [9, 5]]
clocksIn('24.00 12.60'); // [], not times of day

clockAfterHour('o godz. 17.30'); // [17, 30]
clockAfterHour('o 17.30'); // null, no `godz.`

dateSpanIn('W dniach 23–27 listopada 2026'); // { start: '2026-11-23', end: '2026-11-27' }
dateSpanIn('5 i 6 grudnia 2026'); // { start: '2026-12-05', end: '2026-12-06' }
dateSpanIn('30 listopada - 2 grudnia 2026'); // { start: '2026-11-30', end: '2026-12-02' }
dateSpanIn('od 23 do 27 listopada 2026'); // { start: '2026-11-23', end: '2026-11-27' }
dateSpanIn('5, 6 i 7 grudnia 2026'); // { start: '2026-12-05', end: '2026-12-07' }
dateSpanIn('23.11–27.11.2026'); // { start: '2026-11-23', end: '2026-11-27' }
dateSpanIn('30 XI – 2 XII 2026'); // { start: '2026-11-30', end: '2026-12-02' }
dateSpanIn('04.12.2026'); // { start: '2026-12-04', end: '2026-12-04' }
dateSpanIn('2026-12-05'); // { start: '2026-12-05', end: '2026-12-05' }
dateSpanIn('5 i 6 grudnia'); // null, a missing year is never guessed

const today = { today: '2026-11-18' };

dateSpanIn('5 i 6 grudnia', today); // { start: '2026-12-05', end: '2026-12-06' }
dateSpanIn('17 listopada', today); // { start: '2027-11-17', end: '2027-11-17' }, the next time it comes
dateSpanIn('17 listopada br.', today); // { start: '2026-11-17', end: '2026-11-17' }
dateSpanIn('30.12–2.01', today); // { start: '2026-12-30', end: '2027-01-02' }
dateSpanIn('niedziela 5 grudnia', today); // { start: '2027-12-05', end: '2027-12-05' }, the next year it is a Sunday
dateSpanIn('pt. 4 – nd. 6 grudnia 2026'); // { start: '2026-12-04', end: '2026-12-06' }
dateSpanIn('w niedzielę 5 grudnia 2026'); // null, 5 December 2026 is a Saturday
dateSpanIn('w grudniu 2026'); // { start: '2026-12-01', end: '2026-12-31' }
dateSpanIn('II połowa grudnia 2026'); // { start: '2026-12-16', end: '2026-12-31' }
dateSpanIn('koniec listopada', today); // { start: '2026-11-21', end: '2026-11-30' }
dateSpanIn('5 grud. 2026'); // { start: '2026-12-05', end: '2026-12-05' }
dateSpanIn('jutro', today); // { start: '2026-11-19', end: '2026-11-19' }
dateSpanIn('w przyszły piątek', today); // { start: '2026-11-27', end: '2026-11-27' }
dateSpanIn('w ten weekend', today); // { start: '2026-11-21', end: '2026-11-22' }
dateSpanIn('za 2 tygodnie', today); // { start: '2026-12-02', end: '2026-12-02' }

new RegExp(`(\\d{1,2})\\s+(${MONTH_PATTERN})\\s+(\\d{4})`, 'i');
```

- **`POLISH_MONTHS`** lists the months as they stand in a date, in the genitive (`stycznia`, `lutego`, ...), and `MONTH_PATTERN` joins them for a regular expression.
- **`monthNumber(name)`** gives 1 to 12, or 0 for a word that is not a month in the genitive.
- **`dateOn({ year, month, day })`** gives `YYYY-MM-DD`, or `null` for a day that does not exist. It knows the leap years and uses no time zone.
- **`parseDate(text, { today })`** gives `{ start, end, times }` for any form below: the dates come from `dateSpanIn` and the times from the clock readers. `start` and `end` are `null` when there is no date, and `times` is empty when there is no clock. A time is read after `godz.` (`godz. 18`, and with `tolerant: true` a comma too, `godz. 18,30`) or on its own as `H:MM` or `H.MM` (`o 17.30`, `od 9.00 do 17.30`, `godz. 10.00 -11:30 i 9.05`). A `H.MM` that could as well be a day and a month (`o 9.05`, `5.12`, `od 5.12 do 7.12`) is skipped, unless it is in a chain with a time that cannot be one, as in `od 9.05 do 17.30`; so is a price (`12.50 zł`, `12.50 PLN`, `$12.50`, `12.50 dolarów`; zloty, dollar, euro, pound and franc, with or without the Polish letters, and any code of three capitals such as `SEK` or `NOK`, whatever it is; a code in small letters is not told from a word). A time zone after a number settles that it is a time: `12.50 UTC`, `12.05 GMT` and `9.00 CET` are times, never a price or a date. `clocksIn` reads them all.
- **`dateSpanIn(text, { today, tolerant })`** finds the first day or range of days in a sentence and gives `{ start, end }` (the same day twice for one day), or `null`. It reads:
  - a range inside a month (`23–27 listopada 2026`, `od 23 do 27 listopada 2026`) and across months (`30 listopada - 2 grudnia 2026`, `od 30 listopada do 2 grudnia 2026`), with any dash a typist may use;
  - a list of days (`5 i 6 grudnia 2026`, `5, 6 i 7 grudnia 2026`), as the span from the first day to the last;
  - a numeric range (`23-27.11.2026`, `23.11–27.11.2026`, `30.11.2025 – 2.12.2026`);
  - one day in words (`9 listopada 2026 r.`), in digits (`4.12.2026`, `04/12/2026`, `5.12.26`, where two digits of a year mean 20xx) or as ISO (`2026-12-05`);
  - a month in Roman numerals (`5 XII 2026`, `23–27 XI 2026`) or abbreviated (`5 gru 2026`, `5 grud. 2026`, `23–27 lis 2026`);
  - a whole month, with no day, in the genitive, the nominative or the locative (`grudnia 2026`, `grudzień 2026`, `w grudniu 2026`), and a range of months (`od listopada do grudnia 2026`, `listopad - grudzień 2026`);
  - a part of a month (`I połowa grudnia 2026`, `druga połowa`, `początek stycznia 2027`, `pod koniec listopada 2026`, `w połowie grudnia`): the first half is the 1st to the 15th and the second half is the 16th to the end, `początek` is the 1st to the 10th, `środek` and `w połowie` the 11th to the 20th and `koniec` the 21st to the end.

  A range that runs backwards or a day that does not exist is not read. A day always wins over the month around it, so `5 grudnia 2026` is a single day. A month alone with no year (`w grudniu`, `grudzień`, `koniec listopada`, `od listopada do stycznia`) is read with `today`, as the next time it comes; the genitive alone (`grudnia`) is read only with a year. A date without a year is read only when `today` is given as `YYYY-MM-DD` in the second argument `{ today }`, and then it is the next time the date comes (today counts, and a range that is still on counts), skipping to a year that has the day for `29 lutego`. A range across the new year runs into the next year (`30.12–2.01`). The words after the date set the year instead: `br.`, `w tym roku` and `bieżącego roku` for this year, `w przyszłym roku` and `przyszłego roku` for the next, `w zeszłym roku` and `w ubiegłym roku` for the last. A day and a month in digits (`5.12`, `23-27.11`) are read this way too, unless they follow `godz.` or stand before `zł` and the like. A weekday written beside a date (`w sobotę, 5 grudnia`, `pt. 4 – nd. 6 grudnia`, `piątek–niedziela, 4–6 grudnia 2026`) must fit it, or the text gives `null`; for a date without a year it picks the next year that fits. When there is no date but `today` is given, it reads a day by a word (`dziś`, `jutro`, `pojutrze`, `wczoraj`, `przedwczoraj`), by an offset (`za 3 dni`, `za tydzień`, `2 tygodnie temu`), a weekday (`w piątek` is the coming one, `w przyszły piątek` is in the next week, `w zeszły piątek` in the last), a pair of weekdays (`od piątku do niedzieli`, `w sobotę i niedzielę`) and a weekend (`w ten weekend`, `w przyszły weekend`). A date that is written out wins over these words. With `tolerant: true` it also reads words without the Polish letters (`wrzesnia`, `sroda`, `dzis`, `w przyszly piatek`), a month with one letter wrong (`grudznia`, `listpada`, `listopad`, `stycznai`; only a word of five letters or more that follows a number, and only when one month is that near), missing or extra spaces and dots (`5grudnia2026`, `5. grudnia 2026`) and other separators in a date in digits (`17,07.2026`, `5. 12. 2026`, `05-12-2026`). A day that does not exist is still an error. A comma list cannot be told from other text, so `Sala 3, 5 grudnia 2026` reads as `3–5 grudnia`.

- **`clockAfterHour(text)`** reads the time after `godz.`, `godzina` or `godzinie` (`godz. 17`, `godz. 17.30`) as `[hour, minute]`, or `null`.
- **`clocksIn(text)`** gives every `H.MM` or `HH:MM` as `[hour, minute]`, in order, and skips what is not a time of day.
- **`findDates(text, { today, tolerant })`** gives every date `dateSpanIn` reads, each as `{ start, end, index, length }` with the position in the text you passed (also with `tolerant: true`, which reads a corrected copy). The match includes a weekday written before the date. A date that does not exist is left out. Two dates in one line come out as two matches, in the order they stand:

  ```ts
  findDates('Środa, 9 grudnia 2026, godz. 18.30 oraz 12.12.2026', {
    tolerant: true,
  });
  // [
  //   { start: '2026-12-09', end: '2026-12-09', index: 0, length: 21 },
  //   { start: '2026-12-12', end: '2026-12-12', index: 40, length: 10 },
  // ]
  ```

- **`withoutDates(text, options)`** gives the text with every match of `findDates` cut out, so what is left (a place, a title) can be read on its own.
- **`findClocks(text)`** is `clocksIn` with positions: `{ clock, index, length }` for each match.

## Development

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

## Licence

[MIT](LICENSE)
