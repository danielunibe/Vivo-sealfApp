import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sale, CalendarDayRecord } from '@/types/sale';
import { getManualDayRecords, saveManualDayRecord } from '@/lib/storage';

interface MissedDayPromptProps {
  theme: 'light' | 'dark';
  sales: Sale[];
}

export default function MissedDayPrompt({ theme, sales }: MissedDayPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [targetDateKey, setTargetDateKey] = useState('');

  useEffect(() => {
    // Determine if yesterday is missing records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yYear = yesterday.getFullYear();
    const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yDay = String(yesterday.getDate()).padStart(2, '0');
    const dateKey = `${yYear}-${yMonth}-${yDay}`;

    const manualRecords = getManualDayRecords();
    
    // Check if we already answered
    if (manualRecords[dateKey] && manualRecords[dateKey].manualStatus) {
      return; 
    }

    // Check if there are sales yesterday
    const salesYesterday = sales.some(sale => sale.date === dateKey);
    if (salesYesterday) {
      return; // Has sales, so they clearly worked (or it doesn't matter)
    }

    // Conditions met to prompt
    const timer = setTimeout(() => {
      setTargetDateKey(dateKey);
      setShowPrompt(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [sales]);

  const handleResponse = (status: 'worked' | 'rest' | 'not-attended') => {
    // Generate a record to persist
    const record: CalendarDayRecord = {
      date: targetDateKey,
      workDayStatus: status,
      salesDayStatus: 'no-sale',
      manualStatus: true,
      totalEarned: 0,
      soldDevices: [],
      updatedAt: new Date().toISOString()
    };
    
    saveManualDayRecord(targetDateKey, record);
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`mx-4 mb-2 mt-1 p-3.5 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col gap-3 z-20 relative ${
            theme === 'light' 
              ? 'bg-white/80 border-black/5' 
              : 'bg-neutral-900/80 border-white/5'
          }`}
        >
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-neutral-900 dark:text-white">
              ¿Trabajaste ayer?
            </span>
            <span className="text-[11px] text-neutral-500 font-medium">
              No registraste ventas. Confirma tu estado para el calendario.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleResponse('worked')}
              className={`w-full py-2.5 rounded-xl font-bold text-[12px] transition-colors ${
                theme === 'light' ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              Sí, trabajé (Sin ventas)
            </button>
            <button 
              onClick={() => handleResponse('rest')}
              className={`w-full py-2.5 rounded-xl font-bold text-[12px] transition-colors ${
                theme === 'light' ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
            >
              No, fue descanso
            </button>
            <button 
              onClick={() => handleResponse('not-attended')}
              className={`w-full py-2.5 rounded-xl font-bold text-[12px] transition-colors ${
                theme === 'light' ? 'bg-red-500/10 hover:bg-red-500/20 text-red-600' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
              }`}
            >
              No me presenté
            </button>
            <button 
              onClick={() => setShowPrompt(false)} // skip for now
              className="w-full py-1 rounded-xl text-[10px] text-neutral-400 font-medium mt-1 underline underline-offset-2"
            >
              Recordar después
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
