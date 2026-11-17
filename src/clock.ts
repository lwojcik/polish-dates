export type Clock = [hour: number, minute: number];

const CLOCK = /(\d{1,2})[.:](\d{2})/g;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;

export const clocksIn = (text: string): Clock[] =>
  text
    .matchAll(CLOCK)
    .map((match): Clock => [+match[1], +match[2]])
    .filter(
      ([hour, minute]) => hour < HOURS_PER_DAY && minute < MINUTES_PER_HOUR,
    )
    .toArray();
