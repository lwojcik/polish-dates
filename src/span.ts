/* eslint-disable security/detect-non-literal-regexp -- the patterns are built from this package's own table of month names */

import { dateOn } from '@polish/date';
import { MONTH_PATTERN, monthNumber } from '@polish/months';

export interface DateSpan {
  start: string;
  end: string;
}

type Groups = Record<string, string | undefined>;

const AND = 'i';
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
const MONTH = `(?:${MONTH_PATTERN}|${ROMAN.toReversed().join('|')})`;
const DOT = '[./]';
const RANGE = String.raw`(?:\s*-\s*|\s+do\s+)`;
const LIST = String.raw`(?:\s*-\s*|\s+do\s+|\s*,\s*|\s+i\s+)`;

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
const ISO = /(?<![\d-])(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})(?!\d)/;

const monthOf = (word = '') => {
  if (/^\d+$/.test(word)) {
    return Number(word);
  }

  return (
    monthNumber(word) ||
    (word === AND ? 0 : ROMAN.indexOf(word.toUpperCase()) + 1)
  );
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

const readDays = (groups: Groups) =>
  spanOf(
    (groups.days?.match(/\d+/g) ?? []).map((day) =>
      dateOn({
        year: yearOf(groups.y),
        month: monthOf(groups.m),
        day: Number(day),
      }),
    ),
  );

const readOne = (groups: Groups) =>
  spanOf([
    dateOn({
      year: yearOf(groups.y),
      month: monthOf(groups.m),
      day: Number(groups.d),
    }),
  ]);

const READERS = [
  { pattern: WORD_ACROSS, read: readAcross },
  { pattern: WORD_DAYS, read: readDays },
  { pattern: NUMERIC_ACROSS, read: readAcross },
  { pattern: NUMERIC_DAYS, read: readDays },
  { pattern: NUMERIC, read: readOne },
  { pattern: ISO, read: readOne },
];

export const dateSpanIn = (text: string): DateSpan | null => {
  const plain = text.replaceAll(DASHES, '-');
  const reader = READERS.find(({ pattern }) => pattern.test(plain));
  const groups = reader?.pattern.exec(plain)?.groups;

  return reader && groups ? reader.read(groups) : null;
};
