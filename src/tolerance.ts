/* eslint-disable security/detect-non-literal-regexp -- the patterns are built from this package's own table of month names */

import { fold } from '@polish/fold';
import { MONTH_PATTERN, POLISH_MONTHS } from '@polish/months';
import { loosen } from '@polish/pattern';

const LETTER = 'a-ząćęłńóśźż';
const FOLDED_MONTHS = POLISH_MONTHS.map(fold);
const MONTHS = loosen(MONTH_PATTERN);
const MIN_TYPO_LENGTH = 5;
const WORD_AFTER_NUMBER = new RegExp(
  `(?<=\\d\\.?\\s{0,3})[${LETTER}]{${MIN_TYPO_LENGTH},}(?![${LETTER}])`,
  'gi',
);
const BEFORE_MONTH = new RegExp(
  String.raw`(\d)\.?\s*(?=(?:${MONTHS})(?![${LETTER}]))`,
  'gi',
);
const AFTER_MONTH = new RegExp(
  String.raw`(?<![${LETTER}])(${MONTHS})(?=\d)`,
  'gi',
);

const isNear = (word: string, month: string) => {
  const prefix = [...word].findIndex(
    (letter, index) => letter !== month[index],
  );
  const at = prefix === -1 ? word.length : prefix;
  const gap = word.length - month.length;
  const rest = { word: word.slice(at), month: month.slice(at) };

  return (
    (gap === 0 &&
      (rest.word.slice(1) === rest.month.slice(1) ||
        (rest.word[0] === rest.month[1] &&
          rest.word[1] === rest.month[0] &&
          rest.word.slice(2) === rest.month.slice(2)))) ||
    (gap === 1 && rest.word.slice(1) === rest.month) ||
    (gap === -1 && rest.word === rest.month.slice(1))
  );
};

const correct = (word: string) => {
  const folded = fold(word);
  const exact = FOLDED_MONTHS.indexOf(folded);
  const near = FOLDED_MONTHS.keys()
    .filter((position) => isNear(folded, FOLDED_MONTHS[position] ?? ''))
    .toArray();
  const index = exact === -1 && near.length === 1 ? near[0] : exact;

  return POLISH_MONTHS[index] ?? word;
};

export const tidy = (text: string) =>
  text
    .normalize('NFC')
    .replaceAll(WORD_AFTER_NUMBER, (word) => correct(word))
    .replaceAll(BEFORE_MONTH, (match, digit: string) => `${digit} `)
    .replaceAll(AFTER_MONTH, (match, month: string) => `${month} `);
