import { Movement, Sale } from '@/types/sale';

const LOCAL_DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  return formatLocalDateKey(new Date());
}

export function parseLocalDateKey(value: string | undefined | null): Date | null {
  if (!value) return null;
  const match = LOCAL_DATE_KEY_PATTERN.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function resolveMovementDate(movement: Movement, sales: Sale[] = []): Date {
  const explicitDate = parseLocalDateKey(movement.effectiveDate);
  if (explicitDate) return explicitDate;

  if (movement.saleId) {
    const linkedSale = sales.find((sale) => sale.id === movement.saleId);
    const linkedDate = parseLocalDateKey(linkedSale?.date);
    if (linkedDate) return linkedDate;
  }

  return new Date(movement.createdAt);
}

export function formatMovementDisplayDate(dateKey: string, capturedAt: number): string {
  const businessDate = parseLocalDateKey(dateKey) ?? new Date(capturedAt);
  const datePart = businessDate.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timePart = new Date(capturedAt).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${datePart}, ${timePart}`;
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

export function isSameWeek(d1: Date, d2: Date): boolean {
  const start1 = getStartOfWeek(d1);
  const start2 = getStartOfWeek(d2);
  start1.setHours(0, 0, 0, 0);
  start2.setHours(0, 0, 0, 0);
  return start1.getTime() === start2.getTime();
}
