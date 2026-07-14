import React, { useEffect } from 'react';
import { motion } from 'motion/react';

const APP_ICON_COLOROS = '/assets/branding/app-icon-coloros.png';

const playLaunchEarcon = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const startAt = ctx.currentTime + 0.02;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, startAt);
    master.gain.exponentialRampToValueAtTime(0.085, startAt + 0.09);
    master.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.95);
    master.connect(ctx.destination);

    const notes = [
      { freq: 523.25, delay: 0, type: 'sine' as OscillatorType, gain: 0.55 },
      { freq: 659.25, delay: 0.08, type: 'triangle' as OscillatorType, gain: 0.42 },
      { freq: 783.99, delay: 0.16, type: 'sine' as OscillatorType, gain: 0.28 },
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type;
      osc.frequency.setValueAtTime(note.freq, startAt + note.delay);
      osc.frequency.exponentialRampToValueAtTime(note.freq * 1.012, startAt + note.delay + 0.22);
      gain.gain.setValueAtTime(0.0001, startAt + note.delay);
      gain.gain.exponentialRampToValueAtTime(note.gain, startAt + note.delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + note.delay + 0.42);
      osc.connect(gain);
      gain.connect(master);
      osc.start(startAt + note.delay);
      osc.stop(startAt + note.delay + 0.45);
    });
  } catch (error) {
    console.warn('[BOOT] Launch earcon skipped', error);
  }
};

type BootScreenProps = {
  phase: 'booting' | 'revealing';
  degraded: boolean;
};

export function BootScreen({ phase, degraded }: BootScreenProps) {
  const isRevealing = phase === 'revealing';
  const reducedMotion =
    typeof document !== 'undefined' && document.documentElement.dataset.reducedMotion === 'true';

  useEffect(() => {
    if (phase === 'revealing') {
      playLaunchEarcon();
    }
  }, [phase]);

  return (
    <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[var(--neo-bg)] text-[var(--neo-text)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 38%, color-mix(in srgb, var(--neo-accent) 10%, transparent), transparent 58%)',
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center px-8"
        initial={reducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{
          opacity: isRevealing ? 0 : 1,
          y: isRevealing ? -8 : 0,
          scale: isRevealing ? 1.04 : 1,
        }}
        transition={{ duration: isRevealing ? 0.55 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="relative"
          animate={
            reducedMotion
              ? undefined
              : isRevealing
                ? { scale: [1, 1.05, 1] }
                : { scale: [0.96, 1] }
          }
          transition={
            isRevealing
              ? { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
          }
        >
          {!reducedMotion && !isRevealing && (
            <motion.div
              className="pointer-events-none absolute inset-[-18px] rounded-[2.6rem]"
              style={{ border: '1px solid color-mix(in srgb, var(--neo-text) 8%, transparent)' }}
              animate={{ opacity: [0.15, 0.45, 0.15], scale: [0.98, 1.02, 0.98] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          <img
            src={APP_ICON_COLOROS}
            alt="VIVO Promotor"
            className="relative h-[8.25rem] w-[8.25rem] rounded-[2.05rem] object-cover shadow-[0_18px_48px_rgba(26,29,36,0.14)]"
            draggable={false}
          />
        </motion.div>

        <div className="mt-7 flex flex-col items-center gap-1 text-center">
          <h1
            className="text-[1.65rem] font-black tracking-[-0.04em] text-[var(--neo-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            VIVO
          </h1>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-[var(--neo-muted)]">
            Promotor
          </p>
        </div>

        <div className="mt-8 flex h-8 flex-col items-center justify-center gap-2">
          {degraded ? (
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--neo-muted)]">
              Recuperando datos locales
            </p>
          ) : (
            <div
              className="h-[2px] w-16 overflow-hidden rounded-full"
              style={{ backgroundColor: 'color-mix(in srgb, var(--neo-text) 8%, transparent)' }}
            >
              <motion.div
                className="h-full w-1/2 rounded-full bg-[var(--neo-accent)]"
                animate={
                  reducedMotion || isRevealing
                    ? { x: '50%', opacity: isRevealing ? 0 : 1 }
                    : { x: ['-100%', '200%'] }
                }
                transition={
                  reducedMotion || isRevealing
                    ? { duration: 0.35 }
                    : { duration: 1.15, repeat: Infinity, ease: 'easeInOut' }
                }
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
