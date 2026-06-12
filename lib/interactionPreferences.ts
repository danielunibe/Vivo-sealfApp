import { safeGetItem, safeSetItem } from '@/lib/storage';

export type FeedbackIntensity = 'soft' | 'normal' | 'strong';

export interface InteractionPreferences {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  feedbackIntensity: FeedbackIntensity;
  introEnabled: boolean;
}

export const DEFAULT_INTERACTION_PREFERENCES: InteractionPreferences = {
  soundEnabled: true,
  hapticsEnabled: true,
  reducedMotion: false,
  feedbackIntensity: 'soft',
  introEnabled: true,
};

export const INTERACTION_STORAGE_KEYS = {
  soundEnabled: 'vivo_sounds_enabled',
  hapticsEnabled: 'vivo_haptics_enabled',
  reducedMotion: 'vivo_reduced_motion',
  feedbackIntensity: 'vivo_feedback_intensity',
  introEnabled: 'vivo_intro_enabled',
} as const;

export function getInteractionPreferences(): InteractionPreferences {
  return {
    soundEnabled: safeGetItem<boolean>(INTERACTION_STORAGE_KEYS.soundEnabled, DEFAULT_INTERACTION_PREFERENCES.soundEnabled),
    hapticsEnabled: safeGetItem<boolean>(INTERACTION_STORAGE_KEYS.hapticsEnabled, DEFAULT_INTERACTION_PREFERENCES.hapticsEnabled),
    reducedMotion: safeGetItem<boolean>(INTERACTION_STORAGE_KEYS.reducedMotion, DEFAULT_INTERACTION_PREFERENCES.reducedMotion),
    feedbackIntensity: safeGetItem<FeedbackIntensity>(INTERACTION_STORAGE_KEYS.feedbackIntensity, DEFAULT_INTERACTION_PREFERENCES.feedbackIntensity),
    introEnabled: safeGetItem<boolean>(INTERACTION_STORAGE_KEYS.introEnabled, DEFAULT_INTERACTION_PREFERENCES.introEnabled),
  };
}

export function saveInteractionPreference<K extends keyof InteractionPreferences>(
  key: K,
  value: InteractionPreferences[K],
): void {
  const storageKey = INTERACTION_STORAGE_KEYS[key];
  safeSetItem(storageKey, value);
}
