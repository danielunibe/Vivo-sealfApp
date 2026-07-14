import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  APP_VERSION,
  hasUnseenReleaseNotes,
  markReleaseNotesSeen,
  getCurrentReleaseNotes,
} from '../releaseNotes';

const memoryStore = new Map<string, string>();

describe('releaseNotes', () => {
  beforeEach(() => {
    memoryStore.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => memoryStore.get(key) ?? null,
      setItem: (key: string, value: string) => { memoryStore.set(key, value); },
      removeItem: (key: string) => { memoryStore.delete(key); },
    });
  });

  test('detecta novedades no vistas cuando cambia la versión', () => {
    expect(hasUnseenReleaseNotes()).toBe(true);
    markReleaseNotesSeen(APP_VERSION);
    expect(hasUnseenReleaseNotes()).toBe(false);
  });

  test('la versión actual tiene notas registradas', () => {
    expect(getCurrentReleaseNotes()?.version).toBe(APP_VERSION);
  });
});
