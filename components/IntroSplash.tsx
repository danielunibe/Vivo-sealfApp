'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { getInteractionPreferences } from '@/lib/interactionPreferences';

type IntroSplashProps = {
  theme: 'light' | 'dark';
};

export default function IntroSplash({ theme }: IntroSplashProps) {
  const [visible, setVisible] = React.useState(() => getInteractionPreferences().introEnabled);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 6800);
    return () => window.clearTimeout(timer);
  }, [visible]);

  const backgroundClass = theme === 'light' ? 'bg-[#F7F8FA]' : 'bg-[#050507]';
  const dismiss = () => setVisible(false);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={`intro-video-frame absolute inset-0 z-[80] flex items-center justify-center overflow-hidden ${backgroundClass}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={dismiss}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              dismiss();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Intro Vivo Promotor"
        >
          <video
            className={`h-full w-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/brand/vivo-app-icon-squircle.png"
            onCanPlay={() => setReady(true)}
            onEnded={dismiss}
          >
            <source src="/brand/vivo-logo-animation.mp4" type="video/mp4" />
            <source src="/brand/vivo-logo-animation.webm" type="video/webm" />
          </video>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
