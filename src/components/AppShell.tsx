import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LiquidGlassFilter } from './ui/LiquidGlass';
import { VersionWelcomeOverlay } from './VersionWelcomeOverlay';
import { BootScreen } from './BootScreen';
import { SectionScreenHeader } from './ui/SectionScreenHeader';
import { SectionHeaderProvider, useSectionHeader } from './ui/SectionHeaderContext';

import RegisterSaleSection from '../features/RegisterSaleSection';
import { generateDailyChallenges, updateChallengeProgress } from '../lib/challenges';
import { runStorageMigrations } from '../lib/storage';
import { ensureDemoDatasetIfNeeded } from '../lib/demoMode';
import { onSettingsUpdated, onAppDayChanged } from '../lib/events';
import { applyVisualTheme } from '../lib/theme';
import { startWebArchiveScheduler } from '../lib/webArchiveSync';
import { startAppClockWatcher } from '../lib/appClock';
import { hasUnseenReleaseNotes, markReleaseNotesSeen } from '../lib/releaseNotes';

const CalendarSection = React.lazy(() => import('../features/CalendarSection'));
const CatalogSection = React.lazy(() => import('../features/CatalogSection'));
const PiggyBankSection = React.lazy(() => import('../features/PiggyBankSection'));
const SettingsSection = React.lazy(() => import('../features/SettingsSection'));

const APP_TABS = ['register', 'calendar', 'catalog', 'piggybank', 'settings'] as const;
type AppTab = (typeof APP_TABS)[number];

const isAppTab = (value: unknown): value is AppTab => {
  return typeof value === 'string' && APP_TABS.includes(value as AppTab);
};

const VISUAL_TAB_ORDER = ['calendar', 'catalog', 'register', 'piggybank', 'settings'] as const;

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>('register');
  const [previousTab, setPreviousTab] = useState<AppTab>('register');

  const direction = VISUAL_TAB_ORDER.indexOf(activeTab) > VISUAL_TAB_ORDER.indexOf(previousTab) ? 1 : -1;

  const handleTabChange = (newTab: AppTab) => {
    if (newTab !== activeTab) {
      setPreviousTab(activeTab);
      setActiveTab(newTab);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
      scale: 0.96,
      filter: 'blur(8px)',
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 40 : -40,
      opacity: 0,
      scale: 0.96,
      filter: 'blur(8px)',
    })
  };

  const [pendingSettingsSection, setPendingSettingsSection] = useState<string | null>(null);
  const [isCalendarGoalMet, setIsCalendarGoalMet] = useState(false);
  const [immersiveWebMode, setImmersiveWebMode] = useState(false);
  const [bootStatus, setBootStatus] = useState<'booting' | 'ready' | 'degraded'>('booting');
  const [bootPhase, setBootPhase] = useState<'booting' | 'revealing' | 'done'>('booting');
  const [showVersionWelcome, setShowVersionWelcome] = useState(false);

  useEffect(() => {
    const applyVisualPreferences = () => {
      applyVisualTheme();
    };

    applyVisualPreferences();
    return onSettingsUpdated(applyVisualPreferences);
  }, []);

  useEffect(() => {
    const migrationsOk = runStorageMigrations();
    ensureDemoDatasetIfNeeded();
    try {
      generateDailyChallenges();
      updateChallengeProgress();
    } catch (error) {
      console.error('[BOOT] Challenge initialization skipped', error);
    }
    setBootStatus(migrationsOk ? 'ready' : 'degraded');
  }, []);

  useEffect(() => {
    if (bootStatus === 'booting') {
      setBootPhase('booting');
      return;
    }

    setBootPhase('revealing');
    const timer = window.setTimeout(() => {
      setBootPhase('done');
    }, bootStatus === 'degraded' ? 1300 : 1900);

    return () => window.clearTimeout(timer);
  }, [bootStatus]);

  useEffect(() => {
    if (bootPhase !== 'done') return;
    setShowVersionWelcome(hasUnseenReleaseNotes());
  }, [bootPhase]);

  useEffect(() => {
    const handleReleaseNotesSeen = () => setShowVersionWelcome(false);
    window.addEventListener('release-notes-seen', handleReleaseNotesSeen);
    return () => window.removeEventListener('release-notes-seen', handleReleaseNotesSeen);
  }, []);

  useEffect(() => {
    if (bootPhase !== 'done') return;
    return startWebArchiveScheduler();
  }, [bootPhase]);

  useEffect(() => {
    if (bootPhase !== 'done') return;

    const stopClockWatcher = startAppClockWatcher();
    const unsubscribeDayChange = onAppDayChanged(() => {
      try {
        generateDailyChallenges();
        updateChallengeProgress();
      } catch (error) {
        console.error('[CLOCK] Daily refresh skipped', error);
      }
      window.dispatchEvent(new CustomEvent('settings-updated'));
    });

    return () => {
      stopClockWatcher?.();
      unsubscribeDayChange();
    };
  }, [bootPhase]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ active?: boolean }>).detail;
      setImmersiveWebMode(detail?.active === true);
    };
    window.addEventListener('immersive-web-mode', handler);
    return () => window.removeEventListener('immersive-web-mode', handler);
  }, []);

  useEffect(() => {
    if (bootStatus === 'booting') return;

    const handleSalesUpdated = () => {
      try {
        updateChallengeProgress();
      } catch (error) {
        console.error('[BOOT] Challenge progress update skipped', error);
      }
    };
    window.addEventListener('sales-updated', handleSalesUpdated);
    window.addEventListener('inventory-updated', handleSalesUpdated);
    
    const handleSwitch = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (isAppTab(detail)) {
        setActiveTab(detail);
        return;
      }

      if (detail && typeof detail === 'object' && isAppTab((detail as { tab?: unknown }).tab)) {
        const nextTab = (detail as { tab: AppTab }).tab;
        setActiveTab(nextTab);
        if (nextTab === 'settings') {
          const settingsSection = (detail as { settingsSection?: unknown }).settingsSection;
          setPendingSettingsSection(typeof settingsSection === 'string' ? settingsSection : null);
        }
      }
    };
    window.addEventListener('switch-tab', handleSwitch);
    return () => {
      window.removeEventListener('switch-tab', handleSwitch);
      window.removeEventListener('sales-updated', handleSalesUpdated);
      window.removeEventListener('inventory-updated', handleSalesUpdated);
    };
  }, [bootStatus]);

  useEffect(() => {
    const handleGoalStatus = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail !== undefined) {
        setIsCalendarGoalMet(customEvent.detail.isGoalMet);
      }
    };
    window.addEventListener('calendar-goal-status', handleGoalStatus);
    return () => window.removeEventListener('calendar-goal-status', handleGoalStatus);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'register': return <RegisterSaleSection />;
      case 'calendar': return <CalendarSection />;
      case 'catalog': return <CatalogSection />;
      case 'piggybank': return <PiggyBankSection />;
      case 'settings': return (
        <SettingsSection
          requestedSection={pendingSettingsSection}
          onRequestedSectionHandled={() => setPendingSettingsSection(null)}
        />
      );
      default: return null;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'register': return 'Registro';
      case 'calendar': return 'Calendario';
      case 'catalog': return 'Catálogo';
      case 'piggybank': return 'Ingresos';
      case 'settings': return 'Ajustes';
      default: return 'VIVO Promotor';
    }
  };

  const getTabHeaderVariant = (): 'default' | 'onDark' | 'immersive' => {
    if (activeTab === 'register') return 'immersive';
    if (activeTab === 'calendar' && isCalendarGoalMet) return 'onDark';
    return 'default';
  };

  if (bootPhase !== 'done') {
    return <BootScreen phase={bootPhase} degraded={bootStatus === 'degraded'} />;
  }

  return (
    <SectionHeaderProvider>
      <AppShellFrame
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingSettingsSection={pendingSettingsSection}
        setPendingSettingsSection={setPendingSettingsSection}
        isCalendarGoalMet={isCalendarGoalMet}
        immersiveWebMode={immersiveWebMode}
        showVersionWelcome={showVersionWelcome}
        setShowVersionWelcome={setShowVersionWelcome}
        getTabTitle={getTabTitle}
        getTabHeaderVariant={getTabHeaderVariant}
        renderContent={renderContent}
      />
    </SectionHeaderProvider>
  );
}

type AppShellFrameProps = {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  pendingSettingsSection: string | null;
  setPendingSettingsSection: (value: string | null) => void;
  isCalendarGoalMet: boolean;
  immersiveWebMode: boolean;
  showVersionWelcome: boolean;
  setShowVersionWelcome: (value: boolean) => void;
  getTabTitle: () => string;
  getTabHeaderVariant: () => 'default' | 'onDark' | 'immersive';
  renderContent: () => React.ReactNode;
};

function AppShellFrame({
  activeTab,
  setActiveTab,
  pendingSettingsSection,
  setPendingSettingsSection,
  isCalendarGoalMet,
  immersiveWebMode,
  showVersionWelcome,
  setShowVersionWelcome,
  getTabTitle,
  getTabHeaderVariant,
  renderContent,
}: AppShellFrameProps) {
  const { config: headerConfig, setConfig: setHeaderConfig } = useSectionHeader();

  useEffect(() => {
    setHeaderConfig(null);
  }, [activeTab, setHeaderConfig]);

  const headerTitle = headerConfig?.title ?? getTabTitle();
  const headerSubtitle = headerConfig?.subtitle;
  const headerVariant = headerConfig?.variant ?? getTabHeaderVariant();
  const showHeader = !immersiveWebMode && !headerConfig?.hidden;

  return (
    <div 
      className={`flex flex-col h-[100dvh] w-full overflow-hidden relative z-10 transition-all duration-700 ${
        activeTab === 'register' ? '' : 'bg-diagonal-pattern'
      }`}
    >
      <LiquidGlassFilter />

      {showHeader && (
        <SectionScreenHeader
          title={headerTitle}
          subtitle={headerSubtitle}
          variant={headerVariant}
          compact={activeTab === 'calendar' && !headerSubtitle}
          leading={headerConfig?.leading}
          trailing={headerConfig?.trailing}
        />
      )}
      
      {/* Main Content Area */}
      <main className={`flex-1 w-full h-full max-w-[var(--app-max-width)] mx-auto overflow-hidden relative`}>
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="h-full w-full relative z-0"
          >
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center opacity-50"><div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>}>
              {renderContent()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dock Area */}
      {!immersiveWebMode && (
      <div className="absolute bottom-0 left-0 w-full flex justify-center z-50 pb-[calc(var(--dock-bottom-gap)+env(safe-area-inset-bottom)+4px)] px-1.5 shrink-0 pointer-events-none pt-1" style={{ backgroundColor: 'transparent' }}>
        <div 
          className="relative flex items-center justify-center w-auto gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-2.5 rounded-[2.5rem] mx-auto max-w-full pointer-events-auto"
          style={{
            background: 'rgba(30, 32, 35, 0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
          }}
        >
          
          <DockApp 
            src="/assets/dock/calendar.png" 
            label="Registro"
            active={activeTab === 'calendar'} 
            onClick={() => handleTabChange('calendar')} 
          />
          <DockApp 
            src="/assets/dock/catalog.png" 
            label="Catálogo"
            active={activeTab === 'catalog'} 
            onClick={() => handleTabChange('catalog')} 
          />
          
          <DockApp 
             src="/assets/dock/register.png"
             label="Cámara"
             active={activeTab === 'register'}
             onClick={() => handleTabChange('register')}
          />

          <DockApp 
            src="/assets/dock/piggybank.png" 
            label="Historial"
            active={activeTab === 'piggybank'} 
            onClick={() => handleTabChange('piggybank')} 
          />
          <DockApp 
            src="/assets/dock/settings.png" 
            label="Ajustes"
            active={activeTab === 'settings'} 
            onClick={() => handleTabChange('settings')} 
          />
          
        </div>
      </div>
      )}

      <AnimatePresence>
        {showVersionWelcome && (
          <VersionWelcomeOverlay
            onDismiss={() => {
              markReleaseNotesSeen();
              setShowVersionWelcome(false);
            }}
            onViewHistory={() => {
              markReleaseNotesSeen();
              setShowVersionWelcome(false);
              handleTabChange('settings');
              setPendingSettingsSection('sistema');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DockApp({ src, icon, label, active, onClick }: { src?: string, icon?: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <motion.button 
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.05 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 450, damping: 16 }}
      className="relative group flex items-center justify-center cursor-pointer outline-none touch-manipulation"
    >
      <div className="w-[3rem] h-[3rem] sm:w-[3.4rem] sm:h-[3.4rem] flex items-center justify-center relative">
        
        {/* Subtle glass plate for active */}
        {active && (
          <motion.div 
            layoutId="dockActiveBg"
            className="absolute inset-[4px] rounded-full pointer-events-none z-0"
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            style={{ 
              background: 'rgba(255,255,255,0.12)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' 
            }}
          />
        )}

        {active && (
           <motion.div 
             layoutId="dockIndicator"
             className="absolute -bottom-1.5 sm:-bottom-2 w-1 h-1 rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
             transition={{ type: "spring", stiffness: 400, damping: 20 }}
           />
        )}

        <div className="w-full h-full relative z-10 flex items-center justify-center">
           {src ? (
             <motion.img 
               src={src} 
               alt={label}
               animate={{
                 opacity: active ? 1 : 0.6,
                 scale: active ? 1 : 0.85,
                 y: active ? -2 : 0,
                 filter: active ? 'brightness(1.1)' : 'brightness(0.9)',
               }}
               transition={{ type: "spring", stiffness: 300, damping: 18 }}
               className="w-[85%] h-[85%] sm:w-[90%] sm:h-[90%] object-cover rounded-[1rem] sm:rounded-2xl pointer-events-none drop-shadow-md" 
             />
           ) : icon ? (
             <motion.div 
               animate={{
                 opacity: active ? 1 : 0.8,
                 scale: active ? 1 : 0.9,
                 y: active ? -2 : 0
               }}
               transition={{ type: "spring", stiffness: 300, damping: 18 }}
             >
               {icon}
             </motion.div>
           ) : null}
        </div>
      </div>
    </motion.button>
  );
}
