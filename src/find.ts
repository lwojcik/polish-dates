import { type DateSpanOptions, firstIn, todayOf } from '@polish/span';
import { plainOf } from '@polish/tolerance';
import type { DateSpan } from '@polish/types';

/** A date in a text: `text.slice(index, index + length)` is its words. */
export interface DateMatch extends DateSpan {
  index: number;
  length: number;
}

interface Search {
  now: ReturnType<typeof todayOf>;
  isTolerant: boolean;
  originalAt: (offset: number) => number;
}

const BLANK = '\u{E001}';

const collect = (
  rest: string,
  { search, found }: { search: Search; found: DateMatch[] },
): DateMatch[] => {
  const next = firstIn(rest, search);

  if (!next) {
    return found;
  }

  const { span, index, length } = next;
  const { originalAt } = search;
  const end = index + length;
  const blanked = rest.slice(0, index) + BLANK.repeat(length) + rest.slice(end);
  const match: DateMatch[] = span
    ? [
        {
          ...span,
          index: originalAt(index),
          length: originalAt(end) - originalAt(index),
        },
      ]
    : [];

  return collect(blanked, { search, found: [...found, ...match] });
};

/**
 * Finds every date in the text, in order, each with its position.
 * A weekday written before the date is part of the match, and a date that
 * does not exist is left out.
 */
export const findDates = (
  text: string,
  { today, tolerant = false }: DateSpanOptions = {},
): DateMatch[] => {
  const { text: plain, originalAt } = plainOf(text, tolerant);

  return collect(plain, {
    search: { now: todayOf(today), isTolerant: tolerant, originalAt },
    found: [],
  }).toSorted((first, second) => first.index - second.index);
};

/** The text with every match of `findDates` cut out. */
export const withoutDates = (text: string, options: DateSpanOptions = {}) =>
  findDates(text, options).reduceRight(
    (rest, { index, length }) =>
      rest.slice(0, index) + rest.slice(index + length),
    text,
  );
