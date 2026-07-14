import React, { useEffect, useState } from 'react';
import { Target, X, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { getActiveChallenges, generateDailyChallenges, updateChallengeProgress } from '../../lib/challenges';
import { dismissChallenge } from '../../lib/storage';
import { DailyChallenge } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export function ChallengePanel() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);

  useEffect(() => {
    generateDailyChallenges();
    updateChallengeProgress();
    setChallenges(getActiveChallenges());

    const handleUpdate = () => {
      setChallenges(getActiveChallenges());
    };

    const handleProgressUpdate = () => {
      updateChallengeProgress();
      setChallenges(getActiveChallenges());
    };

    window.addEventListener('challenges-updated', handleUpdate);
    window.addEventListener('sales-updated', handleProgressUpdate);
    window.addEventListener('inventory-updated', handleProgressUpdate);

    return () => {
      window.removeEventListener('challenges-updated', handleUpdate);
      window.removeEventListener('sales-updated', handleProgressUpdate);
      window.removeEventListener('inventory-updated', handleProgressUpdate);
    };
  }, []);

  if (challenges.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[0.65rem] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5 px-1">
        <Target size={12} className="text-[#a78bfa]" />
        Retos Activos
      </h3>
      
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {challenges.map(challenge => (
            <motion.div 
              key={challenge.id}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-[#1A1A1A] rounded-[1.5rem] p-4 border border-white/5 relative overflow-hidden flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1 pr-6">
                  <span className={`text-[0.55rem] font-black uppercase tracking-widest ${
                    challenge.priority === 'high' ? 'text-rose-400' :
                    challenge.priority === 'medium' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>
                    {challenge.title}
                  </span>
                  <p className="text-xs font-semibold text-white/90 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>
                
                <button 
                  onClick={() => dismissChallenge(challenge.id)}
                  className="absolute top-3 right-3 text-white/20 hover:text-white/50 p-1"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-[0.6rem] text-white/50 font-bold uppercase tracking-widest">Progreso</span>
                  <span className="text-[0.65rem] font-black text-white">
                    {challenge.unit === 'commission' ? '$' : ''}{challenge.currentValue} / {challenge.targetValue}
                  </span>
                </div>
                <div className="h-1.5 bg-black/50 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      challenge.priority === 'high' ? 'bg-rose-400' :
                      challenge.priority === 'medium' ? 'bg-amber-400' :
                      'bg-[#a78bfa]'
                    }`}
                    style={{ width: `${Math.min(100, (challenge.currentValue / challenge.targetValue) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {challenge.relatedDeviceId && challenge.type !== 'objection_practice' && (
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('select-device', { detail: challenge.relatedDeviceId }));
                    window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'register' }));
                  }}
                  className="mt-1 w-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2.5 rounded-xl border border-white/5 transition-colors flex items-center justify-center gap-1.5"
                >
                  Registrar {challenge.relatedDeviceName} <ChevronRight size={14} />
                </button>
              )}
              
              {challenge.type === 'objection_practice' && challenge.relatedDeviceId && (
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('select-device', { detail: challenge.relatedDeviceId }));
                    window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'catalog' }));
                  }}
                  className="mt-1 w-full bg-[#a78bfa]/20 hover:bg-[#a78bfa]/30 text-[#a78bfa] font-bold text-xs py-2.5 rounded-xl border border-[#a78bfa]/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  Practicar ahora <Zap size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
