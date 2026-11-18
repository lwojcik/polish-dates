import { DASHES } from '@polish/dashes';
import { dateOn } from '@polish/date';
import { fold } from '@polish/fold';
import { choose, type Pattern } from '@polish/pattern';
import {
  AFTER_HOUR,
  ISO,
  MONTHS_ACROSS,
  MONTHS_ACROSS_UNDATED,
  NEXT_YEAR,
  NUMERIC,
  NUMERIC_ACROSS,
  NUMERIC_ACROSS_UNDATED,
  NUMERIC_DASHED,
  NUMERIC_DAYS,
  NUMERIC_DAYS_UNDATED,
  NUMERIC_UNDATED,
  PART_OF_MONTH,
  PART_OF_MONTH_UNDATED,
  SHIFTS,
  TODAY,
  WHOLE_MONTH,
  WHOLE_MONTH_UNDATED,
  WORD_ACROSS,
  WORD_ACROSS_UNDATED,
  WORD_DAYS,
  WORD_DAYS_UNDATED,
} from '@polish/patterns';
import { relativeSpanIn } from '@polish/relative';
import {
  type Build,
  type Groups,
  monthOf,
  spanOf,
  yearOf,
} from '@polish/spans';
import { tidy } from '@polish/tolerance';
import type { DateSpan } from '@polish/types';
import { dayOfWeek, weekdaysIn } from '@polish/weekdays';
import {
  monthsAcrossIn,
  partIn,
  readMonths,
  readPart,
  readWhole,
  wholeIn,
} from '@polish/whole-month';

export type { DateSpan } from '@polish/types';

export interface DateSpanOptions {
  today?: string;
  tolerant?: boolean;
}

interface Today {
  iso: string;
  year: number;
}

const SEARCH_YEARS = 9;

const digitsIn = (text = '') =>
  Array.from(text.matchAll(/\d+/g), ([digits]) => digits);

const weekdaysOf = ({ lead, mid, days }: Groups) =>
  weekdaysIn([lead, mid, days].join(' '));

const isFitting = (weekdays: number[], { start, end }: DateSpan) =>
  weekdays.length === 0 ||
  (weekdays[0] === dayOfWeek(start) &&
    (weekdays.length === 1 || weekdays.at(-1) === dayOfWeek(end)));

const checked = (span: DateSpan | null, groups: Groups) =>
  span && isFitting(weekdaysOf(groups), span) ? span : null;

const readAcross = (groups: Groups) => {
  const end = yearOf(groups.y2);
  const start = groups.y1 ? yearOf(groups.y1) : end;

  return checked(
    spanOf([
      dateOn({
        year: start,
        month: monthOf(groups.m1),
        day: Number(groups.d1),
      }),
      dateOn({ year: end, month: monthOf(groups.m2), day: Number(groups.d2) }),
    ]),
    groups,
  );
};

const daysIn =
  (groups: Groups): Build =>
  (year) =>
    spanOf(
      digitsIn(groups.days).map((day) =>
        dateOn({ year, month: monthOf(groups.m), day: Number(day) }),
      ),
    );

const oneIn =
  (groups: Groups): Build =>
  (year) =>
    spanOf([dateOn({ year, month: monthOf(groups.m), day: Number(groups.d) })]);

const acrossIn =
  (groups: Groups): Build =>
  (year) => {
    const first = monthOf(groups.m1);
    const last = monthOf(groups.m2);

    return spanOf([
      dateOn({ year, month: first, day: Number(groups.d1) }),
      dateOn({
        year: last < first ? year + NEXT_YEAR : year,
        month: last,
        day: Number(groups.d2),
      }),
    ]);
  };

const readDays = (groups: Groups) =>
  checked(daysIn(groups)(yearOf(groups.y)), groups);

const readOne = (groups: Groups) =>
  checked(oneIn(groups)(yearOf(groups.y)), groups);

const READERS = [
  { pattern: WORD_ACROSS, read: readAcross },
  { pattern: WORD_DAYS, read: readDays },
  { pattern: NUMERIC_ACROSS, read: readAcross },
  { pattern: NUMERIC_DAYS, read: readDays },
  { pattern: NUMERIC, read: readOne },
  { pattern: ISO, read: readOne },
  { pattern: NUMERIC_DASHED, read: readOne, isTolerantOnly: true },
  { pattern: MONTHS_ACROSS, read: readMonths },
  { pattern: PART_OF_MONTH, read: readPart },
  { pattern: WHOLE_MONTH, read: readWhole },
];

const UNDATED = [
  { pattern: WORD_ACROSS_UNDATED, build: acrossIn },
  { pattern: WORD_DAYS_UNDATED, build: daysIn },
  { pattern: NUMERIC_ACROSS_UNDATED, build: acrossIn },
  { pattern: NUMERIC_DAYS_UNDATED, build: daysIn },
  { pattern: NUMERIC_UNDATED, build: oneIn },
  { pattern: MONTHS_ACROSS_UNDATED, build: monthsAcrossIn },
  { pattern: PART_OF_MONTH_UNDATED, build: partIn },
  { pattern: WHOLE_MONTH_UNDATED, build: wholeIn },
];

const firstOf = <Reader extends { pattern: Pattern; isTolerantOnly?: boolean }>(
  readers: Reader[],
  { text, isTolerant }: { text: string; isTolerant: boolean },
) => {
  const reader = readers.find(
    ({ pattern, isTolerantOnly }) =>
      (isTolerant || !isTolerantOnly) && choose(pattern, isTolerant).test(text),
  );
  const groups =
    reader && choose(reader.pattern, isTolerant).exec(text)?.groups;

  return reader && groups ? { reader, groups } : undefined;
};

const todayOf = (today = ''): Today | null => {
  const [, year, month, day] = TODAY.exec(today) ?? [];
  const iso = dateOn({
    year: Number(year),
    month: Number(month),
    day: Number(day),
  });

  return iso ? { iso, year: Number(year) } : null;
};

const shiftOf = (relative: string) =>
  SHIFTS.find(([shift]) => shift.test(fold(relative)))?.[1] ?? 0;

const resolve = (
  { build, groups }: { build: Build; groups: Groups },
  today: Today,
) =>
  groups.relative
    ? checked(build(today.year + shiftOf(groups.relative)), groups)
    : (Array.from({ length: SEARCH_YEARS }, (unused, offset) =>
        build(today.year + offset),
      ).find(
        (span) =>
          span && span.end >= today.iso && isFitting(weekdaysOf(groups), span),
      ) ?? null);

export const dateSpanIn = (
  text: string,
  { today, tolerant = false }: DateSpanOptions = {},
): DateSpan | null => {
  const plain = (tolerant ? tidy(text) : text).replaceAll(DASHES, '-');
  const dated = firstOf(READERS, { text: plain, isTolerant: tolerant });

  if (dated) {
    return dated.reader.read(dated.groups);
  }

  const now = todayOf(today);

  if (!now) {
    return null;
  }

  const undated = firstOf(UNDATED, {
    text: plain.replaceAll(AFTER_HOUR, ' '),
    isTolerant: tolerant,
  });

  return undated
    ? resolve(
        {
          build: undated.reader.build(undated.groups),
          groups: undated.groups,
        },
        now,
      )
    : relativeSpanIn(plain, { today: now.iso, isTolerant: tolerant });
};
