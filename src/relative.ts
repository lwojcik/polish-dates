import { fold } from '@polish/fold';
import { choose, compile, type Pattern } from '@polish/pattern';
import type { DateSpan } from '@polish/types';
import {
  addDays,
  dayOfWeek,
  DAYS_PER_WEEK,
  SATURDAY,
  SUNDAY,
  WEEKDAY,
  weekdayOf,
  WORD_END,
  WORD_START,
} from '@polish/weekdays';

type Groups = Record<string, string | undefined>;

interface Reader {
  pattern: Pattern;
  read: (groups: Groups, today: string) => DateSpan | null;
}

const DAY_WORDS: Record<string, number> = {
  przedwczoraj: -2,
  wczoraj: -1,
  dziś: 0,
  dzisiaj: 0,
  jutro: 1,
  pojutrze: 2,
};

const NUMBER_WORDS: Record<string, number> = {
  dwa: 2,
  dwie: 2,
  trzy: 3,
  cztery: 4,
  pięć: 5,
  sześć: 6,
  siedem: 7,
  osiem: 8,
  dziewięć: 9,
  dziesięć: 10,
};

const SHIFTS: [RegExp, number][] = [
  [/przyszl|nastepn/, 1],
  [/zeszl|ubiegl|poprzedni/, -1],
];

const COUNT = String.raw`(?:(?<count>\d{1,3}|${Object.keys(NUMBER_WORDS).join('|')})\s+)?`;
const UNIT = '(?<unit>dzień|dni|tydzień|tygodnie|tygodni)';
const WHICH =
  '(?:ten|tym|tę|tą|najbliższ(?:y|ym|ą)|przyszł(?:y|ym|ą)|następn(?:y|ym|ą)|zeszł(?:y|ym|ą)|ubiegł(?:y|ym|ą)|poprzedni(?:m)?)';
const SEPARATOR = String.raw`(?:\s+do\s+|\s+i\s+|\s*-\s*)`;

const valueOf = (
  table: Record<string, number>,
  { word, fallback }: { word: string; fallback: number },
) =>
  Object.entries(table).find(([key]) => fold(key) === fold(word))?.[1] ??
  fallback;

const one = (date: string): DateSpan => ({ start: date, end: date });

const shiftOf = (which = '') =>
  SHIFTS.find(([pattern]) => pattern.test(fold(which)))?.[1] ?? 0;

const upcoming = (today: string, weekday: number) =>
  addDays(
    today,
    (weekday - dayOfWeek(today) + DAYS_PER_WEEK) % DAYS_PER_WEEK ||
      DAYS_PER_WEEK,
  );

const inWeek = ({
  today,
  weekday,
  shift,
}: {
  today: string;
  weekday: number;
  shift: number;
}) => addDays(today, weekday - dayOfWeek(today) + shift * DAYS_PER_WEEK);

const READERS: Reader[] = [
  {
    pattern: compile(
      `${WORD_START}(?:(?<which>${WHICH})\\s+)?weekend(?:u|zie)?${WORD_END}`,
    ),
    read: ({ which }, today) => {
      const day = dayOfWeek(today);
      const saturday = addDays(today, day === SUNDAY ? -1 : SATURDAY - day);
      const start = addDays(saturday, shiftOf(which) * DAYS_PER_WEEK);

      return { start, end: addDays(start, 1) };
    },
  },
  {
    pattern: compile(
      String.raw`${WORD_START}(?:w|we|od)\s+(?<first>${WEEKDAY})${SEPARATOR}(?<last>${WEEKDAY})`,
    ),
    read: ({ first = '', last = '' }, today) => {
      const start = upcoming(today, weekdayOf(first));

      return {
        start,
        end: addDays(
          start,
          (weekdayOf(last) - weekdayOf(first) + DAYS_PER_WEEK) % DAYS_PER_WEEK,
        ),
      };
    },
  },
  {
    pattern: compile(
      String.raw`${WORD_START}(?:w|we|na)\s+(?:(?<which>${WHICH})\s+)?(?<weekday>${WEEKDAY})`,
    ),
    read: ({ which, weekday = '' }, today) => {
      const shift = shiftOf(which);

      return one(
        shift
          ? inWeek({ today, weekday: weekdayOf(weekday), shift })
          : upcoming(today, weekdayOf(weekday)),
      );
    },
  },
  {
    pattern: compile(String.raw`${WORD_START}za\s+${COUNT}${UNIT}${WORD_END}`),
    read: (groups, today) => one(addDays(today, offsetOf(groups))),
  },
  {
    pattern: compile(
      String.raw`${WORD_START}${COUNT}${UNIT}\s+temu${WORD_END}`,
    ),
    read: (groups, today) => one(addDays(today, -offsetOf(groups))),
  },
  {
    pattern: compile(
      `${WORD_START}(?<word>${Object.keys(DAY_WORDS).join('|')})${WORD_END}`,
    ),
    read: ({ word = '' }, today) =>
      one(addDays(today, valueOf(DAY_WORDS, { word, fallback: 0 }))),
  },
];

function offsetOf({ count, unit = '' }: Groups) {
  const number = count
    ? valueOf(NUMBER_WORDS, { word: count, fallback: Number(count) })
    : 1;

  return number * (/^t/i.test(unit) ? DAYS_PER_WEEK : 1);
}

export const relativeMatchIn = (
  text: string,
  { today, isTolerant }: { today: string; isTolerant: boolean },
): { span: DateSpan | null; index: number; length: number } | undefined => {
  const reader = READERS.find(({ pattern }) =>
    choose(pattern, isTolerant).test(text),
  );
  const found = reader && choose(reader.pattern, isTolerant).exec(text);

  return reader && found?.groups
    ? {
        span: reader.read(found.groups, today),
        index: found.index,
        length: found[0].length,
      }
    : undefined;
};
