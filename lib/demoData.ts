import { Sale, Movement } from '@/types/sale';
import { clearVivoPromotorStorage, savePersistedSales, savePersistedMovements } from './storage';

export function seedDemoData(): void {
  const now = new Date();
  const seedId = Date.now();
  
  // Create sales
  const sales: Sale[] = [];
  const movements: Movement[] = [];
  
  // Today's date components
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  
  // Yesterday's date
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const y_yyyy = yesterday.getFullYear();
  const y_mm = String(yesterday.getMonth() + 1).padStart(2, '0');
  const y_dd = String(yesterday.getDate()).padStart(2, '0');
  const yesterdayStr = `${y_yyyy}-${y_mm}-${y_dd}`;

  // 1. Sale for today (below average, say $80)
  sales.push({
    id: `demo-sale-${seedId}-1`,
    date: todayStr,
    deviceId: 'v60',
    deviceName: 'V60 lite',
    deviceColor: 'Negro Místico',
    amountEarned: 80,
    createdAt: now.getTime() - 1000 * 60 * 60 * 2, // 2 hours ago
    day: now.getDate()
  });

  movements.push({
    id: `demo-mov-${seedId}-1`,
    type: 'income',
    source: 'sale',
    title: 'Venta de V60 lite Negro Místico',
    amount: 80,
    date: `${dd} / ${mm}, 10:00 AM`,
    effectiveDate: todayStr,
    createdAt: now.getTime() - 1000 * 60 * 60 * 2,
    saleId: `demo-sale-${seedId}-1`
  });

  // 2. Sale for yesterday (met goal, say $350)
  sales.push({
    id: `demo-sale-${seedId}-2`,
    date: yesterdayStr,
    deviceId: 'y21d',
    deviceName: 'Y21D',
    deviceColor: 'Azul Amatista',
    amountEarned: 350,
    createdAt: yesterday.getTime(),
    day: yesterday.getDate()
  });

  movements.push({
    id: `demo-mov-${seedId}-2`,
    type: 'income',
    source: 'sale',
    title: 'Venta de Y21D Azul Amatista',
    amount: 350,
    date: `${y_dd} / ${y_mm}, 02:00 PM`,
    effectiveDate: yesterdayStr,
    createdAt: yesterday.getTime(),
    saleId: `demo-sale-${seedId}-2`
  });

  savePersistedSales(sales);
  savePersistedMovements(movements);
  
  // Reload immediately to reflect the new state
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

export function clearDemoData(): void {
  savePersistedSales([]);
  savePersistedMovements([]);
  
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

export function resetAppData(): void {
  if (typeof window !== 'undefined') {
    clearVivoPromotorStorage();
    window.location.reload();
  }
}
