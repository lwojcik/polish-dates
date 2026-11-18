import { monthIndex } from '@polish/month-forms';
import { ROMAN } from '@polish/patterns';
import type { DateSpan } from '@polish/types';

export type Groups = Record<string, string | undefined>;
export type Build = (year: number) => DateSpan | null;

const CENTURY = 2000;

export const monthOf = (word = '') => {
  if (/^\d+$/.test(word)) {
    return Number(word);
  }

  return monthIndex(word) || ROMAN.indexOf(word.toUpperCase()) + 1;
};

export const yearOf = (year = '') =>
  year.length === 2 ? CENTURY + Number(year) : Number(year);

export const spanOf = (dates: (string | null)[]): DateSpan | null => {
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
