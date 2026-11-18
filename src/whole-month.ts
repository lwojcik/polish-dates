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
  Math.max(0, ...LAST_DAYS.filter((day) => dateOn({ year, month, day })));

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
    const word = fold(groups.half ?? groups.part);
    /* eslint-disable-next-line unicorn/prefer-array-find -- the destructuring has a default and no branch that cannot run */
    const [[, from = 1, to = null] = []] = PARTS.filter(([pattern]) =>
      pattern.test(word),
    );

    return spanOf([
      dateOn({ year, month, day: from }),
      to === null ? endOf(year, month) : dateOn({ year, month, day: to }),
    ]);
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
