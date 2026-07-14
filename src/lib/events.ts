import { SaleRecord } from '../types';

export const emitSaleConfirmed = (detail: { deviceName: string; amountEarned: number; deviceColor: string }) => {
  window.dispatchEvent(
    new CustomEvent('sale-confirmed', {
      detail
    })
  );
};

export const onSaleConfirmed = (callback: (e: CustomEvent) => void) => {
  window.addEventListener('sale-confirmed', callback as EventListener);
  return () => window.removeEventListener('sale-confirmed', callback as EventListener);
};

export const emitSalesUpdated = () => {
  window.dispatchEvent(new CustomEvent('sales-updated'));
};

export const onSalesUpdated = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener('sales-updated', handler);
  return () => window.removeEventListener('sales-updated', handler);
};

export const emitInventoryUpdated = () => {
  window.dispatchEvent(new CustomEvent('inventory-updated'));
};

export const onInventoryUpdated = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener('inventory-updated', handler);
  return () => window.removeEventListener('inventory-updated', handler);
};

export const emitSettingsUpdated = () => {
  window.dispatchEvent(new CustomEvent('settings-updated'));
};

export const onSettingsUpdated = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener('settings-updated', handler);
  return () => window.removeEventListener('settings-updated', handler);
};

export const emitAchievementsUpdated = () => {
  window.dispatchEvent(new CustomEvent('achievements-updated'));
};

export const onAchievementsUpdated = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener('achievements-updated', handler);
  return () => window.removeEventListener('achievements-updated', handler);
};

export const emitChallengesUpdated = () => {
  window.dispatchEvent(new CustomEvent('challenges-updated'));
};

export const onChallengesUpdated = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener('challenges-updated', handler);
  return () => window.removeEventListener('challenges-updated', handler);
};

export const emitPointsUpdated = () => {
  window.dispatchEvent(new CustomEvent('points-updated'));
};

export const onPointsUpdated = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener('points-updated', handler);
  return () => window.removeEventListener('points-updated', handler);
};

export const emitImmersiveWebMode = (active: boolean) => {
  window.dispatchEvent(new CustomEvent('immersive-web-mode', { detail: { active } }));
};

export const onImmersiveWebMode = (callback: (active: boolean) => void) => {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ active?: boolean }>).detail;
    callback(detail?.active === true);
  };
  window.addEventListener('immersive-web-mode', handler);
  return () => window.removeEventListener('immersive-web-mode', handler);
};

export const emitWebArchivesUpdated = () => {
  window.dispatchEvent(new CustomEvent('web-archives-updated'));
};

export const onWebArchivesUpdated = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener('web-archives-updated', handler);
  return () => window.removeEventListener('web-archives-updated', handler);
};

export type AppDayChangedDetail = {
  today: string;
  previous: string;
};

export const emitAppDayChanged = (detail: AppDayChangedDetail) => {
  window.dispatchEvent(new CustomEvent('app-day-changed', { detail }));
};

export const onAppDayChanged = (callback: (detail: AppDayChangedDetail) => void) => {
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<AppDayChangedDetail>).detail;
    if (!detail?.today) return;
    callback(detail);
  };
  window.addEventListener('app-day-changed', handler);
  return () => window.removeEventListener('app-day-changed', handler);
};


