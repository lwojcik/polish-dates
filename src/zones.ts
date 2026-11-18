export const ZONE_NAMES =
  'utc|gmt|cest|cet|eest|eet|west|wet|bst|est|edt|cst|cdt|mst|mdt|pst|pdt';

export const ZONE = String.raw`(?:${ZONE_NAMES})(?:[+-]\d{1,2}(?::?\d{2})?)?(?![a-ząćęłńóśźż])`;

export const NOT_ZONE = String.raw`(?!\s*${ZONE})`;
