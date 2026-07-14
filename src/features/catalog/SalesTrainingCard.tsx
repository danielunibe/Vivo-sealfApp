import React, { useState } from 'react';
import { DeviceModel } from '../../types';
import { BookOpen, RefreshCw, ChevronRight } from 'lucide-react';
import { markPracticeCompleted } from '../../lib/challenges';

interface Props {
  device: DeviceModel;
}

export function SalesTrainingCard({ device }: Props) {
  const profile = device.commercialProfile;
  const legacy = device.commercial;
  
  const rawObjections = profile?.objections || legacy?.objeciones.map(o => ({ objection: o.objecion, response: o.refutacion })) || [];
  const objections = rawObjections.filter(o => o.objection && o.response);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showResponse, setShowResponse] = useState(false);

  if (objections.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-4 text-center">
        <BookOpen className="w-8 h-8 text-white/20 mx-auto mb-2" />
        <p className="text-xs text-white/50 font-medium">Agrega objeciones en la ficha comercial para entrenar este modelo.</p>
      </div>
    );
  }

  const currentObjection = objections[currentIdx];

  const handleNext = () => {
    setShowResponse(false);
    setCurrentIdx((prev) => (prev + 1) % objections.length);
  };

  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-[1.5rem] p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <BookOpen size={80} />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[0.65rem] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
          <RefreshCw size={12} className="text-indigo-400" />
          Práctica Rápida — {device.name}
        </h3>
        <span className="text-[0.6rem] font-bold text-white/30">{currentIdx + 1} / {objections.length}</span>
      </div>

      <div className="flex flex-col gap-4 relative z-10">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <span className="text-[0.55rem] font-black text-red-400 uppercase tracking-widest block mb-1">Cliente dice:</span>
          <p className="text-sm font-semibold text-white/90">"{currentObjection.objection}"</p>
        </div>

        {showResponse ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <span className="text-[0.55rem] font-black text-emerald-400 uppercase tracking-widest block mb-1">Respuesta sugerida:</span>
            <p className="text-sm font-semibold text-white/90 italic leading-relaxed">"{currentObjection.response}"</p>
            
            {profile?.closingPhrase && (
              <div className="mt-3 pt-3 border-t border-emerald-500/20">
                <span className="text-[0.55rem] font-black text-emerald-400 uppercase tracking-widest block mb-1">Cierre:</span>
                <p className="text-xs font-bold text-emerald-300">"{profile.closingPhrase}"</p>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => {
              setShowResponse(true);
              markPracticeCompleted(device.id);
            }}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs py-4 rounded-xl transition-colors"
          >
            Ver respuesta
          </button>
        )}

        {showResponse && (
          <div className="flex gap-2 mt-2">
            <button 
              onClick={handleNext}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              Siguiente objeción <ChevronRight size={14} />
            </button>
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('select-device', { detail: device.id }));
                window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'register' }));
              }}
              className="flex-1 bg-[var(--neo-accent)] text-black font-black uppercase tracking-widest text-[0.65rem] py-3 rounded-xl shadow-lg active:scale-95 transition-all"
            >
              Registrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
