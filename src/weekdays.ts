import { fold } from '@polish/fold';
import { choose, compile } from '@polish/pattern';

const LETTERS = 'a-ząćęłńóśźż';
const MONDAY_FIRST = 6;
const MS_PER_DAY = 86_400_000;
const ISO_LENGTH = 10;

export const DAYS_PER_WEEK = 7;
export const SATURDAY = 5;
export const SUNDAY = 6;

const WEEKDAY_NAMES = [
  ['poniedziałek', 'poniedziałku', 'poniedziałkiem', 'pon', 'pn'],
  ['wtorek', 'wtorku', 'wtorkiem', 'wt'],
  ['środa', 'środę', 'środy', 'środzie', 'środą', 'śr'],
  ['czwartek', 'czwartku', 'czwartkiem', 'czw'],
  ['piątek', 'piątku', 'piątkiem', 'pt'],
  ['sobota', 'sobotę', 'soboty', 'sobocie', 'sobotą', 'sob', 'sb'],
  ['niedziela', 'niedzielę', 'niedzieli', 'niedzielą', 'niedz', 'ndz', 'nd'],
];

export const WORD_START = `(?<![${LETTERS}])`;
export const WORD_END = `(?![${LETTERS}])`;

export const WEEKDAY = `${WORD_START}(?:${WEEKDAY_NAMES.flat()
  .toSorted((first, second) => second.length - first.length)
  .join('|')})${WORD_END}`;

export const WEEKDAY_WORD = String.raw`${WEEKDAY}\.?`;

const FOLDED_NAMES = WEEKDAY_NAMES.map((forms) => forms.map(fold));

const WEEKDAYS = compile(WEEKDAY, 'gi');

export const weekdayOf = (word: string) =>
  FOLDED_NAMES.findIndex((forms) => forms.includes(fold(word)));

export const weekdaysIn = (text: string) =>
  text
    .matchAll(choose(WEEKDAYS, true))
    .map(([word]) => weekdayOf(word))
    .toArray();

export const dayOfWeek = (iso: string) =>
  (new Date(Date.parse(iso)).getUTCDay() + MONDAY_FIRST) % DAYS_PER_WEEK;

export const addDays = (iso: string, days: number) =>
  new Date(Date.parse(iso) + days * MS_PER_DAY)
    .toISOString()
    .slice(0, ISO_LENGTH);
