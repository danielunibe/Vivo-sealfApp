import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'motion/react';
import { TrendingUp, Award, Sparkles } from 'lucide-react';

interface WalletHeroCardProps {
  totalEarned: number;
  savingsGoal: number;
  progressPercent: number;
  salesCount: number;
  currentDate?: string;
  goalCaption?: string;
  goalDisplay?: string;
  progressCaption?: string;
}

// Generate some random stars for the background effect
const generateStars = (num: number) => {
  return Array.from({ length: num }).map((_, i) => ({
    id: i,
    x: Math.random() * 100, // percentage
    y: Math.random() * 100, // percentage
    size: Math.random() * 10 + 4,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 1.5,
  }));
};

export function WalletHeroCard({
  totalEarned,
  savingsGoal,
  progressPercent,
  salesCount,
  currentDate,
  goalCaption = 'Objetivo del mes',
  goalDisplay,
  progressCaption = 'Progreso',
}: WalletHeroCardProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `$${Math.round(latest)}`);

  const percentCount = useMotionValue(0);
  const roundedPercent = useTransform(percentCount, (latest) => `${Math.round(latest)}%`);
  
  const [stars, setStars] = useState<{id: number, x: number, y: number, size: number, delay: number, duration: number}[]>([]);

  const isGoalMet = progressPercent >= 100;

  useEffect(() => {
    if (isGoalMet) {
      setStars(generateStars(15));
    } else {
      setStars([]);
    }
  }, [isGoalMet]);

  useEffect(() => {
    const controls = animate(count, totalEarned, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1], // Custom expo out
    });
    
    const pControls = animate(percentCount, progressPercent, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => {
      controls.stop();
      pControls.stop();
    };
  }, [totalEarned, progressPercent]);

  return (
    <motion.div 
      initial={false}
      animate={{
        background: isGoalMet 
          ? 'linear-gradient(135deg, #FDE047 0%, #F59E0B 100%)'
          : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        boxShadow: isGoalMet 
          ? '0 20px 40px -10px rgba(255, 215, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.6)' 
          : '0 10px 20px -5px rgba(0,0,0,0.3)',
        borderColor: isGoalMet ? 'rgba(255, 255, 255, 0.4)' : 'rgba(51, 65, 85, 0.5)'
      }}
      transition={{ duration: 0.8 }}
      className="relative w-full rounded-[2.15rem] p-4.5 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300 border"
    >
      <AnimatePresence>
        {isGoalMet && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 pointer-events-none"
          >
            {/* Confetti or shining stars */}
            {stars.map((star) => (
              <motion.div
                key={star.id}
                className="absolute text-white"
                style={{ 
                  left: `${star.x}%`, 
                  top: `${star.y}%`, 
                  fontSize: star.size,
                  filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))'
                }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1.5, 0],
                  rotate: [0, 180] 
                }}
                transition={{ 
                  duration: star.duration, 
                  delay: star.delay, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles size={star.size} fill="currentColor" />
              </motion.div>
            ))}
            
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none mix-blend-overlay" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-white/30 blur-2xl pointer-events-none mix-blend-overlay" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle glass circles inside (default) */}
      {!isGoalMet && (
        <>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white/5 blur-lg pointer-events-none" />
        </>
      )}
      
      <div className="flex flex-col relative z-10 gap-1 mt-0.5">
        <motion.div 
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between"
        >
          <span className={`text-[0.65rem] font-black tracking-widest uppercase flex items-center gap-1.5 ${isGoalMet ? 'text-yellow-900' : 'text-emerald-400'}`}>
            {isGoalMet ? <Award size={14} className="text-white" /> : <TrendingUp size={12} className="text-emerald-400" />}
            <span className={isGoalMet ? 'text-white' : 'text-emerald-400'}>{isGoalMet ? 'Objetivo Cumplido' : `Hoy · ${currentDate}`}</span>
          </span>
          <span className={`text-[0.65rem] font-black tracking-widest uppercase opacity-80 ${isGoalMet ? 'text-white' : 'text-slate-500'}`}>
            {salesCount} Ventas
          </span>
        </motion.div>
        
        <motion.span className={`text-[2.6rem] leading-none font-black tracking-tighter drop-shadow-md pb-0.5 mt-0.5 ${isGoalMet ? 'text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]' : 'text-white'}`}>
          {rounded}
        </motion.span>
      </div>
      
      <div className={`mt-4 flex items-center justify-between border-t border-dashed pt-3 relative z-10 ${isGoalMet ? 'border-white/30' : 'border-slate-700/70'}`}>
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-1"
        >
          <span className={`text-[0.55rem] font-black uppercase tracking-widest ${isGoalMet ? 'text-[#422006]/90' : 'text-slate-500'}`}>{goalCaption}</span>
          <span className={`text-sm font-black ${isGoalMet ? 'text-[#1c1917] drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]' : 'text-slate-200'}`}>{goalDisplay ?? `$${savingsGoal}`}</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-end gap-1"
        >
          <span className={`text-[0.55rem] font-black uppercase tracking-widest ${isGoalMet ? 'text-[#422006]/90' : 'text-slate-500'}`}>{progressCaption}</span>
          <motion.span className={`text-sm font-black ${isGoalMet ? 'text-[#1c1917] drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]' : 'text-emerald-400'}`}>{roundedPercent}</motion.span>
        </motion.div>
      </div>
      
      {/* Progress Line */}
      <div className={`absolute bottom-0 left-0 h-1.5 w-full overflow-hidden ${isGoalMet ? 'bg-white/20' : 'bg-slate-800/80'}`}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className={`h-full rounded-r-full shadow-lg ${isGoalMet ? 'bg-white' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} 
        />
      </div>
    </motion.div>
  );
}
