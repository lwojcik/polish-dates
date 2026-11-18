/* eslint-disable security/detect-unsafe-regex -- the pattern is bounded and anchored on a word, and is meant for short sentences */

export type Clock = [hour: number, minute: number];

const CLOCK = /(\d{1,2})[.:](\d{2})/g;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;

const isTimeOfDay = ([hour, minute]: Clock) =>
  hour < HOURS_PER_DAY && minute < MINUTES_PER_HOUR;

export interface ClockMatch {
  clock: Clock;
  index: number;
  length: number;
}

export const findClocks = (text: string): ClockMatch[] =>
  text
    .matchAll(CLOCK)
    .map((match): ClockMatch => ({
      clock: [+match[1], +match[2]],
      index: match.index,
      length: match[0].length,
    }))
    .filter(({ clock }) => isTimeOfDay(clock))
    .toArray();

export const clocksIn = (text: string): Clock[] =>
  findClocks(text).map(({ clock }) => clock);

const HOUR = /godz(?:\.|ina|inie)?\s*(\d{1,2})(?:[.:](\d{2}))?/i;

export const clockAfterHour = (text: string): Clock | null => {
  const match = HOUR.exec(text);

  if (!match) {
    return null;
  }

  const clock: Clock = [+match[1], +(match[2] ?? 0)];

  return clock[0] < HOURS_PER_DAY && clock[1] < MINUTES_PER_HOUR ? clock : null;
};
