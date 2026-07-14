import React from 'react';
import { motion, useDragControls } from 'motion/react';
import { Award } from 'lucide-react';

interface AcademyOverlayProps {
  onClose: () => void;
}

export function AcademyOverlay({ onClose }: AcademyOverlayProps) {
  const dragControls = useDragControls();

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 320 }}
        dragElastic={{ top: 0.05, bottom: 0.7 }}
        onDragEnd={(e, info) => {
          if (info.offset.y > 110) {
            onClose();
          }
        }}
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }}
        transition={{ type: "spring", damping: 34, stiffness: 260, mass: 0.9 }}
        className="absolute bottom-0 left-0 w-full z-50 bg-[#0d0f12]/95 backdrop-blur-[30px] border-t border-white/10 rounded-t-[2.5rem] p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.85)] flex flex-col max-h-[85dvh] overflow-hidden select-none"
      >
        <button
          type="button"
          aria-label="Arrastrar para cerrar academia comercial"
          onPointerDown={(event) => dragControls.start(event)}
          className="w-full flex items-center justify-center pb-6 shrink-0 cursor-grab active:cursor-grabbing touch-none"
        >
          <span className="w-12 h-1.5 bg-white/20 rounded-full" />
        </button>
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Award size={20} />
            </div>
            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">vivo Smart Club</h3>
          </div>
          <motion.button 
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
          >
            ✕
          </motion.button>
        </div>
        
        <div className="flex flex-col gap-5 overflow-y-auto no-scrollbar pb-[var(--viewport-pb)] flex-1 px-1 mt-2 text-left touch-pan-y">
          <p className="text-xs font-semibold text-white/70 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/5">
            ¡Felicidades, Promotor! Aquí tienes las estrategias secretas para colocar equipos vivo con mayor margen y disparar tus comisiones semanales. 🚀
          </p>
          
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider text-emerald-400">1. El Secreto de la "Luz de Aura"</h4>
            <p className="text-xs text-white/80 leading-relaxed font-semibold">
              Al ofrecer la serie <strong className="text-white font-bold">V50/V60 Lite</strong>, no hables de megapíxeles. Invita al cliente a tomarse una selfie con la Luz de Aura encendida y apagada. El contraste visual vende el equipo automáticamente.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-black text-white uppercase tracking-wider text-[#a78bfa]">2. Desmitifica la Batería del Y04</h4>
            <p className="text-xs text-white/80 leading-relaxed font-semibold">
              Destaca que el <strong className="text-white font-bold">Y04</strong> ofrece una retención inteligente de carga. Aunque es un equipo muy económico, dura hasta 48 horas sin conectarse y resiste micro-caídas diarias gracias a su construcción con policarbonato reforzado.
            </p>
          </div>

          <div className="flex flex-col gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
            <span className="text-[0.62rem] font-black text-emerald-400 uppercase tracking-widest block mb-1">Estrategia de Cierre Rápido</span>
            <p className="text-xs italic text-white/90 leading-relaxed font-semibold">
              "Si busca un equipo duradero que no requiera cargador a mitad del día, y que además tenga el respaldo de la Inteligencia Artificial de vivo, este modelo es la mejor decisión hoy."
            </p>
          </div>

          <div className="mb-4">
            <span className="text-[0.62rem] font-black text-white/40 uppercase tracking-widest block mb-2">Comisiones por Meta Diaria</span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                <span className="block text-[#1ECCA2] font-black text-sm">3 Ventas</span>
                <span className="text-[0.55rem] text-white/50 uppercase font-bold">Bono Base</span>
              </div>
              <div className="p-3 bg-white/[0.04] border border-white/10 rounded-xl text-center">
                <span className="block text-emerald-400 font-black text-sm">5 Ventas</span>
                <span className="text-[0.55rem] text-white/60 uppercase font-bold">+15% Mult.</span>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl text-center">
                <span className="block text-white font-black text-sm">8+ Ventas</span>
                <span className="text-[0.55rem] text-emerald-400 uppercase font-bold">Elite Club</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
