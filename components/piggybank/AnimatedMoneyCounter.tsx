'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface AnimatedMoneyCounterProps {
  value: number;
  className?: string;
}

export default function AnimatedMoneyCounter({ value, className = '' }: AnimatedMoneyCounterProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  });

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    // Start animation from 0 every time it mounts or value changes significantly?
    // Wait, the prompt says "cada vez que el usuario entre a Puerquito, quiero que el dinero haga una animación desde cero", so mount is fine.
    motionValue.set(0);
    // Add small delay for smoothness 
    const timer = setTimeout(() => {
      motionValue.set(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      setDisplayValue(Math.floor(latest).toLocaleString('es-MX'));
    });
  }, [springValue]);

  return (
    <motion.span className={className}>
      ${displayValue}
    </motion.span>
  );
}
