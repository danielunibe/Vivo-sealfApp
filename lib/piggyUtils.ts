import { Movement, Sale } from '@/types/sale';
import { isSameWeek, resolveMovementDate } from './dateUtils';

export function isMovementInPeriod(
  movement: Movement,
  period: 'Día' | 'Semana' | 'Mes' | 'Año',
  sales: Sale[] = [],
  now = new Date()
): boolean {
  const moveDate = resolveMovementDate(movement, sales);

  if (period === 'Día') {
    return moveDate.getDate() === now.getDate() &&
      moveDate.getMonth() === now.getMonth() &&
      moveDate.getFullYear() === now.getFullYear();
  }
  if (period === 'Semana') return isSameWeek(now, moveDate);
  if (period === 'Mes') {
    return moveDate.getMonth() === now.getMonth() &&
      moveDate.getFullYear() === now.getFullYear();
  }
  return moveDate.getFullYear() === now.getFullYear();
}

export function calculatePeriodEarnings(
  movements: Movement[],
  period: 'Día' | 'Semana' | 'Mes' | 'Año',
  sales: Sale[] = []
): number {
  const now = new Date();

  return movements.reduce((sum, m) => {
    if (!isMovementInPeriod(m, period, sales, now)) return sum;
    return m.type === 'income' ? sum + m.amount : sum - m.amount;
  }, 0);
}

export function getProgressPercent(earnings: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min((earnings / goal) * 100, 100);
}
