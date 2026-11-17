/* eslint-disable security/detect-non-literal-regexp -- the patterns are built from this package's own table of month names */

import { dateOn } from '@polish/date';
import { MONTH_PATTERN, monthNumber } from '@polish/months';

export interface DateSpan {
  start: string;
  end: string;
}

interface Point {
  day: string;
  month: string;
  year: string;
}

const DASHES = /[‐-―]/g;
const MONTH = `(${MONTH_PATTERN})`;
const DAY = String.raw`(\d{1,2})`;
const YEAR = String.raw`(\d{4})`;
const RANGE = String.raw`\s*-\s*`;

const ACROSS_MONTHS = new RegExp(
  String.raw`${DAY}\s+${MONTH}(?:\s+${YEAR})?${RANGE}${DAY}\s+${MONTH}\s+${YEAR}`,
  'i',
);
const WITHIN_MONTH = new RegExp(
  String.raw`${DAY}(?:${RANGE}|\s+i\s+)${DAY}\s+${MONTH}\s+${YEAR}`,
  'i',
);
const SINGLE = new RegExp(String.raw`${DAY}\s+${MONTH}\s+${YEAR}`, 'i');
const NUMERIC = /(\d{1,2})\.(\d{2})\.(\d{4})/;

const point = ({ day, month, year }: Point) =>
  dateOn({ year: +year, month: monthNumber(month), day: +day });

const span = (from: string | null, until: string | null): DateSpan | null =>
  from && until && until >= from ? { start: from, end: until } : null;

export const dateSpanIn = (text: string): DateSpan | null => {
  const plain = text.replaceAll(DASHES, '-');
  const across = ACROSS_MONTHS.exec(plain);

  if (across) {
    const [, d1, m1, y1, d2, m2, y2] = across;

    return span(
      point({ day: d1, month: m1, year: y1 ?? y2 }),
      point({ day: d2, month: m2, year: y2 }),
    );
  }

  const within = WITHIN_MONTH.exec(plain);

  if (within) {
    const [, d1, d2, month, year] = within;

    return span(
      point({ day: d1, month, year }),
      point({ day: d2, month, year }),
    );
  }

  const single = SINGLE.exec(plain);

  if (single) {
    const [, day, month, year] = single;
    const date = point({ day, month, year });

    return span(date, date);
  }

  const numeric = NUMERIC.exec(plain);

  if (numeric) {
    const date = dateOn({
      year: +numeric[3],
      month: +numeric[2],
      day: +numeric[1],
    });

    return span(date, date);
  }

  return null;
};
