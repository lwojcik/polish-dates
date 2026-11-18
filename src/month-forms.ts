import { fold } from '@polish/fold';
import { MONTH_PATTERN } from '@polish/months';

const LETTER = 'a-ząćęłńóśźż';
const ABBREVIATIONS_FROM = 3;

const TABLE = [
  ['stycznia', 'styczeń', 'styczniu', 'sty', 'stycz'],
  ['lutego', 'luty', 'lutym', 'lut'],
  ['marca', 'marzec', 'marcu', 'mar', 'marz'],
  ['kwietnia', 'kwiecień', 'kwietniu', 'kwi', 'kwiet'],
  ['maja', 'maj', 'maju', 'maj'],
  ['czerwca', 'czerwiec', 'czerwcu', 'cze', 'czer', 'czerw'],
  ['lipca', 'lipiec', 'lipcu', 'lip'],
  ['sierpnia', 'sierpień', 'sierpniu', 'sie', 'sierp'],
  ['września', 'wrzesień', 'wrześniu', 'wrz', 'wrzes', 'wrześ'],
  ['października', 'październik', 'październiku', 'paź', 'paźdz'],
  ['listopada', 'listopad', 'listopadzie', 'lis', 'listop'],
  ['grudnia', 'grudzień', 'grudniu', 'gru', 'grud'],
];

const alternatives = (forms: string[]) =>
  forms.toSorted((first, second) => second.length - first.length).join('|');

const INDEX = new Map<string, number>(
  TABLE.flatMap((forms, index) =>
    forms.map((form): [string, number] => [fold(form), index + 1]),
  ),
);

const OTHER_FORMS = alternatives(
  TABLE.flatMap(([, nominative, locative]) => [nominative, locative]),
);
const ABBREVIATIONS = alternatives(
  TABLE.flatMap((forms) => forms.slice(ABBREVIATIONS_FROM)),
);

export const monthIndex = (word: string) =>
  INDEX.get(fold(word.replace(/\.$/, ''))) ?? 0;

export const ABBREVIATION = String.raw`(?:${ABBREVIATIONS})(?![${LETTER}])\.?`;

export const GENITIVE_OR_ABBREVIATION = `(?:(?:${MONTH_PATTERN})(?![${LETTER}])|${ABBREVIATION})`;

export const NOMINATIVE_OR_LOCATIVE = `(?:${OTHER_FORMS})(?![${LETTER}])`;

export const ANY_MONTH = `(?:(?:${MONTH_PATTERN}|${OTHER_FORMS})(?![${LETTER}])|${ABBREVIATION})`;
