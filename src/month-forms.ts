import { fold } from '@polish/fold';
import { MONTH_PATTERN, POLISH_MONTHS } from '@polish/months';

const LETTER = 'a-ząćęłńóśźż';

const NOMINATIVE = [
  'styczeń',
  'luty',
  'marzec',
  'kwiecień',
  'maj',
  'czerwiec',
  'lipiec',
  'sierpień',
  'wrzesień',
  'październik',
  'listopad',
  'grudzień',
];

const LOCATIVE = [
  'styczniu',
  'lutym',
  'marcu',
  'kwietniu',
  'maju',
  'czerwcu',
  'lipcu',
  'sierpniu',
  'wrześniu',
  'październiku',
  'listopadzie',
  'grudniu',
];

const ABBREVIATIONS = [
  ['sty', 'stycz'],
  ['lut'],
  ['mar', 'marz'],
  ['kwi', 'kwiet'],
  ['maj'],
  ['cze', 'czer', 'czerw'],
  ['lip'],
  ['sie', 'sierp'],
  ['wrz', 'wrzes', 'wrześ'],
  ['paź', 'paźdz'],
  ['lis', 'listop'],
  ['gru', 'grud'],
];

const alternatives = (forms: string[]) =>
  forms.toSorted((first, second) => second.length - first.length).join('|');

const INDEX = new Map<string, number>(
  POLISH_MONTHS.flatMap((genitive, index) =>
    [
      genitive,
      NOMINATIVE[index] ?? '',
      LOCATIVE[index] ?? '',
      ...(ABBREVIATIONS[index] ?? []),
    ].map((form): [string, number] => [fold(form), index + 1]),
  ),
);

export const monthIndex = (word: string) =>
  INDEX.get(fold(word.replace(/\.$/, ''))) ?? 0;

export const ABBREVIATION = String.raw`(?:${alternatives(ABBREVIATIONS.flat())})(?![${LETTER}])\.?`;

export const GENITIVE_OR_ABBREVIATION = `(?:(?:${MONTH_PATTERN})(?![${LETTER}])|${ABBREVIATION})`;

export const NOMINATIVE_OR_LOCATIVE = `(?:${alternatives([...NOMINATIVE, ...LOCATIVE])})(?![${LETTER}])`;

export const ANY_MONTH = `(?:(?:${MONTH_PATTERN}|${alternatives([...NOMINATIVE, ...LOCATIVE])})(?![${LETTER}])|${ABBREVIATION})`;
