import { describe, expect, test, vi, afterEach } from 'vitest';
import { getPeriodMoneyProjection } from '../analytics';
import type { SaleRecord } from '../../types';

vi.mock('../date', async () => {
  const actual = await vi.importActual<typeof import('../date')>('../date');
  return {
    ...actual,
    getAppToday: () => '2026-07-09',
  };
});

const baseSale = (overrides: Partial<SaleRecord>): SaleRecord => ({
  id: 'sale-1',
  date: '2026-07-09',
  deviceId: 'y04',
  deviceNameSnapshot: 'Y04',
  deviceColorSnapshot: 'Verde Jade',
  deviceImageSnapshot: '/img.png',
  quantity: 1,
  commissionPerUnit: 200,
  amountEarned: 200,
  createdAt: Date.parse('2026-07-09T12:00:00'),
  recordedTime: '12:00:00',
  recordedAtIso: '2026-07-09T12:00:00',
  ...overrides,
});

describe('getPeriodMoneyProjection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('proyecta comisión al cierre del mes según ritmo actual', () => {
    const sales = [
      baseSale({ id: 'a', amountEarned: 900, quantity: 3, commissionPerUnit: 300 }),
      baseSale({ id: 'b', amountEarned: 600, quantity: 2, commissionPerUnit: 300 }),
    ];

    const projection = getPeriodMoneyProjection(sales, 'month');

    expect(projection.currentCommission).toBe(1500);
    expect(projection.currentPieces).toBe(5);
    expect(projection.avgCommissionPerPiece).toBe(300);
    expect(projection.projectedCommission).toBeGreaterThan(projection.currentCommission);
  });

  test('sin ventas deja proyección en cero', () => {
    const projection = getPeriodMoneyProjection([], 'week');
    expect(projection.currentCommission).toBe(0);
    expect(projection.projectedCommission).toBe(0);
    expect(projection.avgCommissionPerPiece).toBe(0);
  });
});
