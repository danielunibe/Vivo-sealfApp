import { getInteractionPreferences, type FeedbackIntensity } from '@/lib/interactionPreferences';

export type FeedbackKind = 'tap' | 'selection' | 'success' | 'warning' | 'error' | 'sale-confirm' | 'navigation';

let audioContext: AudioContext | null = null;
let lastFeedbackAt = 0;

const MIN_FEEDBACK_GAP_MS = 75;

const soundMap: Record<FeedbackKind, { frequency: number; duration: number; gain: number; type: OscillatorType; haptic: number }> = {
  tap: { frequency: 420, duration: 32, gain: 0.018, type: 'sine', haptic: 8 },
  selection: { frequency: 520, duration: 38, gain: 0.02, type: 'triangle', haptic: 10 },
  navigation: { frequency: 480, duration: 42, gain: 0.018, type: 'sine', haptic: 12 },
  success: { frequency: 740, duration: 86, gain: 0.026, type: 'triangle', haptic: 22 },
  warning: { frequency: 330, duration: 70, gain: 0.022, type: 'sine', haptic: 18 },
  error: { frequency: 210, duration: 85, gain: 0.024, type: 'sawtooth', haptic: 30 },
  'sale-confirm': { frequency: 820, duration: 100, gain: 0.03, type: 'triangle', haptic: 26 },
};

function getIntensityGain(intensity: FeedbackIntensity): number {
  if (intensity === 'strong') return 1.25;
  if (intensity === 'normal') return 1;
  return 0.72;
}

function canTriggerFeedback(): boolean {
  if (typeof window === 'undefined') return false;
  const now = Date.now();
  if (now - lastFeedbackAt < MIN_FEEDBACK_GAP_MS) return false;
  lastFeedbackAt = now;
  return true;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioContext) {
    audioContext = new AudioCtor();
  }
  return audioContext;
}

async function ensureAudioReady(context: AudioContext): Promise<boolean> {
  if (context.state !== 'suspended') return true;
  try {
    await context.resume();
    return context.state !== 'suspended';
  } catch {
    return false;
  }
}

function vibrate(kind: FeedbackKind, intensity: FeedbackIntensity): void {
  const preferences = getInteractionPreferences();
  if (!preferences.hapticsEnabled || preferences.reducedMotion) return;
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  const base = soundMap[kind].haptic;
  const multiplier = intensity === 'strong' ? 1.35 : intensity === 'normal' ? 1 : 0.72;
  navigator.vibrate(Math.max(6, Math.round(base * multiplier)));
}

export async function playUiSound(kind: FeedbackKind): Promise<void> {
  if (!canTriggerFeedback()) return;

  const preferences = getInteractionPreferences();
  const context = getAudioContext();
  if (preferences.soundEnabled && context) {
    const isReady = await ensureAudioReady(context);
    if (!isReady) return;

    const config = soundMap[kind];
    const startAt = context.currentTime + 0.005;
    const stopAt = startAt + config.duration / 1000;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, startAt);
    if (kind === 'success' || kind === 'sale-confirm') {
      oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 1.32, stopAt);
    }

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(config.gain * getIntensityGain(preferences.feedbackIntensity), startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(stopAt + 0.012);
  }

  vibrate(kind, preferences.feedbackIntensity);
}

export async function triggerFeedback(kind: FeedbackKind): Promise<void> {
  try {
    await playUiSound(kind);
  } catch {
    // Feedback must never block sales, navigation or settings.
  }
}
