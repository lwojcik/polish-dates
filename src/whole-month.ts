/* eslint-disable no-magic-numbers -- the days of a month that a word for a part of it names */

import { dateOn } from '@polish/date';
import { fold } from '@polish/fold';
import { NEXT_YEAR } from '@polish/patterns';
import {
  type Build,
  type Groups,
  monthOf,
  spanOf,
  yearOf,
} from '@polish/spans';

const LAST_DAYS = [31, 30, 29, 28];

const PARTS: [RegExp, number, number | null][] = [
  [/^(?:i$|pierwsz)/, 1, 15],
  [/^(?:ii$|drug)/, 16, null],
  [/^pocz/, 1, 10],
  [/^(?:srod|polow)/, 11, 20],
  [/^kon/, 21, null],
];

const lastDayOf = (year: number, month: number) =>
  LAST_DAYS.find((day) => dateOn({ year, month, day }) !== null) ?? 0;

const endOf = (year: number, month: number) =>
  dateOn({ year, month, day: lastDayOf(year, month) });

const startOf = (year: number, month: number) =>
  dateOn({ year, month, day: 1 });

export const wholeIn =
  (groups: Groups): Build =>
  (year) => {
    const month = monthOf(groups.m);

    return spanOf([startOf(year, month), endOf(year, month)]);
  };

export const partIn =
  (groups: Groups): Build =>
  (year) => {
    const month = monthOf(groups.m);
    const word = fold(groups.half ?? groups.part ?? '');
    const found = PARTS.find(([pattern]) => pattern.test(word));

    return found
      ? spanOf([
          dateOn({ year, month, day: found[1] }),
          found[2] === null
            ? endOf(year, month)
            : dateOn({ year, month, day: found[2] }),
        ])
      : null;
  };

export const monthsAcrossIn =
  (groups: Groups): Build =>
  (year) => {
    const first = monthOf(groups.m1);
    const last = monthOf(groups.m2);
    const endYear = last < first ? year + NEXT_YEAR : year;

    return spanOf([startOf(year, first), endOf(endYear, last)]);
  };

export const readWhole = (groups: Groups) => wholeIn(groups)(yearOf(groups.y));

export const readPart = (groups: Groups) => partIn(groups)(yearOf(groups.y));

export const readMonths = (groups: Groups) => {
  const endYear = yearOf(groups.y2);
  const startYear = groups.y1 ? yearOf(groups.y1) : endYear;

  return spanOf([
    startOf(startYear, monthOf(groups.m1)),
    endOf(endYear, monthOf(groups.m2)),
  ]);
};
