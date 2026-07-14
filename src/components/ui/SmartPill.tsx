import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Sparkles, Calendar, RotateCcw, X, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';

interface SmartPillProps {
  children?: React.ReactNode;
  active?: boolean;
  title?: string;
  activeTab?: string;
}

// synthesized Apple Pay/Dynamic Island sound cue
const playSoftDoubleChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Smooth chime oscillators
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);

    // Second sweet note delayed slightly
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6 note
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.08);
    gain2.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.55);
  } catch (err) {
    console.warn("Soft synthesizer playback missed/blocked:", err);
  }
};

export function SmartPill({ children, active, title = "VIVO Promotor", activeTab }: SmartPillProps) {
  const [successSale, setSuccessSale] = useState<{
    deviceName: string;
    amount: number;
    color: string;
  } | null>(null);
  const [islandState, setIslandState] = useState<'idle' | 'shrink-prep' | 'pop-stretch' | 'expanded'>('idle');
  
  // Ref to hold timeouts to safely support uninterrupted concurrent triggers (re-triggering)
  const animTimeouts = useRef<number[]>([]);

  const clearAllAnimTimeouts = () => {
    animTimeouts.current.forEach(id => clearTimeout(id));
    animTimeouts.current = [];
  };

  useEffect(() => {
    const handleSaleConfirmed = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const saleData = {
          deviceName: customEvent.detail.deviceName,
          amount: customEvent.detail.amountEarned,
          color: customEvent.detail.deviceColor,
        };

        // Clear existing timeouts in case we are re-triggered rapidly
        clearAllAnimTimeouts();

        // 1. Play soft synthesized premium Ding feedback
        playSoftDoubleChime();

        // 2. Play soft haptic buzz on supported devices
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([15, 30, 20]);
          } catch (_) {}
        }

        // Stage 1: Quick gooey shrink preparation
        setIslandState('shrink-prep');

        // Stage 2: Liquid pop-stretch slingshot animation
        const t1 = window.setTimeout(() => {
          setIslandState('pop-stretch');
        }, 80);

        // Stage 3: Smooth snap and full-bento size expansion
        const t2 = window.setTimeout(() => {
          setSuccessSale(saleData);
          setIslandState('expanded');
        }, 220);

        // Stage 4: Retract back down to typical small mode
        const t3 = window.setTimeout(() => {
          setIslandState('idle');
          // Slightly delay removing metadata to support retract motion transitions
          const t4 = window.setTimeout(() => {
            setSuccessSale(null);
          }, 350);
          animTimeouts.current.push(t4);
        }, 5200);

        animTimeouts.current.push(t1, t2, t3);
      }
    };
    window.addEventListener('sale-confirmed', handleSaleConfirmed);
    return () => {
      window.removeEventListener('sale-confirmed', handleSaleConfirmed);
      clearAllAnimTimeouts();
    };
  }, []);

  if (children) {
    return (
      <div className={clsx(
        "bg-black text-white px-4 py-1.5 inline-flex items-center justify-center text-xs font-bold tracking-wide rounded-[2rem] shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-white/5",
        active ? "text-[#1ECCA2]" : "opacity-80"
      )}>
        {children}
      </div>
    );
  }

  const isRegister = activeTab === 'register';
  const isCalendar = activeTab === 'calendar';
  const isCatalog = activeTab === 'catalog';
  const isPiggyBank = activeTab === 'piggy-bank';

  const handleRedirectToRegister = () => {
    window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'register' }));
  };

  const handleEditCalendarClick = () => {
    window.dispatchEvent(new CustomEvent('toggle-calendar-agenda'));
  };

  const handleTogglePiggyBankAdd = () => {
    window.dispatchEvent(new CustomEvent('toggle-piggy-bank-add-mode'));
  };

  const handleDismiss = (e: React.MouseEvent) => {
    // Only dismiss if we are in the expanded state
    if (islandState === 'expanded') {
      e.stopPropagation();
      setIslandState('idle');
      setTimeout(() => {
        setSuccessSale(null);
      }, 300);
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "backdrop-blur-[32px] text-white px-5 sm:px-6 pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex border border-transparent select-none transition-all duration-300 relative overflow-hidden outline-none focus:outline-none ring-0";

    if (islandState === 'expanded') {
      return `${baseClasses} items-center justify-between rounded-[2.25rem] bg-gradient-to-br from-[#020202] via-[#090909] to-[#01140e] border-transparent cursor-pointer py-3 w-[335px] sm:w-[420px] h-[98px] sm:h-[104px] shadow-[0_0_36px_rgba(16,185,129,0.18)]`;
    }
    
    if (islandState === 'shrink-prep') {
      return `${baseClasses} items-center justify-between rounded-[1.5rem] bg-[#000000] border-transparent py-1.5 w-[210px] sm:w-[270px] h-[38px] sm:h-[44px]`;
    }
    
    if (islandState === 'pop-stretch') {
      return `${baseClasses} items-center justify-between rounded-[1.75rem] bg-[#020202] border-transparent py-2 w-[345px] sm:w-[415px] h-[42px] sm:h-[48px]`;
    }
    
    // Idle / standard mode
    return `${baseClasses} items-center justify-between rounded-[1.75rem] bg-[#0a0a0a]/50 dark:bg-[#0a0a0a]/75 border-transparent py-2 sm:py-3 w-[312px] sm:w-[390px] h-[48px] sm:h-[58px] hover:border-transparent hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)] cursor-default`;
  };

  const islandVariants = {
    idle: { 
      scaleX: 1, 
      scaleY: 1, 
      y: 0, 
      rotate: 0,
      filter: "blur(0px)",
      borderColor: "rgba(255, 255, 255, 0)"
    },
    'shrink-prep': { 
      scaleX: 0.84, 
      scaleY: 1.18, 
      y: -6, 
      rotate: -0.5,
      filter: "blur(1px)",
      borderColor: "rgba(255, 255, 255, 0)"
    },
    'pop-stretch': { 
      scaleX: 1.18, 
      scaleY: 0.82, 
      y: 8, 
      rotate: 0.8,
      filter: "blur(0px)",
      borderColor: "rgba(255, 255, 255, 0)"
    },
    expanded: { 
      scaleX: 1, 
      scaleY: 1, 
      y: 0, 
      rotate: 0,
      filter: "blur(0px)",
      borderColor: "rgba(16, 185, 129, 0)",
    }
  };

  return (
    <div className="fixed top-2 md:top-4 left-0 w-full flex justify-center z-50 pointer-events-none px-4" id="smart-pill-outer">
      <motion.div 
        layout
        variants={islandVariants}
        animate={islandState}
        whileHover={islandState === 'idle' ? { 
          scaleX: 1.04, 
          scaleY: 0.97,
          transition: { type: "spring", stiffness: 450, damping: 12 }
        } : islandState === 'expanded' ? {
          scale: 0.99,
          shadow: "0 10px 30px rgba(16, 185, 129, 0.2)"
        } : {}}
        onClick={(e) => {
          handleDismiss(e);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
        }}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 15,
          mass: 0.8
        }}
        className={getContainerClasses()}
        id="smart-pill-container"
      >
        {/* Glow backdrop during active state */}
        {islandState === 'expanded' && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80 animate-pulse pointer-events-none" />
        )}

        <AnimatePresence mode="wait">
          {islandState === 'expanded' && successSale ? (
            <motion.div 
              key="success-content"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 w-full h-full relative"
            >
              {/* Premium Green Check Container with Bouncy spring scale */}
              <motion.div 
                initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.05 }}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_18px_rgba(16,185,129,0.35)] shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <motion.path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M5 13l4 4L19 7" 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.18 }}
                  />
                </svg>
              </motion.div>
              
              {/* Main Content Info structured with staggered entry */}
              <div className="flex flex-col text-left flex-1 min-w-0">
                <motion.span 
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 0.85, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.08 }}
                  className="text-[8px] sm:text-[9px] tracking-[0.24em] font-black text-[#1ECCA2] uppercase drop-shadow"
                >
                  Venta Registrada
                </motion.span>
                <motion.h4 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.14 }}
                  className="text-xs sm:text-sm font-black text-white uppercase tracking-tight truncate mt-0.5"
                >
                  {successSale.deviceName}
                </motion.h4>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="text-[9px] text-white/50 font-bold truncate mt-0.5"
                >
                  {successSale.color}
                </motion.span>
              </div>
              
              {/* Margin & Stats bubble sliding left with bounce physics */}
              <motion.div 
                initial={{ opacity: 0, x: 22, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 16, delay: 0.15 }}
                className="flex flex-col items-end shrink-0 text-right pl-1 relative pr-3 group/opt"
              >
                <span className="text-[8px] sm:text-[9px] font-black uppercase text-white/40 tracking-wider">Ahorro</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 drop-shadow-[0_2px_12px_rgba(52,211,153,0.45)] mt-0.5">
                  +${successSale.amount}
                </span>

                {/* Minimise instruction */}
                <span className="text-[7px] text-emerald-300/30 font-black tracking-widest block group-hover/opt:text-emerald-300 mt-0.5 transition-colors">
                  Tap to Hide
                </span>
              </motion.div>
            </motion.div>
          ) : (
            (islandState === 'idle' || !successSale) && (
              <motion.div 
                key="normal-content"
                initial={{ opacity: 0, filter: "blur(2px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(2px)" }}
                className="flex items-center justify-between w-full h-full"
              >
                <span className="text-[0.7rem] sm:text-[0.75rem] font-bold uppercase tracking-[0.16em] opacity-95 drop-shadow-sm truncate text-left text-white shrink-0 font-sans">
                  {title}
                </span>

                {isCalendar && (
                  <div className="flex items-center pl-3 border-l border-white/10 shrink-0">
                    <button 
                      onClick={handleEditCalendarClick}
                      className="flex items-center justify-center gap-1.5 focus:outline-none hover:opacity-80 transition-opacity active:scale-95 pointer-events-auto"
                      title="Alternar vista de agenda vertical"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </button>
                  </div>
                )}

                {isCatalog && (
                  <div className="flex items-center pl-3 border-l border-white/10 shrink-0">
                    <button 
                      className="flex items-center justify-center gap-1.5 focus:outline-none hover:opacity-80 transition-opacity active:scale-95 pointer-events-auto"
                      title="Ver existencias en tienda"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11v9h-5v-6h-4v6H5v-9M9 21H5a2 2 0 01-2-2V7l9-5 9 5v12a2 2 0 01-2 2h-4" />
                        </svg>
                      </div>
                      <span className="text-[0.6rem] sm:text-[0.65rem] font-bold text-white/90 tracking-wide uppercase font-sans">En Tienda</span>
                    </button>
                  </div>
                )}

                {isPiggyBank && (
                  <div className="flex items-center pl-3 border-l border-white/10 shrink-0">
                    <button 
                      onClick={handleTogglePiggyBankAdd}
                      className="flex items-center justify-center gap-1.5 focus:outline-none hover:opacity-80 transition-opacity active:scale-95 pointer-events-auto"
                      title="Añadir venta antigua"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--neo-accent)]/20 flex items-center justify-center text-[var(--neo-accent)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span className="text-[0.6rem] sm:text-[0.65rem] font-bold text-white/90 tracking-wide uppercase font-sans">Antigua</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

