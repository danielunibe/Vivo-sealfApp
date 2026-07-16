import { describe, expect, test } from 'vitest';
import {
  toLocalDateKey,
  isSameAppDay,
  getCalendarHistoryFloor,
  getEarliestSelectableDateKey,
  getFirstSaleDateKey,
} from '../date';

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

describe('getEarliestSelectableDateKey', () => {
  test('sin ventas permite ir atrás del día de hoy', () => {
    const floor = getCalendarHistoryFloor('2026-07-16');
    expect(getEarliestSelectableDateKey([], '2026-07-16')).toBe(floor);
    expect(floor < '2026-07-16').toBe(true);
  });

  test('con ventas recientes sigue permitiendo fechas anteriores al primer registro', () => {
    const floor = getCalendarHistoryFloor('2026-07-16');
    expect(getEarliestSelectableDateKey([{ date: '2026-07-15' }], '2026-07-16')).toBe(floor);
  });

  test('conserva ventas más antiguas que el piso de historial', () => {
    expect(getFirstSaleDateKey([{ date: '2023-01-05' }, { date: '2026-07-01' }])).toBe('2023-01-05');
    expect(getEarliestSelectableDateKey([{ date: '2023-01-05' }], '2026-07-16')).toBe('2023-01-05');
  });
});
