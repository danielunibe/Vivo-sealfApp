'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Device } from '@/types/device';
import { getDeviceAsset } from '@/lib/deviceAssets';
import ProductImageFrame from '@/components/ui/ProductImageFrame';
import { getPaletteForDevice } from '@/lib/modelPalettes';
import { getDeviceKnowledge, getKnowledgeStatusLabel } from '@/lib/deviceKnowledge';
import { X, CheckCircle2, MessageSquare, ShieldAlert, Zap, Award, Sparkles, UserRound, Scale, ExternalLink } from 'lucide-react';

interface DeviceCommercialGuideProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onRegisterSale: () => void;
}

export default function DeviceCommercialGuide({
  device,
  isOpen,
  onClose,
  onRegisterSale
}: DeviceCommercialGuideProps) {
  if (!device) return null;

  const asset = getDeviceAsset(device.name);
  const palette = getPaletteForDevice(device.name, device)[0]; // Use first color for theme
  const bgGradient = palette?.bgDark || 'linear-gradient(135deg, #1A1325 0%, #130E1B 50%, #0E0A14 100%)';
  const accentColor = palette?.accent || '#6B7280';
  const data = getDeviceKnowledge(device);
  const confidenceLabel = getKnowledgeStatusLabel(data.confidence);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-[10%] bg-neutral-900 rounded-t-3xl overflow-hidden z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
            style={{ backgroundImage: bgGradient }}
          >
            {/* Header (Sticky) */}
            <div className="flex justify-between items-center p-4 md:p-5 pb-2 shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-mono">
                  Ficha Comercial · {confidenceLabel}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
                  {device.name}
                  {device.margin > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 font-mono translate-y-[1px]">
                      +${device.margin}
                    </span>
                  )}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-5 pb-28 custom-scrollbar">
              
              {/* Hero Image & Title Section */}
              <div className="relative flex flex-col items-center mt-2 mb-6">
                {/* Glow behind image */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] opacity-40 pointer-events-none"
                  style={{ backgroundColor: accentColor }}
                />
                
                <motion.div
                  initial={{ scale: 0.9, y: 10, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="w-full max-w-[280px] h-auto z-10 select-none mb-4 drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)]"
                >
                  <ProductImageFrame
                    src={device.imageDataUrl || device.imageUrl || (asset.hasRealAssets ? asset.catalogSrc : undefined)}
                    alt={device.name}
                    fallbackLabel={asset.fallbackLabel}
                    accentColor={accentColor}
                    variant="hero"
                    className="w-full"
                  />
                </motion.div>

                <div className="text-center z-10 w-full max-w-sm">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight flex justify-center items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: accentColor }} />
                    {data.heroTitle}
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md">
                    <p className="text-sm text-white/80 font-medium leading-snug">
                      &ldquo;{data.quickPitch || data.summary}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Positioning / customer */}
              <div className="mb-6 grid grid-cols-1 gap-2">
                <div className="bg-black/18 border border-white/5 rounded-xl p-3 flex gap-3">
                  <UserRound className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/45 mb-1">Cliente ideal</h4>
                    <p className="text-xs md:text-sm text-white/85 font-medium leading-snug">{data.idealCustomer || data.summary}</p>
                  </div>
                </div>
                {data.positioning && (
                  <div className="bg-black/18 border border-white/5 rounded-xl p-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/45 mb-1">Posicionamiento</h4>
                    <p className="text-xs md:text-sm text-white/85 font-medium leading-snug">{data.positioning}</p>
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest font-mono mb-3 ml-1">
                  Especificaciones Clave
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {data.keySpecs.map((spec, i) => (
                    <div key={i} className="bg-black/20 border border-white/5 rounded-lg p-2.5 flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
                      <span className="text-xs md:text-sm text-white/90 font-medium leading-tight">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Arguments */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest font-mono mb-3 ml-1 flex items-center gap-2">
                  Argumentos de Venta
                </h4>
                <div className="flex flex-col gap-2">
                  {data.salesArguments.map((arg, i) => {
                    const title = typeof arg === 'string' ? arg : arg.title;
                    const description = typeof arg === 'string' ? '' : arg.description;
                    return (
                    <div key={i} className="bg-gradient-to-r from-white/5 to-transparent border border-white/5 rounded-lg p-3 flex gap-3 items-center">
                      <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
                      <span className="text-sm text-white font-medium">
                        {title}
                        {description && <span className="block text-xs text-white/55 mt-0.5 leading-snug">{description}</span>}
                      </span>
                    </div>
                  );})}
                </div>
              </div>

              {/* Objections */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest font-mono mb-3 ml-1">
                  Manejo de Objeciones
                </h4>
                <div className="flex flex-col gap-3">
                  {data.objectionsAndResponses.map((item, i) => (
                    <div key={i} className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 relative overflow-hidden">
                      <div className="flex gap-2 items-start mb-2">
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm text-red-200/90 font-medium italic">
                          &ldquo;{item.objection}&rdquo;
                        </p>
                      </div>
                      <div className="flex gap-2 items-start pl-2 border-l-2 ml-1" style={{ borderColor: accentColor }}>
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accentColor }} />
                        <p className="text-xs md:text-sm text-white/90 font-medium leading-snug">
                          {item.response}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Internal comparisons */}
              {data.comparisonNotes && data.comparisonNotes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest font-mono mb-3 ml-1">
                    Comparativa Interna
                  </h4>
                  <div className="flex flex-col gap-2">
                    {data.comparisonNotes.map((item) => (
                      <div key={`${item.comparedTo}-${item.note}`} className="bg-black/18 border border-white/5 rounded-lg p-3 flex gap-3">
                        <Scale className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
                        <p className="text-xs md:text-sm text-white/85 font-medium leading-snug">
                          <span className="font-black text-white">{item.comparedTo}:</span> {item.note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Closing */}
              <div className="mb-2">
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide">
                      Cierre Recomendado
                    </h4>
                  </div>
                  <p className="text-sm text-white/90 font-medium leading-relaxed">
                    {data.recommendedClosing}
                  </p>
                </div>
              </div>

              {/* Sources and confidence */}
              <div className="mb-2 rounded-xl border border-white/5 bg-black/15 p-3">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white/45">Fuentes y confianza</h4>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white/60">
                    {confidenceLabel}
                  </span>
                </div>
                {data.sourceRegion && (
                  <p className="text-[10px] text-white/50 leading-snug mb-2">{data.sourceRegion}</p>
                )}
                <div className="flex flex-col gap-1.5">
                  {(data.sources || []).map((source) => (
                    <a
                      key={`${source.label}-${source.url || source.note}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5 text-[10px] font-bold text-white/65"
                    >
                      <span className="truncate">{source.label}</span>
                      {source.url && <ExternalLink className="h-3 w-3 shrink-0" />}
                    </a>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Action Area (Sticky) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent z-20">
              <button
                onClick={onRegisterSale}
                className="w-full h-12 md:h-14 rounded-2xl flex items-center justify-center font-bold text-base shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                style={{
                  background: `linear-gradient(to right, ${accentColor}, ${accentColor}dd)`,
                  color: '#fff'
                }}
              >
                Vender {device.name}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
