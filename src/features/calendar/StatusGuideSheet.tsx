import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Target, Activity, AlertCircle, Coffee, Info, X } from 'lucide-react';

const statusGuide = [
  { 
    label: 'SUPERADO', 
    icon: Sparkles,
    bgClass: 'bg-[#fcd34d]', 
    textClass: 'text-[#fcd34d]',
    desc: '¡Increíble! Diste el 110% y fuiste mucho más allá de lo que se esperaba hoy.' 
  },
  { 
    label: 'LOGRADO', 
    icon: Target,
    bgClass: 'bg-[#4ade80]', 
    textClass: 'text-[#4ade80]',
    desc: '¡Misión cumplida! Alcanzaste el objetivo del día a la perfección. ¡Sigue así!' 
  },
  { 
    label: 'PARCIAL', 
    icon: Activity,
    bgClass: 'bg-[#fb923c]', 
    textClass: 'text-[#fb923c]',
    desc: 'Buen intento. Avanzaste bastante, aunque faltó un pequeño empujoncito para cerrarlo.' 
  },
  { 
    label: 'FALTA', 
    icon: AlertCircle,
    bgClass: 'bg-[#ef4444]', 
    textClass: 'text-[#fc8181]',
    desc: 'Hoy no se pudo, ¡y no pasa nada! Mañana es una nueva oportunidad para intentarlo.' 
  },
  { 
    label: 'DÍA LIBRE', 
    icon: Coffee,
    bgClass: 'bg-[#9ca3af]', 
    textClass: 'text-[#d1d5db]',
    desc: '¡A recargar pilas! Tiempo para ti, sin presiones ni pendientes en la lista.' 
  },
  { 
    label: 'SIN VENTA', 
    icon: Info,
    bgClass: 'bg-transparent border-2 border-dashed border-white/40', 
    textClass: 'text-[#94a3b8]',
    desc: 'Día visible sin equipos registrados. El borde punteado indica que aún no hay ventas en ese día.' 
  },
];

interface StatusGuideSheetProps {
  onClose: () => void;
}

export function StatusGuideSheet({ onClose }: StatusGuideSheetProps) {
  return (
    <>
      {/* Invisible backdrop just to catch clicks outside */}
      <div 
        className="fixed inset-0 z-[90]"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        // Absolute position usually controlled by the parent relative container (in GridView/AgendaView)
        className="absolute top-12 right-0 z-[100] w-[300px] sm:w-[320px] bg-[#1c1f24]/95 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-4 shadow-2xl flex flex-col select-none outline-none"
      >
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/10 text-white rounded-lg px-2 flex items-center justify-center">
              <Info size={14} className="mr-1" />
              <span className="text-[10px] font-black text-white tracking-widest uppercase">
                Cajas de Colores
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
        </div>

        {/* Lista de estados */}
        <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar pr-1" style={{ maxHeight: '60vh' }}>
          {statusGuide.map((status, index) => {
            const Icon = status.icon;
            return (
              <div 
                key={index} 
                className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-start gap-2.5 transition-colors hover:bg-white/10"
              >
                {/* El indicador */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className={`w-7 h-7 rounded-lg ${status.bgClass} flex items-center justify-center text-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]`}>
                    <Icon size={14} className="opacity-90" strokeWidth={2.5} />
                  </div>
                </div>

                {/* El texto y explicación */}
                <div className="flex flex-col text-left">
                  <span className={`text-[0.6rem] font-black uppercase tracking-widest mb-0.5 ${status.textClass}`}>
                    {status.label}
                  </span>
                  <p className="text-white/60 text-[0.6rem] font-medium leading-normal">
                    {status.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
