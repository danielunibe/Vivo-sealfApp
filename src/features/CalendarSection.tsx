import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { SaleRecord, PhoneModel } from '../types';
import { getSales, saveSaleWithInventory, replaceSaleWithInventory, getDailyGoal, deleteSale, getChallenges, getAppSettings, buildSaleRecord, canRegisterSaleStock } from '../lib/storage';
import { getAppToday, toLocalDateKey, parseLocalDateKey, getEarliestSelectableDateKey, getFirstSaleDateKey } from '../lib/date';
import { getNowForSaleRecording, buildSaleRecordedAtForDate, normalizeSaleRecordTimestamps, getSaleDayKey } from '../lib/saleTimestamps';
import { getPhoneModelCalendarImage } from '../lib/deviceImages';
import {
  findModelIndexByDeviceId,
  getModelVariantColors,
  getVariantCommission,
  loadManualSaleModels,
  resolveManualSaleVariant,
} from '../lib/saleCatalog';
import { emitSaleConfirmed, emitSalesUpdated, onSalesUpdated, onSettingsUpdated, onChallengesUpdated, onInventoryUpdated, onAppDayChanged } from '../lib/events';
import { toast } from '../lib/toast';
import { useSectionHeader } from '../components/ui/SectionHeaderContext';
import { SectionHeaderBackButton } from '../components/ui/SectionHeaderBackButton';

import { getHexForColorName } from './calendar/calendarUtils';
import { buildPeriodGoalProgress, buildDayGoalUnits, derivePeriodGoals } from '../lib/goalBreakdown';
import { buildCalendarMonthDays } from './calendar/buildCalendarMonthDays';
import { CalendarFormMode } from './calendar/CalendarFormMode';
import { CalendarAgendaMode } from './calendar/CalendarAgendaMode';
import { CalendarGridView } from './calendar/CalendarGridView';
import { CalendarYearOverview } from './calendar/CalendarYearOverview';

const shiftDateKey = (dateKey: string, deltaDays: number) => {
  const date = parseLocalDateKey(dateKey);
  date.setDate(date.getDate() + deltaDays);
  return toLocalDateKey(date);
};

const STORAGE_SAVE_ERROR = 'No se pudo guardar en el dispositivo. Libera espacio o exporta un respaldo desde Ajustes.';

export default function CalendarSection() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [models, setModels] = useState<PhoneModel[]>(loadManualSaleModels());
  const [goal, setGoal] = useState<number>(3);
  const [challenges, setChallenges] = useState(getChallenges());
  const [showLegend, setShowLegend] = useState(false);
  const [showAgendaMode, setShowAgendaMode] = useState(false);
  const [showYearOverview, setShowYearOverview] = useState(false);
  const [selectedFilterIso, setSelectedFilterIso] = useState<string | null>(null);
  const [focusedDayIso, setFocusedDayIso] = useState(getAppToday());

  // States for adding or editing manual/out-of-date sales
  const [isFormMode, setIsFormMode] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedDate, setSelectedDate] = useState(getAppToday());

  // Month navigation states
  const [currentDateObj, setCurrentDateObj] = useState(new Date(`${getAppToday()}T12:00:00`));
  const [settingsVersion, setSettingsVersion] = useState(0);
  const [todayVersion, setTodayVersion] = useState(0);

  useEffect(() => {
    setSales(getSales());
    setGoal(getDailyGoal());
    setChallenges(getChallenges());
    
    const unsubscribeSales = onSalesUpdated(() => {
      setSales(getSales());
      setGoal(getDailyGoal());
    });

    const unsubscribeSettings = onSettingsUpdated(() => {
      setGoal(getDailyGoal());
      setSettingsVersion((version) => version + 1);
    });

    const unsubscribeChallenges = onChallengesUpdated(() => {
      setChallenges(getChallenges());
    });

    const unsubscribeInventory = onInventoryUpdated(() => {
      setModels(loadManualSaleModels());
    });

    const unsubscribeDayChange = onAppDayChanged(({ today, previous }) => {
      setTodayVersion((version) => version + 1);
      setFocusedDayIso((current) => (current === previous ? today : current));
      setSelectedDate((current) => (current === previous ? today : current));
      const nextDate = parseLocalDateKey(today);
      setCurrentDateObj(new Date(nextDate.getFullYear(), nextDate.getMonth(), 12, 12));
      setGoal(getDailyGoal());
      setChallenges(getChallenges());
    });

    const handleToggleAgenda = () => {
      setShowAgendaMode(prev => {
        const nextState = !prev;
        if (!nextState) {
          setSelectedFilterIso(null);
        }
        return nextState;
      });
    };

    window.addEventListener('toggle-calendar-agenda', handleToggleAgenda);
    return () => {
      window.removeEventListener('toggle-calendar-agenda', handleToggleAgenda);
      unsubscribeSales();
      unsubscribeSettings();
      unsubscribeInventory();
      unsubscribeChallenges();
      unsubscribeDayChange();
    };
  }, []);

  const currentMonth = currentDateObj.getMonth();
  const currentYear = currentDateObj.getFullYear();
  
  // Día operativo actual del dispositivo (sincronizado con reloj local/red).
  const appTodayStr = React.useMemo(() => getAppToday(), [todayVersion, settingsVersion]);
  const todaySimulated = new Date(`${appTodayStr}T12:00:00`);

  const earliestIso = React.useMemo(
    () => getEarliestSelectableDateKey(sales, appTodayStr),
    [sales, appTodayStr],
  );
  const firstSaleIso = React.useMemo(() => getFirstSaleDateKey(sales), [sales]);
  const earliestDate = parseLocalDateKey(earliestIso);

  const hasPrevMonth = currentYear > earliestDate.getFullYear() || (currentYear === earliestDate.getFullYear() && currentMonth > earliestDate.getMonth());
  const hasNextMonth = currentYear < todaySimulated.getFullYear() || (currentYear === todaySimulated.getFullYear() && currentMonth < todaySimulated.getMonth());

  const handlePrevMonth = () => {
    if (!hasPrevMonth) return;
    const nextMonth = currentMonth - 1;
    const nextYear = currentYear;
    setCurrentDateObj(new Date(nextYear, nextMonth, 12, 12));
    const lastDay = new Date(nextYear, nextMonth + 1, 0).getDate();
    const prevMonthPart = String(nextMonth + 1).padStart(2, '0');
    const candidate = `${nextYear}-${prevMonthPart}-${String(lastDay).padStart(2, '0')}`;
    setFocusedDayIso(candidate < earliestIso ? earliestIso : candidate);
  };
  const handleNextMonth = () => {
    if (!hasNextMonth) return;
    const nextMonth = currentMonth + 1;
    const nextYear = currentYear;
    setCurrentDateObj(new Date(nextYear, nextMonth, 12, 12));
    if (nextYear === todaySimulated.getFullYear() && nextMonth === todaySimulated.getMonth()) {
      setFocusedDayIso(appTodayStr);
    } else {
      const nextMonthPart = String(nextMonth + 1).padStart(2, '0');
      setFocusedDayIso(`${nextYear}-${nextMonthPart}-01`);
    }
  };

  const canPrevDay = focusedDayIso > earliestIso;
  const canNextDay = focusedDayIso < appTodayStr;

  const handlePrevDay = () => {
    if (!canPrevDay) return;
    const nextIso = shiftDateKey(focusedDayIso, -1);
    setFocusedDayIso(nextIso);
    const nextDate = parseLocalDateKey(nextIso);
    setCurrentDateObj(new Date(nextDate.getFullYear(), nextDate.getMonth(), 12, 12));
  };

  const handleNextDay = () => {
    if (!canNextDay) return;
    const nextIso = shiftDateKey(focusedDayIso, 1);
    setFocusedDayIso(nextIso);
    const nextDate = parseLocalDateKey(nextIso);
    setCurrentDateObj(new Date(nextDate.getFullYear(), nextDate.getMonth(), 12, 12));
  };

  const handleSelectCalendarDay = (dateIso: string) => {
    if (!dateIso || dateIso < earliestIso || dateIso > appTodayStr) return;
    setFocusedDayIso(dateIso);
    setSelectedFilterIso(dateIso);
  };

  const handleSaveOrUpdateSale = () => {
    const selectedModel = models[selectedDeviceIndex];
    if (!selectedModel) return;

    if (!selectedColor) {
      toast('Por favor selecciona un color', 'error');
      return;
    }

    if (selectedDate < earliestIso || selectedDate > appTodayStr) {
      toast('La fecha debe estar entre el límite de historial y hoy', 'error');
      return;
    }

    const selectedVariant = resolveManualSaleVariant(selectedModel, selectedColor);
    if (!selectedVariant) {
      toast('Selecciona una variante válida', 'error');
      return;
    }

    const isNewSale = !editingSaleId;
    const qty = editingSaleId
      ? (getSales().find((sale) => sale.id === editingSaleId)?.quantity || 1)
      : 1;
    const stockCheck = canRegisterSaleStock(selectedModel.id, selectedColor, qty, editingSaleId);
    if (!stockCheck.ok) {
      toast(`Sin stock disponible para ${selectedModel.name} (${selectedColor})`, 'error');
      return;
    }

    const variantCommission = getVariantCommission(selectedVariant);

    if (editingSaleId) {
      const existingSale = getSales().find(s => s.id === editingSaleId);
      if (existingSale) {
        const timestamps = normalizeSaleRecordTimestamps({
          date: selectedDate,
          createdAt: existingSale.createdAt,
          recordedTime: existingSale.recordedTime,
          recordedAtIso: existingSale.recordedAtIso,
        });
        const saved = replaceSaleWithInventory(editingSaleId, buildSaleRecord({
          ...existingSale,
          date: timestamps.date,
          deviceId: selectedModel.id,
          deviceNameSnapshot: selectedModel.name,
          deviceColorSnapshot: selectedColor,
          deviceImageSnapshot: getPhoneModelCalendarImage(selectedModel, selectedColor),
          quantity: qty,
          commissionPerUnit: existingSale.commissionPerUnit,
          amountEarned: existingSale.commissionPerUnit * qty,
          createdAt: timestamps.createdAt,
          recordedTime: timestamps.recordedTime,
          recordedAtIso: timestamps.recordedAtIso,
        }));
        if (!saved) {
          toast(STORAGE_SAVE_ERROR, 'error');
          return;
        }
        toast('Registro de venta ajustado con éxito', 'success');
      }
    } else {
      const recordedAt = selectedDate === getAppToday()
        ? getNowForSaleRecording()
        : buildSaleRecordedAtForDate(selectedDate);
      const newSale = buildSaleRecord({
        id: 'manual-' + Date.now(),
        date: recordedAt.date,
        deviceId: selectedModel.id,
        deviceNameSnapshot: selectedModel.name,
        deviceColorSnapshot: selectedColor,
        deviceImageSnapshot: getPhoneModelCalendarImage(selectedModel, selectedColor),
        quantity: 1,
        commissionPerUnit: variantCommission,
        amountEarned: variantCommission,
        createdAt: recordedAt.createdAt,
        recordedTime: recordedAt.recordedTime,
        recordedAtIso: recordedAt.recordedAtIso,
      });
      if (!saveSaleWithInventory(newSale)) {
        toast(STORAGE_SAVE_ERROR, 'error');
        return;
      }
      toast('Venta fuera de fecha registrada con éxito', 'success');
    }

    setSales(getSales());
    setIsFormMode(false);
    setEditingSaleId(null);

    if (isNewSale) {
      emitSaleConfirmed({
        deviceName: selectedModel.name,
        amountEarned: variantCommission,
        deviceColor: selectedColor
      });
    }
  };

  const handleFocusedDateChange = (dateIso: string) => {
    if (!dateIso || dateIso < earliestIso || dateIso > appTodayStr) return;
    const selected = parseLocalDateKey(dateIso);
    setCurrentDateObj(new Date(selected.getFullYear(), selected.getMonth(), 12, 12));
    setFocusedDayIso(dateIso);
  };

  const handleYearOverviewSelect = (dateIso: string) => {
    if (!dateIso || dateIso < earliestIso || dateIso > appTodayStr) return;
    const selected = parseLocalDateKey(dateIso);
    setCurrentDateObj(new Date(selected.getFullYear(), selected.getMonth(), 12, 12));
    setFocusedDayIso(dateIso);
    setSelectedFilterIso(dateIso);
    setShowYearOverview(false);
  };

  const salesFocusedDay = React.useMemo(
    () => sales.filter((sale) => getSaleDayKey(sale) === focusedDayIso),
    [sales, focusedDayIso],
  );
  const ventasDia = React.useMemo(
    () => salesFocusedDay.reduce((acc, sale) => acc + (sale.quantity || 1), 0),
    [salesFocusedDay],
  );
  const metaHoy = goal;

  const appSettings = React.useMemo(() => getAppSettings(), [settingsVersion]);

  const periodGoals = React.useMemo(() => {
    const goals = derivePeriodGoals(appSettings);
    return [
      buildPeriodGoalProgress(sales, 'week', goals.weeklyGoal),
      buildPeriodGoalProgress(sales, 'month', goals.monthlyGoal),
      buildPeriodGoalProgress(sales, 'year', goals.annualGoal),
    ];
  }, [sales, appSettings]);

  const dayGoalUnits = React.useMemo(
    () => buildDayGoalUnits(salesFocusedDay),
    [salesFocusedDay],
  );

  const isFocusedToday = focusedDayIso === appTodayStr;

  const calendarDays = React.useMemo(
    () => buildCalendarMonthDays({
      year: currentYear,
      month: currentMonth,
      sales,
      challenges,
      goal,
      phoneModels: models,
      appTodayStr,
      earliestIso,
      firstSaleIso,
    }),
    [currentYear, currentMonth, sales, challenges, goal, models, appTodayStr, earliestIso, firstSaleIso],
  );

  const focusedDayData = calendarDays.find((day) => day.dateIso === focusedDayIso);
  const dayState = focusedDayData ? focusedDayData.state : 'pendiente';

  const salesToday = React.useMemo(() => sales.filter(s => getSaleDayKey(s) === appTodayStr), [sales, appTodayStr]);
  const ventasHoy = React.useMemo(() => salesToday.reduce((acc, sale) => acc + (sale.quantity || 1), 0), [salesToday]);

  // Custom switch trigger to main Register section in AppShell
  const handleRedirectToRegister = React.useCallback(() => {
    const customEvent = new CustomEvent('switch-tab', { detail: 'register' });
    window.dispatchEvent(customEvent);
  }, []);

  const handleEditSale = React.useCallback((sale: SaleRecord) => {
    const modelIdx = findModelIndexByDeviceId(models, sale.deviceId);
    const fallbackModel = models[modelIdx !== -1 ? modelIdx : 0];
    setSelectedDeviceIndex(modelIdx !== -1 ? modelIdx : 0);
    setSelectedColor(
      sale.deviceColorSnapshot || sale.deviceColor || getModelVariantColors(fallbackModel)[0] || '',
    );
    setSelectedDate(sale.date);
    setEditingSaleId(sale.id);
    setIsFormMode(true);
  }, [models]);

  const handleDeleteSale = React.useCallback((sale: SaleRecord) => {
    if (confirm(`¿Seguro que deseas eliminar el registro de venta del ${sale.deviceName} (${sale.deviceColor})? Sus datos y metas se recalcularán de inmediato.`)) {
      if (!deleteSale(sale.id)) {
        toast(STORAGE_SAVE_ERROR, 'error');
        return;
      }
      setSales(getSales());
    }
  }, []);

  const isTodayGoalMet = ventasHoy >= metaHoy && metaHoy > 0;

  const { setConfig: setHeaderConfig } = useSectionHeader();

  useEffect(() => {
    if (!showAgendaMode && !isFormMode) {
      setHeaderConfig(null);
      return;
    }

    const headerVariant = isTodayGoalMet ? 'onDark' : 'default';

    if (showAgendaMode) {
      setHeaderConfig({
        title: 'Historial',
        subtitle: 'Ventas registradas por día',
        variant: headerVariant,
        leading: (
          <SectionHeaderBackButton
            variant={headerVariant}
            onClick={() => {
              setShowAgendaMode(false);
              setSelectedFilterIso(null);
            }}
          />
        ),
      });
      return () => setHeaderConfig(null);
    }

    setHeaderConfig({
      title: editingSaleId ? 'Ajustar Venta' : 'Registro de Venta',
      subtitle: 'Formulario para ventas fuera de fecha',
      variant: headerVariant,
      leading: (
        <SectionHeaderBackButton
          variant={headerVariant}
          onClick={() => {
            setIsFormMode(false);
            setEditingSaleId(null);
          }}
        />
      ),
    });

    return () => setHeaderConfig(null);
  }, [showAgendaMode, isFormMode, editingSaleId, isTodayGoalMet, setHeaderConfig]);

  const generateStars = (num: number) => {
    return Array.from({ length: num }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 4,
      delay: Math.random() * 2,
      duration: Math.random() * 3 + 1.5,
    }));
  };

  const [stars, setStars] = useState<{id: number, x: number, y: number, size: number, delay: number, duration: number}[]>([]);

  useEffect(() => {
    const met = isTodayGoalMet && !showAgendaMode && !isFormMode;
    window.dispatchEvent(new CustomEvent('calendar-goal-status', { detail: { isGoalMet: met } }));
    
    if (met) {
      setStars(generateStars(20));
    } else {
      setStars([]);
    }
    
    return () => {
      // Clean up event on unmount just in case
      window.dispatchEvent(new CustomEvent('calendar-goal-status', { detail: { isGoalMet: false } }));
    };
  }, [isTodayGoalMet, showAgendaMode, isFormMode]);

  return (
    <motion.div 
      initial={false}
      className={`h-full w-full flex flex-col items-center justify-start pt-0 px-3 ${(showAgendaMode || isFormMode) ? 'overflow-hidden pb-0' : 'overflow-y-auto pb-[calc(var(--dock-bottom-gap)+env(safe-area-inset-bottom)+140px)]'} no-scrollbar select-none relative rounded-none bg-transparent`}
      style={{ 
        boxShadow: 'none'
      }}
    >
      
      <AnimatePresence>
        {isTodayGoalMet && !showAgendaMode && !isFormMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-none`}
          >
            {/* Clean Premium Victory Halo - Focused strictly behind the top card area */}
            <div 
              className="absolute top-0 left-0 right-0 h-[50vh] pointer-events-none z-0 mix-blend-plus-lighter opacity-90"
              style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
            >
              <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-[100%] bg-emerald-500/30 blur-[60px]" />
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-[100%] bg-emerald-300/20 blur-[50px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popover background protector to safely close the legend */}
      {showLegend && !showAgendaMode && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowLegend(false)}
        />
      )}

      <AnimatePresence mode="wait">
        {isFormMode ? (
          <CalendarFormMode 
            models={models}
            editingSaleId={editingSaleId}
            selectedDate={selectedDate}
            selectedDeviceIndex={selectedDeviceIndex}
            selectedColor={selectedColor}
            minDate={earliestIso}
            maxDate={appTodayStr}
            getHexForColorName={getHexForColorName}
            editingCommissionPerUnit={
              editingSaleId
                ? sales.find((sale) => sale.id === editingSaleId)?.commissionPerUnit
                : undefined
            }
            onCancel={() => {
              setIsFormMode(false);
              setEditingSaleId(null);
            }}
            onDateChange={setSelectedDate}
            onDeviceChange={(index, color) => {
              setSelectedDeviceIndex(index);
              setSelectedColor(color);
            }}
            onColorChange={setSelectedColor}
            onSubmit={handleSaveOrUpdateSale}
          />
        ) : showAgendaMode ? (
          <CalendarAgendaMode 
            sales={sales}
            showLegend={showLegend}
            selectedFilterIso={selectedFilterIso}
            onClose={() => setShowAgendaMode(false)}
            onToggleLegend={(e) => {
              e.stopPropagation();
              setShowLegend(!showLegend);
            }}
            onClearFilter={() => setSelectedFilterIso(null)}
            onAddOldSale={() => {
              setEditingSaleId(null);
              setSelectedDeviceIndex(0);
              setSelectedColor(getModelVariantColors(models[0])[0] || '');
              const preferredDate = selectedFilterIso || focusedDayIso || getAppToday();
              const safeDate =
                preferredDate < earliestIso
                  ? earliestIso
                  : preferredDate > appTodayStr
                    ? appTodayStr
                    : preferredDate;
              setSelectedDate(safeDate);
              setIsFormMode(true);
            }}
            onEditSale={handleEditSale}
            onDeleteSale={handleDeleteSale}
            onRedirectToRegister={handleRedirectToRegister}
          />
        ) : (
          <CalendarGridView 
            salesFocusedDay={salesFocusedDay}
            ventasDia={ventasDia}
            metaHoy={metaHoy}
            calendarDays={calendarDays}
            dayState={dayState}
            focusedDayIso={focusedDayIso}
            isFocusedToday={isFocusedToday}
            isTodayGoalMet={isTodayGoalMet}
            showLegend={showLegend}
            earliestIso={earliestIso}
            appTodayStr={appTodayStr}
            dayGoalUnits={dayGoalUnits}
            periodGoals={periodGoals}
            hasPrevMonth={hasPrevMonth}
            hasNextMonth={hasNextMonth}
            canPrevDay={canPrevDay}
            canNextDay={canNextDay}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onToggleLegend={(e) => {
              e.stopPropagation();
              setShowLegend(!showLegend);
            }}
            onSelectDay={handleSelectCalendarDay}
            onFocusedDateChange={handleFocusedDateChange}
            onShowAgenda={() => setShowAgendaMode(true)}
            onOpenYearOverview={() => setShowYearOverview(true)}
          />
        )}
      </AnimatePresence>

      <CalendarYearOverview
        isOpen={showYearOverview}
        sales={sales}
        challenges={challenges}
        goal={goal}
        phoneModels={models}
        appTodayStr={appTodayStr}
        earliestIso={earliestIso}
        firstSaleIso={firstSaleIso}
        focusedDayIso={focusedDayIso}
        onClose={() => setShowYearOverview(false)}
        onSelectDay={handleYearOverviewSelect}
      />

    </motion.div>
  );
}
