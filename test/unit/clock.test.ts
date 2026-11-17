import { describe, expect, it } from 'vitest';

import { clockAfterHour, clocksIn } from '@polish/clock';

describe('clocksIn', () => {
  it('reads times written with a dot or a colon, in order', () => {
    expect(clocksIn('godz. 10.00 -11:30 i 9.05')).toEqual([
      [10, 0],
      [11, 30],
      [9, 5],
    ]);
  });

  it('skips what is not a time of day', () => {
    expect(clocksIn('24.00 12.60 abc')).toEqual([]);
  });
});

describe('clockAfterHour', () => {
  it.each([
    ['godz. 17', [17, 0]],
    ['o godz. 17.30', [17, 30]],
    ['godzina 9:05', [9, 5]],
    ['w godzinie 8', [8, 0]],
    ['GODZ 12.15', [12, 15]],
  ])('reads %s', (text, clock) => {
    expect(clockAfterHour(text)).toEqual(clock);
  });

  it('gives null without the word, or for a time that does not exist', () => {
    expect(clockAfterHour('o 17.30')).toBeNull();
    expect(clockAfterHour('godz. 24')).toBeNull();
    expect(clockAfterHour('godz. 12.60')).toBeNull();
  });
});
