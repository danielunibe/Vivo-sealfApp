import { beforeEach, describe, expect, test, vi } from 'vitest';
import { shouldRunDailyWebSync } from '../webArchiveSync';

const memoryStore = new Map<string, string>();

describe('shouldRunDailyWebSync', () => {
  beforeEach(() => {
    memoryStore.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => memoryStore.get(key) ?? null,
      setItem: (key: string, value: string) => { memoryStore.set(key, value); },
      removeItem: (key: string) => { memoryStore.delete(key); },
    });
  });
  test('no corre antes de la hora configurada', () => {
    const morning = new Date(2026, 6, 9, 5, 30, 0);
    expect(shouldRunDailyWebSync(morning)).toBe(false);
  });

  test('corre una vez al día después de la hora configurada', () => {
    const afterSyncHour = new Date(2026, 6, 9, 6, 15, 0);
    expect(shouldRunDailyWebSync(afterSyncHour)).toBe(true);
  });
});
