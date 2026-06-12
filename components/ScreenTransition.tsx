'use client';

import React from 'react';
import { motion } from 'motion/react';

interface ScreenTransitionProps {
  direction: number;
  activeKey: string;
  children: React.ReactNode;
  className?: string;
}

const PAGE_VARIANTS = {
  enter: (dir: number) => ({
    x: dir * 30, // Subtle movement
    opacity: 0,
    scale: 0.99
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (dir: number) => ({
    x: -dir * 15, // Exit movement is shorter, creates an elegant parralax feel
    opacity: 0,
    scale: 0.98
  })
};

const PAGE_TRANSITION = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 32,
  mass: 0.9
};

export default function ScreenTransition({
  direction,
  activeKey,
  children,
  className = "w-full"
}: ScreenTransitionProps) {
  return (
    <motion.div
      key={activeKey}
      custom={direction}
      variants={PAGE_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={PAGE_TRANSITION}
      className={className}
    >
      {children}
    </motion.div>
  );
}
