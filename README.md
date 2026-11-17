# polish-dates

Read dates and clock times written in Polish text, such as `5 i 6 grudnia 2026`, `23–27 listopada 2026`, `17,07.2026` or `godz. 17.30`. It has no dependencies and runs on Node 24 or newer.

> The package is being built up: it holds the vocabulary, a validated date, the clock readers and the reader of a day or a range of days. More readers follow.

## Install

```sh
npm install polish-dates
```

## Use

```ts
import { clocksIn, dateOn, MONTH_PATTERN, monthNumber } from 'polish-dates';

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
dateSpanIn('04.12.2026'); // { start: '2026-12-04', end: '2026-12-04' }
dateSpanIn('5 i 6 grudnia'); // null, a missing year is never guessed

new RegExp(`(\\d{1,2})\\s+(${MONTH_PATTERN})\\s+(\\d{4})`, 'i');
```

- **`POLISH_MONTHS`** lists the months as they stand in a date, in the genitive (`stycznia`, `lutego`, ...), and `MONTH_PATTERN` joins them for a regular expression.
- **`monthNumber(name)`** gives 1 to 12, or 0 for a word that is not a month in the genitive.
- **`dateOn({ year, month, day })`** gives `YYYY-MM-DD`, or `null` for a day that does not exist. It knows the leap years and uses no time zone.
- **`dateSpanIn(text)`** finds the first day or range of days in a sentence and gives `{ start, end }` (the same day twice for one day), or `null`. It reads a range inside a month (`23–27 listopada 2026`, `5 i 6 grudnia 2026`), a range across months (`30 listopada - 2 grudnia 2026`), one day in words (`9 listopada 2026`) and one day in digits (`04.12.2026`), with any dash a typist may use. A date without a year is not read, and neither is a range that runs backwards or a day that does not exist.
- **`clockAfterHour(text)`** reads the time after `godz.`, `godzina` or `godzinie` (`godz. 17`, `godz. 17.30`) as `[hour, minute]`, or `null`.
- **`clocksIn(text)`** gives every `H.MM` or `HH:MM` as `[hour, minute]`, in order, and skips what is not a time of day.

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
