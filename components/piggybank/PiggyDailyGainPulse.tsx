'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Movement, Sale } from '@/types/sale';
import { isMovementInPeriod } from '@/lib/piggyUtils';

interface PiggyDailyGainPulseProps {
  movements: Movement[];
  sales?: Sale[];
  className?: string;
}

export default function PiggyDailyGainPulse({ movements, sales = [], className = '' }: PiggyDailyGainPulseProps) {
  const [dailyTotal, setDailyTotal] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only calculate for today
    const todayMovements = movements.filter((movement) =>
      isMovementInPeriod(movement, 'Día', sales)
    );

    const sum = todayMovements.reduce(
      (acc, movement) => acc + (movement.type === 'income' ? movement.amount : -movement.amount),
      0
    );
    
    if (sum > 0) {
      const timer0 = setTimeout(() => {
        setDailyTotal(sum);
      }, 0);
      // Wait a bit before popping up
      const timer = setTimeout(() => {
        setShow(true);
      }, 800);
      
      const hideTimer = setTimeout(() => {
        setShow(false);
      }, 4500);
      
      return () => {
        clearTimeout(timer0);
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    } else {
      const timer0 = setTimeout(() => {
        setShow(false);
      }, 0);
      return () => clearTimeout(timer0);
    }
  }, [movements, sales]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className={`absolute z-20 ${className}`}
        >
          <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 shadow-emerald-500/20">
            <span className="text-[12px] font-mono tracking-tight leading-none">
              + ${dailyTotal.toLocaleString('es-MX')} hoy
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
