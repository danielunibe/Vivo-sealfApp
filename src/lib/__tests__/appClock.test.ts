import { describe, expect, test } from 'vitest';
import { toLocalDateKey } from '../date';

describe('app clock date alignment', () => {
  test('toLocalDateKey usa el calendario local del dispositivo', () => {
    const morning = new Date(2026, 6, 9, 8, 30, 0);
    const night = new Date(2026, 6, 9, 23, 45, 0);
    expect(toLocalDateKey(morning)).toBe('2026-07-09');
    expect(toLocalDateKey(night)).toBe('2026-07-09');
  });

  test('el cambio de día local ocurre a medianoche', () => {
    const beforeMidnight = new Date(2026, 6, 9, 23, 59, 59);
    const afterMidnight = new Date(2026, 6, 10, 0, 0, 0);
    expect(toLocalDateKey(beforeMidnight)).toBe('2026-07-09');
    expect(toLocalDateKey(afterMidnight)).toBe('2026-07-10');
  });
});
