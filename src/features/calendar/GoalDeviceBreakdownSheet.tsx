import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { VivoPhoneIcon } from '../../components/icons/VivoPhoneIcon';
import { PeriodGoalProgress } from '../../lib/goalBreakdown';

type GoalDeviceBreakdownSheetProps = {
  progress: PeriodGoalProgress | null;
  isOnDark?: boolean;
  onClose: () => void;
};

export function GoalDeviceBreakdownSheet({
  progress,
  isOnDark = false,
  onClose,
}: GoalDeviceBreakdownSheetProps) {
  return (
    <AnimatePresence>
      {progress && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[90] mx-auto w-full max-w-[410px] rounded-t-[2rem] border border-white/10 bg-[#0d0f12]/96 backdrop-blur-xl shadow-[0_-20px_60px_rgba(0,0,0,0.55)] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />

            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400/90">
                  Conteo por dispositivo
                </p>
                <h3 className="text-lg font-black text-white tracking-tight">
                  {progress.label}
                </h3>
                <p className="text-[11px] font-semibold text-white/55 mt-0.5">
                  {progress.current} de {progress.goal} equipos · {progress.percent}%
                  {progress.projected > progress.current && (
                    <span> · ~{progress.projected} proyectados</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/8 p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Cerrar desglose"
              >
                <X size={16} />
              </button>
            </div>

            {progress.segments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/12 bg-white/4 px-4 py-8 text-center">
                <p className="text-sm font-bold text-white/70">Sin ventas en este periodo</p>
                <p className="text-[11px] text-white/45 mt-1">Cada equipo vendido sumará su color a la barra.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[52dvh] overflow-y-auto no-scrollbar">
                {progress.segments.map((segment) => (
                  <div
                    key={segment.key}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-2.5"
                  >
                    <div
                      className="h-10 w-10 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0"
                      style={{ background: `linear-gradient(145deg, ${segment.colorHex}33, rgba(0,0,0,0.35))` }}
                    >
                      <VivoPhoneIcon
                        deviceId={segment.deviceId}
                        colorName={segment.colorName}
                        className="h-8 w-auto"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-black text-white truncate">{segment.deviceName}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: segment.colorHex }}
                        />
                        <span className="text-[10px] font-semibold text-white/55 truncate">{segment.colorName}</span>
                      </div>
                    </div>

                    <div
                      className="shrink-0 min-w-[2.4rem] h-8 px-2 rounded-xl flex items-center justify-center text-sm font-black text-white border"
                      style={{
                        backgroundColor: `${segment.colorHex}22`,
                        borderColor: `${segment.colorHex}66`,
                        color: isOnDark ? '#fff' : '#fff',
                      }}
                    >
                      {segment.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
