import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DeviceModel, PhoneModel } from '../../types';
import { VivoPhoneIcon } from '../../components/icons/VivoPhoneIcon';
import { Edit2, ExternalLink } from 'lucide-react';
import { CommercialProfileEditor } from './CommercialProfileEditor';
import { getDeviceCatalogImage, getDeviceHeroImage, getPhoneVariantCatalogImage } from '../../lib/deviceImages';
import { getActiveOrderedVariants } from '../../lib/modelOrdering';

interface DeviceDetailOverlayProps {
  device: DeviceModel | PhoneModel;
  activePreviewColor: string;
  onClose: () => void;
  onColorChange: (color: string) => void;
}

// Type guard
const isPhoneModel = (device: DeviceModel | PhoneModel): device is PhoneModel => {
  return 'variants' in device;
};

export function DeviceDetailOverlay({ 
  device, 
  activePreviewColor, 
  onClose, 
  onColorChange 
}: DeviceDetailOverlayProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Adapters for properties depending on whether it's PhoneModel or DeviceModel
  const orderedPhoneVariants = isPhoneModel(device) ? getActiveOrderedVariants(device) : [];
  const deviceColors = isPhoneModel(device) ? orderedPhoneVariants.map(v => v.colorName) : device.colors;
  const marginRange = isPhoneModel(device) ? Math.min(...device.variants.map(v => v.commission)) : device.margin;
  const legacy = isPhoneModel(device) ? undefined : device.commercial;
  const officialUrl = isPhoneModel(device) ? device.officialUrl : undefined;
  
  const getCatalogImg = () => {
    if (isPhoneModel(device)) {
       return getPhoneVariantCatalogImage(device, activePreviewColor);
    }
    return getDeviceCatalogImage(device) || getDeviceHeroImage(device, activePreviewColor);
  };
  
  const imgToUse = getCatalogImg();

  if (isEditingProfile && !isPhoneModel(device)) {
    return (
      <>
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs" onClick={() => setIsEditingProfile(false)} />
        <motion.div 
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: "spring", damping: 28, stiffness: 240 }}
          className="absolute bottom-0 left-0 w-full z-50 bg-[#0d0f12]/95 backdrop-blur-[30px] border-t border-white/10 rounded-t-[2.5rem] shadow-[0_-12px_40px_rgba(0,0,0,0.85)] flex flex-col h-[88dvh] overflow-hidden"
        >
          <CommercialProfileEditor 
            device={device} 
            onClose={() => setIsEditingProfile(false)} 
            onSaved={() => setIsEditingProfile(false)} 
          />
        </motion.div>
      </>
    );
  }

  const profile = device.commercialProfile;
  const hasProfileData = profile || legacy;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />
      <motion.div 
        drag="y"
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
        transition={{ type: "spring", damping: 28, stiffness: 240 }}
        className="absolute bottom-0 left-0 w-full z-50 bg-[#0d0f12]/95 backdrop-blur-[30px] border-t border-white/10 rounded-t-[2.5rem] p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.85)] flex flex-col max-h-[88dvh] overflow-hidden select-none"
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-5 shrink-0 cursor-grab active:cursor-grabbing" />
        
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-3xl font-display font-black tracking-tight text-white uppercase">{device.name}</h3>
          <motion.button 
            onClick={onClose}
            whileTap={{ scale: 0.85 }}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white"
          >
            <span className="font-bold text-sm">✕</span>
          </motion.button>
        </div>
        <p className="text-xs font-black text-[var(--neo-accent)] uppercase tracking-wider mb-5 -mt-3.5">{device.pitch}</p>
        
        <div className="flex flex-col gap-5 overflow-y-auto no-scrollbar pb-[var(--viewport-pb)] flex-1 px-1">
          
          {/* 3D-like Interactive SVG Phone Viewer with gestural swipe-to-change color */}
          <div className="w-full flex flex-col items-center justify-center py-4 bg-white/[0.02] dark:bg-black/40 rounded-3xl border border-white/5 shadow-inner relative overflow-hidden group">
            <div className="absolute top-2 left-3 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[0.52rem] font-bold uppercase tracking-wider text-white/40">
              Toca un color o desliza
            </div>
            
            <motion.div 
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                const colors = deviceColors;
                const currentIdx = colors.indexOf(activePreviewColor);
                if (currentIdx === -1) return;
                
                if (info.offset.x > 35) {
                  const prevIdx = (currentIdx - 1 + colors.length) % colors.length;
                  onColorChange(colors[prevIdx]);
                } else if (info.offset.x < -35) {
                  const nextIdx = (currentIdx + 1) % colors.length;
                  onColorChange(colors[nextIdx]);
                }
              }}
              className="w-full h-40 flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePreviewColor}
                  initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.85, rotate: 4 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="h-[95%] aspect-[1/2] drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
                >
                  {imgToUse ? (
                    <img loading="eager" decoding="async" src={imgToUse} alt={device.name} className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
                  ) : (
                    <VivoPhoneIcon deviceId={device.id} colorName={activePreviewColor} />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
            
            <div className="text-[0.52rem] text-white/30 font-black uppercase tracking-widest mt-1 uppercase">
              Acabado actual
            </div>
            <div className="text-xs font-bold text-[var(--neo-accent)] tracking-wider mt-0.5 min-h-[16px] uppercase">
              {activePreviewColor}
            </div>
            
            <div className="flex w-full flex-wrap gap-2 mt-3 items-center justify-center px-3">
              {deviceColors.map(color => {
                const isSelected = activePreviewColor === color;
                let dotColor = '#555';
                if (isPhoneModel(device)) {
                  const matched = device.variants.find(v => v.colorName === color);
                  if (matched && matched.colorHex) dotColor = matched.colorHex;
                } else {
                  const cLower = (color || '').toLowerCase();
                  if (cLower.includes('verde') || cLower.includes('jade')) dotColor = '#1ecca2';
                  else if (cLower.includes('lavanda') || cLower.includes('cristal')) dotColor = '#a78bfa';
                  else if (cLower.includes('lila') || cLower.includes('fantasia')) dotColor = '#d946ef';
                  else if (cLower.includes('negro') || cLower.includes('mistico') || cLower.includes('elegante')) dotColor = '#242526';
                  else if (cLower.includes('azul') || cLower.includes('titanio')) dotColor = '#2a5cd9';
                  else if (cLower.includes('expresso') || cLower.includes('cafe')) dotColor = '#3f1f13';
                  else if (cLower.includes('blanco') || cLower.includes('nube') || cLower.includes('brillante')) dotColor = '#f3f4f6';
                  else if (cLower.includes('gris') || cLower.includes('estelar')) dotColor = '#60636A';
                }

                return (
                  <button 
                    key={color}
                    onClick={() => onColorChange(color)}
                    aria-pressed={isSelected}
                    className={`relative flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 py-1.5 focus:outline-none cursor-pointer transition-all ${
                      isSelected
                        ? 'border-white/35 bg-white/12 text-white shadow-[0_8px_20px_rgba(0,0,0,0.22)]'
                        : 'border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white/80'
                    }`}
                  >
                    <div 
                      className="w-3.5 h-3.5 rounded-full relative z-10 border border-black/20 shadow-sm shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="max-w-[6.75rem] truncate text-[0.56rem] font-black uppercase tracking-[0.12em]">
                      {color}
                    </span>
                    {isSelected && (
                      <motion.span
                        layoutId="activeCatalogColorDot"
                        className="h-1.5 w-1.5 rounded-full bg-[var(--neo-accent)]"
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <span className="font-bold opacity-70 text-[0.62rem] uppercase tracking-widest text-[#a78bfa]">Comisión Base</span>
            <span className="font-black text-3xl text-emerald-400 tracking-tighter leading-none">${marginRange}</span>
          </div>

          {hasProfileData ? (
            <div className="flex flex-col gap-5 mt-2 relative before:absolute before:left-0 before:top-0 before:w-full before:h-[1px] before:bg-gradient-to-r before:from-white/10 before:to-transparent pt-5">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-lg tracking-tight text-white uppercase">Guía Comercial</h4>
                {!isPhoneModel(device) && (
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-white/10 p-2 rounded-full text-white/70 hover:text-white"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="font-bold opacity-60 text-[0.58rem] uppercase tracking-widest text-[#a78bfa]">Cliente Ideal</span>
                <p className="font-semibold text-xs leading-relaxed text-white/90 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  {profile?.idealCustomer || legacy?.clienteIdeal || 'No especificado'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-2">
                  <span className="font-bold opacity-60 text-[0.58rem] uppercase tracking-widest text-emerald-400">Ventajas / Puntos Fuertes</span>
                  <ul className="text-[11px] font-semibold flex flex-col gap-1.5 text-white/80">
                    {(profile?.keyStrengths || legacy?.ventajas || []).map((v, i) => (
                      <li key={i} className="flex gap-1.5 leading-tight"><span className="text-emerald-400 font-bold">•</span> {v}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-bold opacity-60 text-[0.58rem] uppercase tracking-widest text-blue-400">Posicionamiento</span>
                  <div className="text-[11px] font-bold text-white/80 uppercase">
                    {profile?.positioning || 'Equilibrio'}
                  </div>
                  {legacy?.diferenciadores && legacy.diferenciadores.length > 0 && (
                    <ul className="text-[11px] font-semibold flex flex-col gap-1.5 text-white/80 mt-2">
                      {legacy.diferenciadores.map((d, i) => (
                        <li key={i} className="flex gap-1.5 leading-tight"><span className="text-blue-400 font-bold">•</span> {d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {((profile?.objections?.length || 0) > 0 || (legacy?.objeciones?.length || 0) > 0) && (
                <div className="flex flex-col gap-2.5">
                  <span className="font-bold opacity-60 text-[0.58rem] uppercase tracking-widest text-red-400">Manejo de Objeciones</span>
                  {(profile?.objections || legacy?.objeciones.map(o => ({ objection: o.objecion, response: o.refutacion })) || []).map((obj, i) => (
                    <div key={i} className="flex flex-col gap-1 text-xs bg-white/[0.01] p-3 rounded-xl border border-red-500/10">
                      <span className="font-bold text-red-300">"{obj.objection}"</span>
                      <span className="font-semibold italic text-white/70 leading-relaxed">R: {obj.response}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 mt-2">
                <span className="font-bold opacity-60 text-[0.58rem] uppercase tracking-widest text-white">Guion de Venta Sugerido</span>
                <div className="pl-3.5 border-l-2 border-[var(--neo-accent)]">
                  <p className="font-bold text-xs italic text-white/90 leading-relaxed">"{profile?.mainPitch || legacy?.guion || 'No especificado'}"</p>
                </div>
              </div>

              {profile?.closingPhrase && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="font-bold opacity-60 text-[0.58rem] uppercase tracking-widest text-emerald-400">Frase de Cierre</span>
                  <div className="pl-3.5 border-l-2 border-emerald-400">
                    <p className="font-bold text-xs italic text-white/90 leading-relaxed">"{profile.closingPhrase}"</p>
                  </div>
                </div>
              )}

              {profile?.competitorNotes && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="font-bold opacity-60 text-[0.58rem] uppercase tracking-widest text-orange-400">Competencia</span>
                  <div className="text-[11px] font-semibold text-white/80 bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
                    {profile.competitorNotes}
                  </div>
                </div>
              )}

              {profile?.salesTips && profile.salesTips.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="font-bold opacity-60 text-[0.58rem] uppercase tracking-widest text-blue-400">Tips de Venta</span>
                  <ul className="text-[11px] font-semibold flex flex-col gap-1.5 text-white/80">
                    {profile.salesTips.map((tip, i) => (
                      <li key={i} className="flex gap-1.5 leading-tight"><span className="text-blue-400 font-bold">•</span> {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 mt-4 py-8 relative before:absolute before:left-0 before:top-0 before:w-full before:h-[1px] before:bg-gradient-to-r before:from-white/10 before:to-transparent pt-8 text-center px-4">
              <span className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                <Edit2 size={18} />
              </span>
              <p className="text-xs font-semibold text-white/60 leading-relaxed max-w-[200px] mx-auto">
                Agrega una ficha comercial desde Ajustes para entrenar este modelo.
              </p>
              {!isPhoneModel(device) && (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="mt-2 text-[0.65rem] font-bold text-[var(--neo-accent)] uppercase tracking-widest border border-[var(--neo-accent)]/30 bg-[var(--neo-accent)]/10 px-4 py-2 rounded-full"
                >
                  Configurar Ficha
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-6 pb-2 mt-4 border-t border-white/5 shrink-0 sticky bottom-0 bg-[#0d0f12]">
            {officialUrl && (
              <button
                onClick={() => window.open(officialUrl, '_blank', 'noopener,noreferrer')}
                className="w-full border border-white/10 bg-white/[0.04] text-white/75 font-black uppercase tracking-widest text-[0.62rem] py-3 rounded-[1.25rem] flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <ExternalLink size={13} />
                Ver ficha oficial
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('select-device', { detail: device.id }));
                window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'register' }));
              }}
              className="w-full bg-[var(--neo-accent)] text-black font-black uppercase tracking-widest text-[0.7rem] py-4 rounded-[1.5rem] flex items-center justify-center shadow-lg active:scale-95 transition-all"
            >
              Registrar este modelo
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
