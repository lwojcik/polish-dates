/* eslint-disable no-magic-numbers -- the days of the months of the Gregorian calendar */

export interface DateOnOptions {
  year: number;
  month: number;
  day: number;
}

const MONTHS_PER_YEAR = 12;
const YEAR_DIGITS = 4;
const LEAP_CYCLE = 4;
const CENTURY = 100;
const LEAP_CENTURY_CYCLE = 400;
const FEBRUARY = 2;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isLeapYear = (year: number) =>
  (year % LEAP_CYCLE === 0 && year % CENTURY !== 0) ||
  year % LEAP_CENTURY_CYCLE === 0;

const daysIn = ({ year, month }: Pick<DateOnOptions, 'month' | 'year'>) =>
  DAYS_IN_MONTH[month - 1] + Number(month === FEBRUARY && isLeapYear(year));

const pad = (value: number, length: number) =>
  String(value).padStart(length, '0');

export const dateOn = ({ year, month, day }: DateOnOptions): string | null => {
  const isValid =
    Number.isSafeInteger(year) &&
    Number.isSafeInteger(month) &&
    Number.isSafeInteger(day) &&
    year >= 0 &&
    month >= 1 &&
    month <= MONTHS_PER_YEAR &&
    day >= 1 &&
    day <= daysIn({ year, month });

  return isValid
    ? `${pad(year, YEAR_DIGITS)}-${pad(month, 2)}-${pad(day, 2)}`
    : null;
};
