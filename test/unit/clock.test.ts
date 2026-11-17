import { describe, expect, it } from 'vitest';

import { clocksIn } from '@polish/clock';

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
