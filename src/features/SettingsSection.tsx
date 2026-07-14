import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Database, DownloadCloud, UploadCloud, Trash2, Smartphone, PiggyBank, Settings, User, MapPin, Clock, Save, CheckCircle2, Calendar, ChevronDown, AlertTriangle, ChevronLeft, ChevronRight, History, Package, Scale, Globe, Sparkles, Cpu } from 'lucide-react';
import { getAppSettings, saveAppSettings, getUserProfile, saveUserProfile, getSales, getDevices, getInventoryMovements, getChallenges, resetAllData, getPhoneModels } from '../lib/storage';
import { exportBackup, importBackup } from '../lib/backup';
import DeviceManager from './settings/DeviceManager';
import WorkScheduleConfig from './settings/WorkScheduleConfig';
import VisualPreferencesConfig from './settings/VisualPreferencesConfig';
import DemoModeConfigPanel from './settings/DemoModeConfigPanel';
import AdvancedGoalsConfig from './settings/AdvancedGoalsConfig';
import AccordionSection from './settings/AccordionSection';
import DataHealth from './settings/DataHealth';
import { SalesHistorySettingsPanel } from './settings/SalesHistorySettingsPanel';
import { InventorySheet } from './catalog/InventorySheet';
import LegalCompliancePanel from './settings/LegalCompliancePanel';
import WebCacheSettingsPanel from './settings/WebCacheSettingsPanel';
import ReleaseNotesPanel from './settings/ReleaseNotesPanel';
import { toLocalDateKey } from '../lib/date';
import { compareSalesByRecordedAt, formatSaleTimeLabel, resolveSaleTimestamps } from '../lib/saleTimestamps';
import { getSalePoints } from '../lib/points';
import { APP_VERSION, hasUnseenReleaseNotes } from '../lib/releaseNotes';
import { applyVisualTheme } from '../lib/theme';
import { activateDemoMode, deactivateDemoMode, regenerateDemoExperience } from '../lib/demoMode';
import { resolveDemoModeConfig } from '../lib/demoModeConfig';
import { useSectionHeader } from '../components/ui/SectionHeaderContext';
import { SectionHeaderBackButton } from '../components/ui/SectionHeaderBackButton';

type SettingsView = 'home' | 'usuario' | 'productos' | 'inventario' | 'apariencia' | 'webs' | 'sistema' | 'historial';

const SETTINGS_CARDS = [
  { id: 'usuario', label: 'Usuario', description: 'Perfil, metas, horario, respaldos y salud de datos.', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'productos', label: 'Productos y modelos', description: 'Modelos, variantes, stock, imágenes y enlaces.', icon: Smartphone, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'inventario', label: 'Inventario', description: 'Stock, ajustes y registros de inventario.', icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'apariencia', label: 'Apariencia y rendimiento', description: 'Modo oscuro, animaciones y modo visual premium.', icon: Settings, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'webs', label: 'Webs oficiales', description: 'Copias locales descargadas y sincronización en WiFi.', icon: Globe, color: 'text-sky-500', bg: 'bg-sky-50' },
  { id: 'sistema', label: 'Sistema', description: 'Novedades, legal, privacidad y zona de riesgo.', icon: Cpu, color: 'text-slate-600', bg: 'bg-slate-100' },
  { id: 'historial', label: 'Historial de ventas', description: 'Consulta ventas registradas, movimientos y registros.', icon: History, color: 'text-sky-500', bg: 'bg-sky-50' },
] as const;

const isSettingsView = (value: unknown): value is SettingsView => {
  return typeof value === 'string' && SETTINGS_CARDS.some((card) => card.id === value);
};

const resolveSettingsView = (value: unknown): SettingsView | null => {
  if (value === 'perfil' || value === 'operacion' || value === 'datos') return 'usuario';
  if (value === 'novedades' || value === 'legal' || value === 'riesgo') return 'sistema';
  return isSettingsView(value) ? value : null;
};

interface SettingsSectionProps {
  requestedSection?: string | null;
  onRequestedSectionHandled?: () => void;
}

export default function SettingsSection({ requestedSection, onRequestedSectionHandled }: SettingsSectionProps = {}) {
  const [activeTab, setActiveTab] = useState<SettingsView>('home');
  const [formData, setFormData] = useState<any>({
    name: '',
    location: '',
    schedule: '',
    dailyGoal: 3,
    monthlyGoal: 30,
    commissionGoal: 5000,
    useDemoDate: false,
    demoModeConfig: resolveDemoModeConfig(),
    workSchedule: undefined,
    visualPreferences: undefined
  });

  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [hasNewReleasePrompt, setHasNewReleasePrompt] = useState(hasUnseenReleaseNotes);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleReleaseNotesSeen = () => setHasNewReleasePrompt(false);
    window.addEventListener('release-notes-seen', handleReleaseNotesSeen);
    return () => window.removeEventListener('release-notes-seen', handleReleaseNotesSeen);
  }, []);

  useEffect(() => {
    if (activeTab === 'sistema') {
      setHasNewReleasePrompt(false);
    }
  }, [activeTab]);

  const { setConfig: setHeaderConfig } = useSectionHeader();

  useEffect(() => {
    if (activeTab === 'home') {
      setHeaderConfig(null);
      return;
    }

    const activeCard = SETTINGS_CARDS.find((card) => card.id === activeTab);
    if (!activeCard) {
      setHeaderConfig(null);
      return;
    }

    setHeaderConfig({
      title: activeCard.label,
      subtitle: activeCard.description,
      leading: <SectionHeaderBackButton onClick={() => setActiveTab('home')} />,
    });

    return () => setHeaderConfig(null);
  }, [activeTab, setHeaderConfig]);

  useEffect(() => {
    const profile = getUserProfile();
    const settings = getAppSettings();
    setFormData({
      name: profile.name,
      location: profile.location,
      schedule: profile.schedule,
      dailyGoal: settings.dailyGoal,
      monthlyGoal: settings.monthlyGoal,
      commissionGoal: settings.commissionGoal,
      useDemoDate: settings.useDemoDate,
      demoModeConfig: resolveDemoModeConfig(settings.demoModeConfig),
      workSchedule: settings.workSchedule,
      visualPreferences: settings.visualPreferences
    });
  }, []);

  useEffect(() => {
    const handleOpenSection = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const nextView = resolveSettingsView(detail);
      if (nextView) {
        setActiveTab(nextView);
      }
    };

    window.addEventListener('open-settings-section', handleOpenSection);
    return () => window.removeEventListener('open-settings-section', handleOpenSection);
  }, []);

  useEffect(() => {
    if (!requestedSection) return;
    const nextView = resolveSettingsView(requestedSection);
    if (nextView) {
      setActiveTab(nextView);
    }
    onRequestedSectionHandled?.();
  }, [requestedSection, onRequestedSectionHandled]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const prevSettings = getAppSettings();
    const enablingDemo = formData.useDemoDate && !prevSettings.useDemoDate;
    const disablingDemo = !formData.useDemoDate && prevSettings.useDemoDate;

    if (disablingDemo) {
      deactivateDemoMode();
      triggerNotification('Modo demo desactivado. Se restauraron tus datos previos.');
      if (prevSettings.useDemoDate !== formData.useDemoDate) {
        setTimeout(() => window.location.reload(), 1000);
      }
      return;
    }

    saveAppSettings({
      ...prevSettings,
      useDemoDate: formData.useDemoDate,
      demoModeConfig: resolveDemoModeConfig(formData.demoModeConfig),
      dailyGoal: Number(formData.dailyGoal),
      monthlyGoal: Number(formData.monthlyGoal),
      commissionGoal: Number(formData.commissionGoal),
      workSchedule: formData.workSchedule,
      visualPreferences: formData.visualPreferences,
      minStockGoal: Number(formData.minStockGoal),
      positioningGoals: formData.positioningGoals
    });

    if (!enablingDemo) {
      saveUserProfile(formData.name, formData.location, formData.schedule);
    }

    applyVisualTheme({
      ...prevSettings,
      useDemoDate: formData.useDemoDate,
      demoModeConfig: resolveDemoModeConfig(formData.demoModeConfig),
      dailyGoal: Number(formData.dailyGoal),
      monthlyGoal: Number(formData.monthlyGoal),
      commissionGoal: Number(formData.commissionGoal),
      workSchedule: formData.workSchedule,
      visualPreferences: formData.visualPreferences,
      minStockGoal: Number(formData.minStockGoal),
      positioningGoals: formData.positioningGoals,
    });

    if (enablingDemo) {
      activateDemoMode();
      triggerNotification('Modo demo activado con historial de ventas y catálogo de muestra.');
      setTimeout(() => window.location.reload(), 1000);
      return;
    }

    triggerNotification("Configuración guardada");
    
    if (formData.useDemoDate !== prevSettings.useDemoDate) {
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleRegenerateDemo = () => {
    const prevSettings = getAppSettings();
    saveAppSettings({
      ...prevSettings,
      useDemoDate: true,
      demoModeConfig: resolveDemoModeConfig(formData.demoModeConfig),
    });
    regenerateDemoExperience();
    triggerNotification('Escenario demo regenerado con la configuración actual.');
    setTimeout(() => window.location.reload(), 1000);
  };

  const clearData = () => {
    if(confirm('¿Estás seguro de que quieres borrar TODAS las ventas e inventario? Esta acción NO se puede deshacer.')) {
      if(confirm('ÚLTIMA ADVERTENCIA: ¿Borrar todo? Te recomendamos exportar un backup antes.')) {
        resetAllData({ keepCommercialCatalog: false });
        triggerNotification("Datos borrados correctamente. Refresca la página.");
      }
    }
  };

  const handleImportClick = () => {
    if (confirm('Importar un respaldo sobrescribirá los datos actuales. ¿Deseas continuar?')) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importBackup(file, () => {
         const profile = getUserProfile();
         const settings = getAppSettings();
          setFormData({
            name: profile.name,
            location: profile.location,
            schedule: profile.schedule,
            dailyGoal: settings.dailyGoal,
            monthlyGoal: settings.monthlyGoal,
            commissionGoal: settings.commissionGoal,
            useDemoDate: settings.useDemoDate,
            workSchedule: settings.workSchedule,
            visualPreferences: settings.visualPreferences,
            minStockGoal: settings.minStockGoal,
            positioningGoals: settings.positioningGoals
          });
         e.target.value = '';
         triggerNotification("Datos importados con éxito");
      });
    }
  };
  
  const exportCSV = () => {
    try {
      const sales = getSales();
      const devices = getDevices();
      const phoneModels = getPhoneModels();
      const movements = getInventoryMovements();
      
      const escapeCsvValue = (val: any): string => {
        if (val === null || val === undefined) return "";
        const str = String(val);
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      let csv = "--- VENTAS ---\n";
      csv += "Fecha,Hora,Registro_ISO,Modelo,Color,Cantidad,Comision_Unitaria,Comision_Total,Puntos,Comision_Personalizada,Stock_Snapshot\n";
      [...sales]
        .sort((a, b) => compareSalesByRecordedAt(a, b))
        .forEach((s) => {
          const timestamps = resolveSaleTimestamps(s);
          csv += `${escapeCsvValue(timestamps.date)},${escapeCsvValue(timestamps.recordedTime)},${escapeCsvValue(timestamps.recordedAtIso)},${escapeCsvValue(s.deviceNameSnapshot)},${escapeCsvValue(s.deviceColorSnapshot || s.deviceColor || '')},${s.quantity},${s.commissionPerUnit},${s.amountEarned},${getSalePoints(s)},${s.isCustomCommission ? 'Si' : 'No'},${s.baseCommissionSnapshot || ''}\n`;
        });
      
      csv += "\n--- INVENTARIO ACTUAL ---\n";
      csv += "Modelo,Variante,Stock,Min_Stock,Comision,Activa,Imagen,Catalogo,Calendario\n";
      phoneModels.forEach(model => {
        model.variants.forEach(variant => {
          csv += `${escapeCsvValue(model.name)},${escapeCsvValue(variant.colorName)},${variant.stock},${variant.minStock},${variant.commission},${variant.isActive ? 'Si' : 'No'},${escapeCsvValue(variant.imagePath)},${escapeCsvValue(variant.catalogImagePath)},${escapeCsvValue(variant.calendarImagePath)}\n`;
        });
      });
      
      csv += "\n--- CATÁLOGO COMERCIAL ---\n";
      csv += "Modelo,Posicionamiento,Cliente_Ideal,Argumento_Principal,Puntos_Fuertes,Frase_Cierre,Notas_Competencia\n";
      devices.forEach(d => {
        if (d.commercialProfile) {
          const cp = d.commercialProfile;
          const strengths = cp.keyStrengths ? cp.keyStrengths.join('; ') : '';
          csv += `${escapeCsvValue(d.name)},${escapeCsvValue(cp.positioning)},${escapeCsvValue(cp.idealCustomer)},${escapeCsvValue(cp.mainPitch)},${escapeCsvValue(strengths)},${escapeCsvValue(cp.closingPhrase)},${escapeCsvValue(cp.competitorNotes)}\n`;
        }
      });
      
      csv += "\n--- MOVIMIENTOS DE INVENTARIO ---\n";
      csv += "Fecha,Modelo,Variante,Tipo,Cambio,Stock_Anterior,Stock_Nuevo,Motivo,Venta_Relacionada,Fecha_Venta\n";
      movements.forEach(m => {
        const d = toLocalDateKey(new Date(m.createdAt));
        csv += `${d},${escapeCsvValue(m.deviceNameSnapshot)},${escapeCsvValue(m.variantColorSnapshot || '')},${escapeCsvValue(m.type)},${m.quantityChange},${m.previousStock},${m.newStock},${escapeCsvValue(m.reason)},${escapeCsvValue(m.relatedSaleId)},${escapeCsvValue(m.saleDateSnapshot || '')}\n`;
      });
      
      const challenges = getChallenges();
      csv += "\n--- RETOS COMERCIALES ---\n";
      csv += "Fecha,Titulo,Tipo,Estado,Progreso,Objetivo,Modelo_Relacionado,Prioridad,Completado_En\n";
      challenges.forEach(c => {
        const d = toLocalDateKey(new Date(c.createdAt));
        const completedDate = c.completedAt ? toLocalDateKey(new Date(c.completedAt)) : '';
        csv += `${d},${escapeCsvValue(c.title)},${escapeCsvValue(c.type)},${escapeCsvValue(c.status)},${c.currentValue},${c.targetValue},${escapeCsvValue(c.relatedDeviceName || '')},${c.priority},${completedDate}\n`;
      });
      
      navigator.clipboard.writeText(csv).then(() => {
        triggerNotification("CSV copiado al portapapeles");
      }).catch(() => {
        triggerNotification("No se pudo copiar el CSV");
      });
    } catch (e) {
      triggerNotification("Error al exportar CSV");
    }
  };

  const triggerNotification = (text: string) => {
    setNotificationText(text);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="settings-shell-bg flex flex-col h-full w-full relative font-sans overflow-hidden text-[var(--neo-text)]">
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="absolute top-[calc(env(safe-area-inset-top)+10px)] left-1/2 bg-gray-900/90 backdrop-blur-sm text-white px-5 py-3 rounded-full text-[0.80rem] font-medium flex items-center gap-2 z-50 shadow-lg whitespace-nowrap"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {notificationText}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 no-scrollbar relative z-10 pt-1">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* TAB: HOME */}
            {activeTab === 'home' && (
              <div className="flex flex-col gap-5 pb-6">
                {hasNewReleasePrompt && (
                  <button
                    onClick={() => setActiveTab('sistema')}
                    className="w-full rounded-[1.4rem] p-4 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all text-left dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-[var(--neo-surface)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="bg-emerald-100 p-2.5 rounded-xl shrink-0">
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-emerald-600">
                            Nueva actualización
                          </p>
                          <h3 className="text-[0.95rem] font-black text-slate-800 dark:text-slate-100 leading-tight mt-1">
                            Novedades de la versión {APP_VERSION}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                            Toca aquí para leer qué mejoró en esta versión antes de seguir vendiendo.
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                    </div>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {SETTINGS_CARDS.filter(c => !(c.id === 'sistema' && hasNewReleasePrompt)).map(card => {
                    const Icon = card.icon;
                    let summary = '';
                    let compactTitle: string = card.label;
                    if (card.id === 'usuario') {
                      summary = formData.name
                        ? `${formData.name} · ${getSales().length} ventas`
                        : `${getSales().length} ventas · Meta $${formData.commissionGoal}`;
                      compactTitle = 'Usuario';
                    }
                    if (card.id === 'productos') {
                      const models = getPhoneModels();
                      const variantsCount = models.reduce((sum, m) => sum + m.variants.length, 0);
                      summary = `${models.length} mod · ${variantsCount} var`;
                      compactTitle = 'Productos';
                    }
                    if (card.id === 'inventario') {
                      const models = getPhoneModels();
                      let stock = 0;
                      models.forEach(m => m.variants.forEach(v => { stock += v.stock; }));
                      summary = `${stock} unidades`;
                      compactTitle = 'Inventario';
                    }
                    if (card.id === 'sistema') {
                      summary = hasNewReleasePrompt ? `Nueva v${APP_VERSION}` : `Versión ${APP_VERSION}`;
                      compactTitle = 'Sistema';
                    }
                    if (card.id === 'apariencia') {
                      const visualPrefs = formData.visualPreferences || {};
                      summary = visualPrefs.reducedMotion
                        ? 'Animación reducida'
                        : (visualPrefs.premiumVisualMode === false ? 'Visual estándar' : 'Visual premium');
                      compactTitle = 'Apariencia';
                    }
                    if (card.id === 'historial') { summary = `${getSales().length} registros`; compactTitle = 'Historial'; }
                    if (card.id === 'webs') { summary = 'Sync WiFi diaria'; compactTitle = 'Webs'; }

                    return (
                      <button
                        key={card.id}
                        onClick={() => setActiveTab(card.id)}
                        className="w-full vivo-surface-on-pattern rounded-2xl p-3.5 flex flex-col items-start gap-2 active:scale-[0.98] transition-all text-left group relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start w-full">
                          <div className={`${card.bg} p-2 rounded-xl transition-colors group-hover:scale-105`}>
                            <Icon className={`w-5 h-5 ${card.color}`} />
                          </div>
                          <ChevronRight className="w-4 h-4 text-[var(--neo-muted)] group-hover:text-[var(--neo-text)] transition-colors" />
                        </div>
                        <div className="flex-1 w-full mt-0.5">
                          <h3 className="text-[0.85rem] font-black text-[var(--neo-text)] leading-tight truncate">{compactTitle}</h3>
                          {summary && (
                            <p className="text-[0.6rem] font-bold text-[var(--neo-muted)] uppercase tracking-widest mt-0.5 truncate">
                              {summary}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: USUARIO */}
            {activeTab === 'usuario' && (
              <>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

                <AccordionSection
                  title="Información del Usuario"
                  icon={<User className="w-5 h-5 text-blue-500" />}
                  defaultOpen={true}
                >
                  <div className="vivo-panel rounded-xl p-1.5 shadow-sm">
                    <div className="flex items-center gap-3 p-3 border-b border-gray-50 dark:border-white/8">
                      <div className="bg-blue-50 p-2.5 rounded-[1.25rem]">
                        <User className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Nombre Completo</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="w-full bg-transparent vivo-input font-black outline-none text-sm"
                          placeholder="Ej. María García"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border-b border-gray-50 dark:border-white/8">
                      <div className="bg-orange-50 p-2.5 rounded-[1.25rem]">
                        <MapPin className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Sede de Trabajo</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                          className="w-full bg-transparent vivo-input font-black outline-none text-sm"
                          placeholder="Ej. Sucursal Norte"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3">
                      <div className="bg-purple-50 p-2.5 rounded-[1.25rem]">
                        <Clock className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[0.60rem] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Horario Habitual</label>
                        <input
                          type="text"
                          value={formData.schedule}
                          onChange={(e) => handleChange('schedule', e.target.value)}
                          className="w-full bg-transparent vivo-input font-black outline-none text-sm"
                          placeholder="Ej. 11:00 AM - 08:00 PM"
                        />
                      </div>
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection
                  title="Calendario Laboral"
                  icon={<Calendar className="w-5 h-5 text-orange-500" />}
                  defaultOpen={true}
                >
                  <WorkScheduleConfig settings={formData} onChange={handleChange} />
                </AccordionSection>

                <AccordionSection
                  title="Metas Operativas"
                  icon={<Target className="w-5 h-5 text-emerald-500" />}
                >
                  <AdvancedGoalsConfig settings={formData} onChange={handleChange} />
                </AccordionSection>

                <AccordionSection
                  title="Salud de datos"
                  icon={<Database className="w-5 h-5 text-rose-500" />}
                  defaultOpen={false}
                >
                  <DataHealth />
                </AccordionSection>

                <AccordionSection
                  title="Respaldos y exportación"
                  icon={<DownloadCloud className="w-5 h-5 text-indigo-500" />}
                  defaultOpen={false}
                >
                  <div className="vivo-panel mb-4 rounded-[2rem] p-4 shadow-sm">
                    <h3 className="mb-3 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
                      <Database size={14} className="text-gray-400 dark:text-slate-500" />
                      Estado de los datos
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="vivo-subtle rounded-xl p-3">
                        <span className="block text-[0.55rem] uppercase text-gray-400 dark:text-slate-500">Ventas</span>
                        <span className="text-sm font-black text-gray-800 dark:text-slate-100">{getSales().length} regs</span>
                      </div>
                      <div className="vivo-subtle rounded-xl p-3">
                        <span className="block text-[0.55rem] uppercase text-gray-400 dark:text-slate-500">Movimientos</span>
                        <span className="text-sm font-black text-gray-800 dark:text-slate-100">{getInventoryMovements().length} regs</span>
                      </div>
                      <div className="vivo-subtle rounded-xl p-3">
                        <span className="block text-[0.55rem] uppercase text-gray-400 dark:text-slate-500">Dispositivos</span>
                        <span className="text-sm font-black text-gray-800 dark:text-slate-100">{getPhoneModels().filter(m => m.isActive).length} mod</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4 dark:border-white/10">
                      <button
                        onClick={exportCSV}
                        className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[1.5rem] vivo-inset-on-pattern py-3 shadow-sm transition-all hover:border-emerald-100 active:scale-95"
                      >
                        <DownloadCloud className="h-5 w-5 text-emerald-400" />
                        <span className="mt-1 text-[0.55rem] font-black uppercase tracking-widest text-gray-600 dark:text-slate-300">Exportar CSV</span>
                      </button>
                      <button
                        onClick={() => exportBackup()}
                        className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[1.5rem] vivo-inset-on-pattern py-3 shadow-sm transition-all hover:border-indigo-100 active:scale-95"
                      >
                        <DownloadCloud className="h-5 w-5 text-indigo-400" />
                        <span className="mt-1 text-[0.55rem] font-black uppercase tracking-widest text-gray-600 dark:text-slate-300">Backup JSON</span>
                      </button>
                      <button
                        onClick={handleImportClick}
                        className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[1.5rem] vivo-inset-on-pattern py-3 shadow-sm transition-all hover:border-teal-100 active:scale-95"
                      >
                        <UploadCloud className="h-5 w-5 text-teal-400" />
                        <span className="mt-1 text-[0.55rem] font-black uppercase tracking-widest text-gray-600 dark:text-slate-300">Restaurar</span>
                      </button>
                    </div>
                  </div>
                </AccordionSection>
              </>
            )}

            {/* TAB: PRODUCTOS */}
            {activeTab === 'productos' && (
              <div className="flex flex-col gap-4">
                <DeviceManager onNotify={triggerNotification} />
              </div>
            )}

            {/* TAB: APARIENCIA */}
            {activeTab === 'apariencia' && (
              <>
                <AccordionSection
                  title="Apariencia y Rendimiento"
                  icon={<Settings className="w-5 h-5 text-purple-500" />}
                  defaultOpen={true}
                >
                  <VisualPreferencesConfig settings={formData} onChange={handleChange} />
                </AccordionSection>

                <AccordionSection
                  title="Entorno (Demo)"
                  icon={<Clock className="w-5 h-5 text-purple-500" />}
                  defaultOpen={true}
                >
                  <DemoModeConfigPanel
                    settings={{
                      useDemoDate: formData.useDemoDate,
                      demoModeConfig: formData.demoModeConfig,
                    }}
                    onChange={handleChange}
                    onRegenerate={handleRegenerateDemo}
                  />
                </AccordionSection>
              </>
            )}

            {/* TAB: SISTEMA */}
            {activeTab === 'sistema' && (
              <>
                <AccordionSection
                  title="Novedades de la versión"
                  icon={<Sparkles className="w-5 h-5 text-emerald-600" />}
                  defaultOpen={true}
                >
                  <ReleaseNotesPanel />
                </AccordionSection>

                <AccordionSection
                  title="Legal, privacidad y titularidad"
                  icon={<Scale className="w-5 h-5 text-slate-600" />}
                  defaultOpen={false}
                >
                  <LegalCompliancePanel />
                </AccordionSection>

                <AccordionSection
                  title="Zona de riesgo"
                  icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
                  defaultOpen={false}
                >
                  <div className="rounded-[2rem] border border-red-100 bg-red-50/50 p-4 shadow-sm dark:border-red-500/20 dark:bg-red-500/5">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="shrink-0 rounded-full bg-red-100 p-2 text-red-500 dark:bg-red-500/15">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-red-700 dark:text-red-300">Acciones destructivas</h4>
                        <p className="mt-1 text-[0.65rem] font-medium leading-snug text-red-600/80 dark:text-red-300/80">
                          Las acciones en esta zona no se pueden deshacer. Te recomendamos hacer un backup JSON antes de proceder.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={clearData}
                      className="group flex w-full items-center justify-center gap-2 rounded-[1.5rem] border border-red-200/80 vivo-inset-on-pattern p-4 shadow-sm transition-all hover:bg-red-50/50 active:scale-95 dark:border-red-500/25 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-5 w-5 text-red-500 group-hover:text-red-600" />
                      <span className="text-[0.65rem] font-black uppercase tracking-widest text-red-600 dark:text-red-300">
                        Borrar todo el historial
                      </span>
                    </button>
                  </div>
                </AccordionSection>
              </>
            )}

            {/* TAB: WEBS OFICIALES */}
            {activeTab === 'webs' && (
              <WebCacheSettingsPanel />
            )}

            {/* TAB: INVENTARIO */}
            {activeTab === 'inventario' && (
              <InventorySheet models={getPhoneModels().filter(model => model.isActive)} onClose={() => setActiveTab('home')} />
            )}

            {/* TAB: HISTORIAL */}
            {activeTab === 'historial' && (
              <SalesHistorySettingsPanel />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Botón de Guardado Condicional (Usuario, Apariencia) */}
        <AnimatePresence>
          {(activeTab === 'usuario' || activeTab === 'apariencia') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 mb-6"
            >
              <button 
                onClick={handleSave}
                className="w-full bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-black uppercase tracking-widest text-xs py-4 px-6 rounded-[1.25rem] transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="flex flex-col pt-8 pb-6 items-center justify-center opacity-40">
           <div className="w-8 h-8 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center text-gray-500 dark:text-slate-400 mb-2 grayscale">
             <Settings size={14} />
           </div>
           <p className="text-[0.60rem] text-gray-500 dark:text-slate-500 font-bold leading-relaxed text-center max-w-[200px] uppercase tracking-widest">
             VIVO Promotor <br/>
             Ajustes
           </p>
        </div>

        {/* Spacer for bottom dock */}
        <div className="w-full h-[calc(env(safe-area-inset-bottom)+120px)] shrink-0 pointer-events-none" />
      </div>
    </div>
  );
}
