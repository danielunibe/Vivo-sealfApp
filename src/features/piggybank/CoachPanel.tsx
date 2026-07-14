import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, AlertTriangle, Zap, CheckCircle2, MessageSquare, BookOpen } from 'lucide-react';
import { getClosingForecast, getTodayActionPlan } from '../../lib/coach';
import { getScriptForModel } from '../../lib/salesScripts';
import { SalesTrainingCard } from '../catalog/SalesTrainingCard';

export function CoachPanel() {
  const [forecast, setForecast] = useState(getClosingForecast());
  const [actionPlan, setActionPlan] = useState(getTodayActionPlan());

  useEffect(() => {
    const updateCoach = () => {
      setForecast(getClosingForecast());
      setActionPlan(getTodayActionPlan());
    };

    window.addEventListener('sales-updated', updateCoach);
    window.addEventListener('inventory-updated', updateCoach);
    window.addEventListener('settings-updated', updateCoach);
    
    return () => {
      window.removeEventListener('sales-updated', updateCoach);
      window.removeEventListener('inventory-updated', updateCoach);
      window.removeEventListener('settings-updated', updateCoach);
    };
  }, []);

  const getRiskColor = (level: string) => {
    if (level === 'Meta cumplida') return 'text-emerald-400';
    if (level === 'En ritmo') return 'text-blue-400';
    if (level === 'Riesgo medio') return 'text-amber-400';
    if (level === 'Riesgo alto') return 'text-rose-400';
    return 'text-gray-400';
  };

  const recommendedDevice = actionPlan.recommendedModel;
  let script = '';
  let objectionText = '';
  let responseText = '';
  let idealCustomer = '';
  
  if (recommendedDevice) {
    const profile = recommendedDevice.commercialProfile;
    const legacy = recommendedDevice.commercial;
    
    script = profile?.mainPitch || legacy?.guion || '';
    idealCustomer = profile?.idealCustomer || legacy?.clienteIdeal || '';
    
    if (!script) {
      let context: 'high_commission' | 'volume' | 'low_stock' = 'high_commission';
      if ((recommendedDevice.stock || 0) <= (recommendedDevice.minStock || 1)) {
        context = 'low_stock';
      } else if (recommendedDevice.margin < 100) {
        context = 'volume';
      }
      script = getScriptForModel(recommendedDevice, context);
    }

    const obs = profile?.objections || legacy?.objeciones?.map(o => ({ objection: o.objecion, response: o.refutacion })) || [];
    if (obs.length > 0) {
      objectionText = obs[0].objection;
      responseText = obs[0].response;
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Proyección de cierre */}
      {forecast && (
        <div className="bg-[#1A1A1A] rounded-[1.5rem] p-4 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Target size={100} />
          </div>
          
          <h3 className="text-[0.65rem] font-bold text-white/50 uppercase tracking-widest mb-3">
            Proyección de Cierre
          </h3>
          
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="text-[0.55rem] text-white/40 uppercase tracking-widest block mb-1">Cierre Estimado</span>
              <span className="text-xl font-black text-white">${forecast.projectedCommission.toFixed(0)}</span>
            </div>
            <div className="text-right">
              <span className="text-[0.55rem] text-white/40 uppercase tracking-widest block mb-1">Estado</span>
              <span className={`text-xs font-bold ${getRiskColor(forecast.riskLevel)}`}>{forecast.riskLevel}</span>
            </div>
          </div>
          
          {forecast.riskLevel !== 'Meta cumplida' && forecast.riskLevel !== 'Sin historial suficiente' && (
            <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center justify-between">
              <span className="text-[0.6rem] text-white/60">Ritmo necesario para llegar:</span>
              <span className="text-sm font-black text-white">${forecast.requiredDailyPace.toFixed(0)}/día</span>
            </div>
          )}
        </div>
      )}

      {/* Plan de acción del día */}
      <div className="bg-[#1A1A1A] rounded-[1.5rem] p-4 border border-white/5">
        <h3 className="text-[0.65rem] font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Zap size={14} className="text-yellow-400" />
          Coach de Hoy
        </h3>
        
        <div className="flex flex-col gap-2">
          {actionPlan.actions.map((action, idx) => (
            <div key={idx} className="bg-black/30 rounded-xl p-3 border border-white/5 flex gap-3 items-start">
              <div className="mt-0.5">
                {idx === 0 ? <CheckCircle2 size={14} className="text-emerald-400" /> : 
                 idx === 1 ? <TrendingUp size={14} className="text-blue-400" /> :
                 <AlertTriangle size={14} className="text-amber-400" />}
              </div>
              <p className="text-xs text-white/80 font-medium leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
        
        {recommendedDevice && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[0.6rem] font-bold text-white/50 uppercase tracking-widest mb-1">Modelo Sugerido</h4>
                <div className="text-sm font-black text-[var(--neo-accent)]">{recommendedDevice.name}</div>
              </div>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'catalog' }));
                }}
                className="text-[0.6rem] font-bold bg-white/10 px-2 py-1 rounded-md text-white/70 hover:text-white transition-colors"
              >
                Ver en catálogo
              </button>
            </div>
            
            {idealCustomer && (
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <span className="text-[0.55rem] font-bold text-[#a78bfa] uppercase tracking-widest block mb-1">Cliente Ideal</span>
                <p className="text-xs text-white/80 leading-relaxed">{idealCustomer}</p>
              </div>
            )}
            
            {script && (
              <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-3">
                <h4 className="text-[0.55rem] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <MessageSquare size={10} /> Guion Principal
                </h4>
                <p className="text-xs text-indigo-100/80 italic leading-relaxed">"{script}"</p>
              </div>
            )}
            
            {objectionText && (
              <div className="bg-red-900/10 border border-red-500/10 rounded-xl p-3 mt-1">
                <h4 className="text-[0.55rem] font-bold text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <AlertTriangle size={10} /> Si el cliente dice...
                </h4>
                <p className="text-xs font-bold text-red-300 mb-1">"{objectionText}"</p>
                <p className="text-xs text-white/70 leading-relaxed">R: "{responseText}"</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Entrenamiento */}
      {recommendedDevice && (
        <SalesTrainingCard device={recommendedDevice} />
      )}
    </div>
  );
}
