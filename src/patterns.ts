/* eslint-disable security/detect-non-literal-regexp -- the patterns are built from this package's own table of month names */

import { NOT_AFTER_MONEY, NOT_MONEY } from '@polish/money';
import { MONTH_PATTERN } from '@polish/months';
import { compile, DOT } from '@polish/pattern';
import { WEEKDAY_WORD } from '@polish/weekdays';
import { NOT_ZONE } from '@polish/zones';

export const NEXT_YEAR = 1;
export const LAST_YEAR = -1;
export const ROMAN = [
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

export const DAY = String.raw`(?<![\d.])\d{1,2}(?!\d)`;
export const MONTH_NUMBER = String.raw`(?:0?[1-9]|1[0-2])(?!\d)`;
export const NUMBER = String.raw`\d{1,2}(?!\d)`;
export const WORD_YEAR = String.raw`\d{4}(?!\d)`;
export const NUMERIC_YEAR = String.raw`(?:\d{4}|\d{2})(?!\d)`;
export const ROMAN_MONTH = `${ROMAN.slice(1).toReversed().join('|')}|(?-i:I)`;
export const MONTH = `(?:${MONTH_PATTERN}|${ROMAN_MONTH})`;
export const RANGE = String.raw`(?:\s*-\s*|\s+do\s+)`;
export const LIST = String.raw`(?:\s*-\s*|\s+do\s+|\s*,\s*|\s+i\s+)`;

export const DOT_ONLY = String.raw`\.`;
export const QUALIFIER = [
  String.raw`br(?![a-ząćęłńóśźż])\.?`,
  String.raw`(?:w\s+)?(?:tym|przyszłym|zeszłym|ubiegłym)\s+roku`,
  String.raw`(?:bieżącego|przyszłego|zeszłego|ubiegłego)\s+roku`,
].join('|');
export const RELATIVE = String.raw`(?:\s+(?<relative>${QUALIFIER}))?`;
export const END_OF_DAY = String.raw`(?!\.?\d)\.?${NOT_MONEY}${NOT_ZONE}`;
export const AFTER_HOUR = new RegExp(
  String.raw`godz(?:\.|ina|inie)?\s*\d{1,2}(?:[.:]\d{2})?(?:\s*-\s*\d{1,2}(?:[.:]\d{2})?)?`,
  'gi',
);
export const TODAY = /^(\d{4})-(\d{2})-(\d{2})$/;
export const SHIFTS: [RegExp, number][] = [
  [/przyszl/, NEXT_YEAR],
  [/zeszl|ubiegl/, LAST_YEAR],
];

export const WEEKDAY_SEPARATOR = String.raw`(?:\s*-\s*|\s+i\s+|\s+do\s+)`;
export const LEAD = String.raw`(?:${WEEKDAY_WORD}(?:${WEEKDAY_SEPARATOR}${WEEKDAY_WORD})*[,\s]*)?`;
export const ITEM = `${LEAD}${DAY}`;

export const WORD_ACROSS = compile(
  String.raw`(?<lead>${LEAD})(?<d1>${DAY})\s+(?<m1>${MONTH})(?:\s+(?<y1>${WORD_YEAR}))?${RANGE}(?<mid>${LEAD})(?<d2>${DAY})\s+(?<m2>${MONTH})\s+(?<y2>${WORD_YEAR})`,
);
export const WORD_DAYS = compile(
  String.raw`(?<days>${ITEM}(?:${LIST}${ITEM})*)\s+(?<m>${MONTH})\s+(?<y>${WORD_YEAR})`,
);
export const NUMERIC_ACROSS = compile(
  `(?<lead>${LEAD})(?<d1>${DAY})${DOT}(?<m1>${NUMBER})(?:${DOT}(?<y1>${NUMERIC_YEAR}))?${RANGE}(?<mid>${LEAD})(?<d2>${DAY})${DOT}(?<m2>${NUMBER})${DOT}(?<y2>${NUMERIC_YEAR})`,
);
export const NUMERIC_DAYS = compile(
  `(?<days>${ITEM}(?:${RANGE}${ITEM})+)${DOT}(?<m>${NUMBER})${DOT}(?<y>${NUMERIC_YEAR})`,
);
export const NUMERIC = compile(
  `(?<lead>${LEAD})(?<d>${DAY})${DOT}(?<m>${NUMBER})${DOT}(?<y>${NUMERIC_YEAR})`,
);
export const WORD_ACROSS_UNDATED = compile(
  String.raw`(?<lead>${LEAD})(?<d1>${DAY})\s+(?<m1>${MONTH})${RANGE}(?<mid>${LEAD})(?<d2>${DAY})\s+(?<m2>${MONTH})${RELATIVE}`,
);
export const WORD_DAYS_UNDATED = compile(
  String.raw`(?<days>${ITEM}(?:${LIST}${ITEM})*)\s+(?<m>${MONTH})${RELATIVE}`,
);
export const NUMERIC_ACROSS_UNDATED = compile(
  `(?<lead>${LEAD})(?<d1>${DAY})${DOT_ONLY}(?<m1>${MONTH_NUMBER})${RANGE}(?<mid>${LEAD})(?<d2>${DAY})${DOT_ONLY}(?<m2>${MONTH_NUMBER})${END_OF_DAY}${RELATIVE}`,
);
export const NUMERIC_DAYS_UNDATED = compile(
  `(?<days>${ITEM}(?:${RANGE}${ITEM})+)${DOT_ONLY}(?<m>${MONTH_NUMBER})${END_OF_DAY}${RELATIVE}`,
);
export const NUMERIC_UNDATED = compile(
  `(?<lead>${LEAD})${NOT_AFTER_MONEY}(?<d>${DAY})${DOT_ONLY}(?<m>${MONTH_NUMBER})${END_OF_DAY}${RELATIVE}`,
);
export const NUMERIC_DASHED = compile(
  String.raw`(?<lead>${LEAD})(?<![\d.-])(?<d>\d{1,2})-(?<m>\d{1,2})-(?<y>\d{4})(?!\d)`,
);
export const ISO = compile(
  String.raw`(?<lead>${LEAD})(?<![\d-])(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})(?!\d)`,
);
