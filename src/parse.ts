/* eslint-disable security/detect-non-literal-regexp -- the patterns are bounded, meant for short sentences and built from this file's own parts */

import { type Clock, clockAfterHour, clocksIn } from '@polish/clock';
import { DASHES } from '@polish/dashes';
import { NOT_AFTER_MONEY, NOT_MONEY } from '@polish/money';
import { dateSpanIn, type DateSpanOptions } from '@polish/span';
import { ZONE } from '@polish/zones';

export interface ParsedDate {
  start: string | null;
  end: string | null;
  times: Clock[];
}

const MONTHS_PER_YEAR = 12;
const LINK = String.raw`(?:\s*-\s*|\s+(?:i|oraz|lub|do)\s+)`;
const NOT_PART_OF_DATE = String.raw`(?!\d|[.:]\d)`;
const ZONE_AFTER = new RegExp(`${ZONE}$`, 'i');
const CLOCK_PARTS = /\d{1,2}(?<separator>[.:])(?<minute>\d{2})/g;

const timesAt = (separator: string) => {
  const after = String.raw`\d{1,2}${separator}\d{2}(?!\d)`;
  const bare = String.raw`\d{1,2}[.:]\d{2}${NOT_PART_OF_DATE}`;

  return new RegExp(
    String.raw`godz(?:\.|ina|inie)?\s*\d{1,2}(?:${separator}\d{2})?(?:${LINK}${after})*|(?<![\d.:,])${NOT_AFTER_MONEY}${bare}${NOT_MONEY}(?:${LINK}${bare})*(?:\s*${ZONE})?`,
    'gi',
  );
};

const STRICT_TIMES = timesAt('[.:]');
const TOLERANT_TIMES = timesAt('[.:,]');

const isTimeOfDay = (token: string) =>
  ZONE_AFTER.test(token) ||
  token
    .matchAll(CLOCK_PARTS)

    .some(({ groups }) => {
      const minute = Number(groups?.minute);

      return (
        groups?.separator === ':' || !(minute > 0 && minute <= MONTHS_PER_YEAR)
      );
    });

const clocksOf = (token: string): Clock[] => {
  const clocks = clocksIn(token);
  const hour = clockAfterHour(token);

  if (/^godz/i.test(token)) {
    return clocks.length === 0 && hour ? [hour] : clocks;
  }

  return isTimeOfDay(token) ? clocks : [];
};

export const parseDate = (
  text: string,
  options: DateSpanOptions = {},
): ParsedDate => {
  const span = dateSpanIn(text, options);
  const times = options.tolerant ? TOLERANT_TIMES : STRICT_TIMES;

  return {
    start: span?.start ?? null,
    end: span?.end ?? null,
    times: text
      .replaceAll(DASHES, '-')
      .matchAll(times)
      .flatMap(([token]) => clocksOf(token.replaceAll(',', '.')))
      .toArray(),
  };
};
