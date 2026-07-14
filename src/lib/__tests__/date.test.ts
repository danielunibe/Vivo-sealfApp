import { describe, expect, test } from 'vitest';
import { toLocalDateKey, isSameAppDay } from '../date';

describe('toLocalDateKey', () => {
  test('formatea el día con calendario local en todo el rango horario', () => {
    expect(toLocalDateKey(new Date(2026, 6, 9, 6, 0, 0))).toBe('2026-07-09');
    expect(toLocalDateKey(new Date(2026, 6, 9, 18, 0, 0))).toBe('2026-07-09');
    expect(toLocalDateKey(new Date(2026, 6, 10, 0, 0, 0))).toBe('2026-07-10');
  });
});

describe('isSameAppDay', () => {
  test('agrupa timestamps del mismo día local', () => {
    const morning = new Date(2026, 6, 9, 8, 0, 0).getTime();
    const night = new Date(2026, 6, 9, 23, 0, 0).getTime();
    expect(isSameAppDay(morning, night)).toBe(true);
  });
});
