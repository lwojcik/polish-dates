import { ZONE_NAMES } from '@polish/zones';

const LETTER = 'a-ząćęłńóśźż';
const NOT_A_CODE = `${ZONE_NAMES.toUpperCase()}|LUB`;
const CODE = `(?-i:(?!(?:${NOT_A_CODE})(?![A-Z]))[A-Z]{3})`;
const WORDS = [
  'z[łl](?:ot(?:y|ych|e|ego))?',
  'pln|usd|eur|euro',
  'dolar(?:y|ów|a|ami)?',
  'funt(?:y|ów|a|ami)?',
  'frank(?:i|ów|a|ami)?',
  'groszy',
].join('|');

export const NOT_MONEY = String.raw`(?!\s*(?:(?:${WORDS}|${CODE})(?![${LETTER}])|[€$£¥%]))`;

export const NOT_AFTER_MONEY = String.raw`(?<![€$£¥]|(?:pln|usd|eur)\s*|(?-i:(?<![A-Za-z])(?!(?:${NOT_A_CODE})(?![A-Z]))[A-Z]{3})\s*)`;
