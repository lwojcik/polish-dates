/* eslint-disable security/detect-non-literal-regexp -- the patterns are built from this package's own table of month names */

import { DASHES } from '@polish/dashes';
import { fold } from '@polish/fold';
import { MONTH_PATTERN, POLISH_MONTHS } from '@polish/months';
import { loosen } from '@polish/pattern';

const LETTER = 'a-ząćęłńóśźż';
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
  const near = POLISH_MONTHS.filter((month) => isNear(folded, fold(month)));
  const [only = word] = near;

  return near.length === 1 ? only : word;
};

interface Unit {
  char: string;
  at: number;
}

export interface Tidied {
  text: string;
  originalAt: (offset: number) => number;
}

interface Rewrite {
  pattern: RegExp;
  replace: (match: RegExpExecArray) => string;
}

// eslint-disable-next-line security/detect-unsafe-regex -- a letter and the marks that follow it, on a short sentence
const COMBINED = /.[\u{300}-\u{36F}]*/gsu;

const textOf = (units: Unit[]) => units.map(({ char }) => char).join('');

const rewrite = (units: Unit[], { pattern, replace }: Rewrite) => {
  const matches = textOf(units).matchAll(pattern).toArray();
  const starts = new Map(matches.map((match) => [match.index, match]));
  const isCovered = (offset: number) =>
    matches.some(
      ({ index, 0: whole }) => offset >= index && offset < index + whole.length,
    );

  return units.flatMap((unit, offset) => {
    const match = starts.get(offset);

    if (match) {
      return replace(match)
        .split('')
        .map((char) => ({ char, at: unit.at }));
    }

    return isCovered(offset) ? [] : [unit];
  });
};

const REWRITES: Rewrite[] = [
  { pattern: WORD_AFTER_NUMBER, replace: ([word]) => correct(word) },
  { pattern: BEFORE_MONTH, replace: ([, digit]) => `${digit} ` },
  { pattern: AFTER_MONTH, replace: ([, month]) => `${month} ` },
];

const applyAll = ([first, ...others]: Rewrite[], units: Unit[]): Unit[] =>
  first ? applyAll(others, rewrite(units, first)) : units;

export const tidyWithOffsets = (text: string): Tidied => {
  const letters = text
    .matchAll(COMBINED)
    .flatMap(({ 0: cluster, index }) =>
      cluster
        .normalize('NFC')
        .split('')
        .map((char) => ({ char, at: index })),
    )
    .toArray();
  const units = applyAll(REWRITES, letters);

  return {
    text: textOf(units),
    originalAt: (offset) => units[offset]?.at ?? text.length,
  };
};

export const plainOf = (text: string, isTolerant: boolean): Tidied => {
  const { text: tidied, originalAt } = isTolerant
    ? tidyWithOffsets(text)
    : { text, originalAt: (offset: number) => offset };

  return { text: tidied.replaceAll(DASHES, '-'), originalAt };
};
