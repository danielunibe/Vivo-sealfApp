import React, { useState, useEffect } from 'react';
import { MonthlyVisualPattern } from '@/lib/monthlyVisualPatterns';

interface PatternProgressBarProps {
  value: number;
  goal: number;
  pattern: MonthlyVisualPattern;
}

export default function PatternProgressBar({ value, goal, pattern }: PatternProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimatedValue(0);
    }, 0);
    const timer2 = setTimeout(() => {
      setAnimatedValue(value);
    }, 150);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [value]);

  const safeGoal = goal > 0 ? goal : 1;
  const progress = Math.min(animatedValue / safeGoal, 1);
  const progressPercent = Math.max(Math.floor(progress * 100), 0);
  const isComplete = progress >= 1;

  return (
    <div className="relative mt-2 px-2">
      <div 
        className="w-full h-5 bg-black/90 rounded-full border border-white/10 p-[3px] overflow-hidden shadow-inner relative"
        style={{ backgroundColor: '#111' }}
      >
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden flex items-center justify-end ${progressPercent < 10 ? 'opacity-50 min-w-[5%]' : ''} ${pattern.barPattern}`}
          style={{ 
            width: `${Math.max(5, progressPercent)}%`,
            backgroundColor: pattern.accentColor,
            boxShadow: `inset 0 -2px 5px rgba(0,0,0,0.3), 0 0 15px ${pattern.accentColor}66`
          }}
        >
          {/* Subtle shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-[200%] animate-pulse mix-blend-overlay" style={{ animationDuration: '3s' }} />
        </div>
      </div>
    </div>
  );
}
