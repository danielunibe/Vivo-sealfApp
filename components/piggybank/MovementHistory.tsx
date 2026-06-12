'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { Movement, Sale } from '@/types/sale';
import { resolveMovementDate } from '@/lib/dateUtils';

interface MovementHistoryProps {
  theme: 'light' | 'dark';
  movements: Movement[];
  sales?: Sale[];
}

export default function MovementHistory({
  theme,
  movements = [],
  sales = []
}: MovementHistoryProps) {
  const sortedMovements = [...movements].sort((a, b) => {
    const dateDifference = resolveMovementDate(b, sales).getTime() - resolveMovementDate(a, sales).getTime();
    return dateDifference || b.createdAt - a.createdAt;
  });

  return (
    <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none max-h-[220px]">
      {sortedMovements.length === 0 ? (
        <div className="text-center py-10 text-xs text-neutral-400 italic">
          Sin movimientos registrados en este periodo.
        </div>
      ) : (
        sortedMovements.map((m) => (
          <div 
            key={m.id}
            className="py-3 flex items-start gap-2.5 transition-all select-none border-b border-neutral-100/40 dark:border-neutral-850/20"
          >
            <div className="mt-1 shrink-0">
              <span className={`w-2 h-2 rounded-full inline-block ${
                m.type === 'income' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold font-serif leading-none ${theme === 'light' ? 'text-neutral-900' : 'text-white'}`}>
                  {m.title}
                </span>
                <span className="text-[7.5px] text-neutral-400 font-mono flex items-center gap-0.5 whitespace-nowrap leading-none">
                  <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                  {m.date}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1.5 leading-none">
                <p className="text-[9.5px] text-neutral-500 truncate max-w-[200px]">
                  Venta de equipo registrada con éxito
                </p>
                <span className={`text-[10.5px] font-mono font-black shrink-0 ${
                  m.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {m.type === 'income' ? '+' : '-'}${m.amount} MXN
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
