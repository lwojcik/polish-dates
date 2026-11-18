/* eslint-disable security/detect-non-literal-regexp, sonarjs/super-linear-regex -- the patterns are built from this package's own parts and the scan is bounded by the length of a class */

import { fold } from '@polish/fold';

export interface Pattern {
  strict: RegExp;
  tolerant: RegExp;
}

export const DOT = '\u{E000}';

const STRICT_DOT = '[./]';
const TOLERANT_DOT = String.raw`(?:[./]\s?|,)`;
const CLASS_OR_LETTER = /\[[^\]]*]|[óąćęłńśźż]/gi;

export const loosen = (source: string) =>
  source.replaceAll(CLASS_OR_LETTER, (part) =>
    part.length > 1 ? part : `[${part}${fold(part)}]`,
  );

export const compile = (source: string, flags = 'i'): Pattern => ({
  strict: new RegExp(
    source.replaceAll(DOT, () => STRICT_DOT),
    flags,
  ),
  tolerant: new RegExp(
    loosen(source.replaceAll(DOT, () => TOLERANT_DOT)),
    flags,
  ),
});

export const choose = ({ strict, tolerant }: Pattern, isTolerant: boolean) =>
  isTolerant ? tolerant : strict;
