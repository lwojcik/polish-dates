/* eslint-disable security/detect-non-literal-regexp -- the patterns are built from this package's own table of month names */

import { dateOn } from '@polish/date';
import { MONTH_PATTERN, monthNumber } from '@polish/months';

export interface DateSpan {
  start: string;
  end: string;
}

export interface DateSpanOptions {
  today?: string;
}

type Groups = Record<string, string | undefined>;
type Build = (year: number) => DateSpan | null;

interface Today {
  iso: string;
  year: number;
}

const NEXT_YEAR = 1;
const LAST_YEAR = -1;
const SEARCH_YEARS = 9;
const CENTURY = 2000;
const DASHES = /[‐-―]/g;
const ROMAN = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

const DAY = String.raw`(?<![\d.])\d{1,2}(?!\d)`;
const NUMBER = String.raw`\d{1,2}(?!\d)`;
const WORD_YEAR = String.raw`\d{4}(?!\d)`;
const NUMERIC_YEAR = String.raw`(?:\d{4}|\d{2})(?!\d)`;
const ROMAN_MONTH = `${ROMAN.slice(1).toReversed().join('|')}|(?-i:I)`;
const MONTH = `(?:${MONTH_PATTERN}|${ROMAN_MONTH})`;
const DOT = '[./]';
const RANGE = String.raw`(?:\s*-\s*|\s+do\s+)`;
const LIST = String.raw`(?:\s*-\s*|\s+do\s+|\s*,\s*|\s+i\s+)`;

const DOT_ONLY = String.raw`\.`;
const NOT_MONEY = String.raw`(?!\s*(?:zł|pln|eur|usd|€|\$|%))`;
const QUALIFIER = [
  String.raw`br(?![a-ząćęłńóśźż])\.?`,
  String.raw`(?:w\s+)?(?:tym|przyszłym|zeszłym|ubiegłym)\s+roku`,
  String.raw`(?:bieżącego|przyszłego|zeszłego|ubiegłego)\s+roku`,
].join('|');
const RELATIVE = String.raw`(?:\s+(?<relative>${QUALIFIER}))?`;
const END_OF_DAY = String.raw`(?!\.?\d)\.?${NOT_MONEY}`;
const AFTER_HOUR = new RegExp(
  String.raw`godz(?:\.|ina|inie)?\s*\d{1,2}(?:[.:]\d{2})?(?:\s*-\s*\d{1,2}(?:[.:]\d{2})?)?`,
  'gi',
);
const TODAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const SHIFTS: [RegExp, number][] = [
  [/przyszł/i, NEXT_YEAR],
  [/zeszł|ubiegł/i, LAST_YEAR],
];

const regex = (source: string) => new RegExp(source, 'i');

const WORD_ACROSS = regex(
  String.raw`(?<d1>${DAY})\s+(?<m1>${MONTH})(?:\s+(?<y1>${WORD_YEAR}))?${RANGE}(?<d2>${DAY})\s+(?<m2>${MONTH})\s+(?<y2>${WORD_YEAR})`,
);
const WORD_DAYS = regex(
  String.raw`(?<days>${DAY}(?:${LIST}${DAY})*)\s+(?<m>${MONTH})\s+(?<y>${WORD_YEAR})`,
);
const NUMERIC_ACROSS = regex(
  `(?<d1>${DAY})${DOT}(?<m1>${NUMBER})(?:${DOT}(?<y1>${NUMERIC_YEAR}))?${RANGE}(?<d2>${DAY})${DOT}(?<m2>${NUMBER})${DOT}(?<y2>${NUMERIC_YEAR})`,
);
const NUMERIC_DAYS = regex(
  `(?<days>${DAY}(?:${RANGE}${DAY})+)${DOT}(?<m>${NUMBER})${DOT}(?<y>${NUMERIC_YEAR})`,
);
const NUMERIC = regex(
  `(?<d>${DAY})${DOT}(?<m>${NUMBER})${DOT}(?<y>${NUMERIC_YEAR})`,
);
const WORD_ACROSS_UNDATED = regex(
  String.raw`(?<d1>${DAY})\s+(?<m1>${MONTH})${RANGE}(?<d2>${DAY})\s+(?<m2>${MONTH})${RELATIVE}`,
);
const WORD_DAYS_UNDATED = regex(
  String.raw`(?<days>${DAY}(?:${LIST}${DAY})*)\s+(?<m>${MONTH})${RELATIVE}`,
);
const NUMERIC_ACROSS_UNDATED = regex(
  `(?<d1>${DAY})${DOT_ONLY}(?<m1>${NUMBER})${RANGE}(?<d2>${DAY})${DOT_ONLY}(?<m2>${NUMBER})${END_OF_DAY}${RELATIVE}`,
);
const NUMERIC_DAYS_UNDATED = regex(
  `(?<days>${DAY}(?:${RANGE}${DAY})+)${DOT_ONLY}(?<m>${NUMBER})${END_OF_DAY}${RELATIVE}`,
);
const NUMERIC_UNDATED = regex(
  `(?<d>${DAY})${DOT_ONLY}(?<m>${NUMBER})${END_OF_DAY}${RELATIVE}`,
);
const ISO = /(?<![\d-])(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})(?!\d)/;

const monthOf = (word = '') => {
  if (/^\d+$/.test(word)) {
    return Number(word);
  }

  return monthNumber(word) || ROMAN.indexOf(word.toUpperCase()) + 1;
};

const yearOf = (year = '') =>
  year.length === 2 ? CENTURY + Number(year) : Number(year);

const spanOf = (dates: (string | null)[]): DateSpan | null => {
  const valid = dates.filter((date): date is string => date !== null);
  const [start] = valid;
  const end = valid.at(-1);
  const isOrdered = valid.every(
    (date, index) => date >= (valid[index - 1] ?? date),
  );

  return valid.length === dates.length && isOrdered && start && end
    ? { start, end }
    : null;
};

const readAcross = (groups: Groups) => {
  const end = yearOf(groups.y2);
  const start = groups.y1 ? yearOf(groups.y1) : end;

  return spanOf([
    dateOn({ year: start, month: monthOf(groups.m1), day: Number(groups.d1) }),
    dateOn({ year: end, month: monthOf(groups.m2), day: Number(groups.d2) }),
  ]);
};

const daysIn =
  (groups: Groups): Build =>
  (year) =>
    spanOf(
      (groups.days?.match(/\d+/g) ?? []).map((day) =>
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

const readDays = (groups: Groups) => daysIn(groups)(yearOf(groups.y));

const readOne = (groups: Groups) => oneIn(groups)(yearOf(groups.y));

const READERS = [
  { pattern: WORD_ACROSS, read: readAcross },
  { pattern: WORD_DAYS, read: readDays },
  { pattern: NUMERIC_ACROSS, read: readAcross },
  { pattern: NUMERIC_DAYS, read: readDays },
  { pattern: NUMERIC, read: readOne },
  { pattern: ISO, read: readOne },
];

const UNDATED = [
  { pattern: WORD_ACROSS_UNDATED, build: acrossIn },
  { pattern: WORD_DAYS_UNDATED, build: daysIn },
  { pattern: NUMERIC_ACROSS_UNDATED, build: acrossIn },
  { pattern: NUMERIC_DAYS_UNDATED, build: daysIn },
  { pattern: NUMERIC_UNDATED, build: oneIn },
];

const firstOf = <Reader extends { pattern: RegExp }>(
  readers: Reader[],
  text: string,
) => {
  const reader = readers.find(({ pattern }) => pattern.test(text));
  const groups = reader?.pattern.exec(text)?.groups;

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
  SHIFTS.find(([pattern]) => pattern.test(relative))?.[1] ?? 0;

const resolve = (
  { build, relative }: { build: Build; relative: string | undefined },
  today: Today,
) =>
  relative
    ? build(today.year + shiftOf(relative))
    : (Array.from({ length: SEARCH_YEARS }, (unused, offset) =>
        build(today.year + offset),
      ).find((span) => span && span.end >= today.iso) ?? null);

export const dateSpanIn = (
  text: string,
  { today }: DateSpanOptions = {},
): DateSpan | null => {
  const plain = text.replaceAll(DASHES, '-');
  const dated = firstOf(READERS, plain);

  if (dated) {
    return dated.reader.read(dated.groups);
  }

  const now = todayOf(today);
  const undated = firstOf(UNDATED, plain.replaceAll(AFTER_HOUR, ' '));

  return now && undated
    ? resolve(
        {
          build: undated.reader.build(undated.groups),
          relative: undated.groups.relative,
        },
        now,
      )
    : null;
};
