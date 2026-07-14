import React from 'react';
import { motion } from 'motion/react';
import { GoalUnit } from '../../lib/goalBreakdown';

type ColoredGoalProgressBarProps = {
  goal: number;
  units: GoalUnit[];
  percent: number;
  mode?: 'discrete' | 'stacked';
  isOnDark?: boolean;
  className?: string;
};

export function ColoredGoalProgressBar({
  goal,
  units,
  percent,
  mode = 'stacked',
  isOnDark = false,
  className = '',
}: ColoredGoalProgressBarProps) {
  const safeGoal = Math.max(goal, 1);
  const trackClass = isOnDark ? 'bg-black/25' : 'bg-black/6';

  if (mode === 'discrete') {
    return (
      <div className={`flex gap-1 sm:gap-1.5 ${className}`}>
        {Array.from({ length: safeGoal }).map((_, idx) => {
          const unit = units[idx];
          const isFilled = Boolean(unit);
          return (
            <motion.div
              key={idx}
              initial={{ scaleX: 0.6, opacity: 0.4 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              className="h-1.5 sm:h-2 flex-1 rounded-full overflow-hidden shadow-inner border border-black/10"
              style={{
                backgroundColor: isFilled ? unit.colorHex : 'rgba(0,0,0,0.18)',
                boxShadow: isFilled ? `0 0 10px ${unit.colorHex}55` : undefined,
              }}
            />
          );
        })}
      </div>
    );
  }

  const filledPercent = Math.min(100, percent);

  if (units.length === 0) {
    return (
      <div className={`w-full h-1.5 rounded-full overflow-hidden ${trackClass} ${className}`}>
        <div className="h-full w-0 rounded-full" />
      </div>
    );
  }

  return (
    <div className={`w-full h-1.5 rounded-full overflow-hidden ${trackClass} ${className}`}>
      <motion.div
        className="h-full rounded-full overflow-hidden flex"
        initial={{ width: 0 }}
        animate={{ width: `${filledPercent}%` }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {units.map((unit, idx) => (
          <div
            key={`${unit.deviceId}-${unit.colorName}-${idx}`}
            className="h-full"
            style={{
              width: `${100 / units.length}%`,
              backgroundColor: unit.colorHex,
              boxShadow: idx === 0 ? `inset -1px 0 0 rgba(255,255,255,0.15)` : undefined,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
