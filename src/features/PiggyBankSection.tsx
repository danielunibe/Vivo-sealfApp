import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SaleRecord, PhoneModel } from '../types';
import { getSales, getSavingsGoal, getDailyGoal, saveSaleWithInventory, replaceSaleWithInventory, deleteSale, buildSaleRecord, canRegisterSaleStock } from '../lib/storage';
import { emitSaleConfirmed, onSalesUpdated, onSettingsUpdated, onInventoryUpdated, onAppDayChanged } from '../lib/events';
import { toast } from '../lib/toast';
import { getAppToday, getEarliestSelectableDateKey } from '../lib/date';
import { getNowForSaleRecording, buildSaleRecordedAtForDate, normalizeSaleRecordTimestamps } from '../lib/saleTimestamps';
import { getPhoneModelHeroImage } from '../lib/deviceImages';
import {
  findModelIndexByDeviceId,
  getModelVariantColors,
  getVariantCommission,
  loadManualSaleModels,
  resolveManualSaleVariant,
} from '../lib/saleCatalog';
import { getHexForColorName } from './calendar/calendarUtils';
import { CalendarFormMode } from './calendar/CalendarFormMode';
import { PiggyBankDashboard } from './piggybank/PiggyBankDashboard';
import { filterSalesByPeriod } from '../lib/analytics';
import { useSectionHeader } from '../components/ui/SectionHeaderContext';
import { SectionHeaderBackButton } from '../components/ui/SectionHeaderBackButton';

type IncomeViewMode = 'overview' | 'form';

const STORAGE_SAVE_ERROR = 'No se pudo guardar en el dispositivo. Libera espacio o exporta un respaldo desde Ajustes.';

export default function PiggyBankSection() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [models, setModels] = useState<PhoneModel[]>(loadManualSaleModels());
  const [savingsGoal, setSavingsGoal] = useState(5000);
  
  const [viewMode, setViewMode] = useState<IncomeViewMode>('overview');
  const [formReturnMode, setFormReturnMode] = useState<IncomeViewMode>('overview');
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  
  // Manual sale form states
  const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedDate, setSelectedDate] = useState(getAppToday());
  const [todayVersion, setTodayVersion] = useState(0);

  useEffect(() => {
    const refresh = () => {
      const nextSales = getSales();
      setSales(nextSales);
      setSavingsGoal(getSavingsGoal());
    };

    refresh();
    
    const unsubscribeSales = onSalesUpdated(refresh);
    const unsubscribeSettings = onSettingsUpdated(() => setSavingsGoal(getSavingsGoal()));
    const unsubscribeInventory = onInventoryUpdated(() => setModels(loadManualSaleModels()));
    const unsubscribeDayChange = onAppDayChanged(() => {
      setTodayVersion((version) => version + 1);
      setSelectedDate(getAppToday());
    });

    return () => {
      unsubscribeSales();
      unsubscribeSettings();
      unsubscribeInventory();
      unsubscribeDayChange();
    };
  }, []);

  const selectedModel = models[selectedDeviceIndex];
  const editingSale = editingSaleId ? sales.find((sale) => sale.id === editingSaleId) : null;

  // Auto-update color when model selection changes
  useEffect(() => {
    const colors = selectedModel ? getModelVariantColors(selectedModel) : [];
    if (colors.length > 0 && !colors.includes(selectedColor)) {
      setSelectedColor(colors[0]);
    }
  }, [selectedDeviceIndex, selectedModel, selectedColor]);

  const monthlySales = filterSalesByPeriod(sales, 'month');
  const totalEarned = monthlySales.reduce((acc, sale) => acc + sale.amountEarned, 0);
  const progressPercent = savingsGoal > 0 ? Math.min((totalEarned / savingsGoal) * 100, 100) : 100;
  const remainingAmount = Math.max(savingsGoal - totalEarned, 0);
  const todaySales = filterSalesByPeriod(sales, 'today');
  const todayEarned = todaySales.reduce((acc, sale) => acc + sale.amountEarned, 0);
  const todayPieces = todaySales.reduce((acc, sale) => acc + (sale.quantity || 1), 0);
  const dailyGoal = getDailyGoal();
  const todayProgressPercent = dailyGoal > 0 ? Math.min((todayPieces / dailyGoal) * 100, 100) : 100;
  const appTodayStr = React.useMemo(() => getAppToday(), [todayVersion]);
  const earliestIso = React.useMemo(
    () => getEarliestSelectableDateKey(sales, appTodayStr),
    [sales, appTodayStr],
  );
  
  const handleOpenAddMode = () => {
    setSelectedDeviceIndex(0);
    if (models[0]) {
      setSelectedColor(getModelVariantColors(models[0])[0] || '');
    }
    setSelectedDate(getAppToday());
    setEditingSaleId(null);
    setFormReturnMode('overview');
    setViewMode('form');
  };

  useEffect(() => {
    const handleToggle = () => handleOpenAddMode();

    window.addEventListener('toggle-piggy-bank-add-mode', handleToggle);
    return () => {
      window.removeEventListener('toggle-piggy-bank-add-mode', handleToggle);
    };
  }, [models]);

  const handleOpenEditMode = (sale: SaleRecord) => {
    const modelIdx = findModelIndexByDeviceId(models, sale.deviceId);
    const fallbackModel = models[modelIdx !== -1 ? modelIdx : 0];
    if (modelIdx !== -1) {
      setSelectedDeviceIndex(modelIdx);
    }
    setSelectedColor(
      sale.deviceColorSnapshot || sale.deviceColor || getModelVariantColors(fallbackModel)[0] || '',
    );
    setSelectedDate(sale.date);
    setEditingSaleId(sale.id);
    setFormReturnMode('overview');
    setViewMode('form');
  };

  const { setConfig: setHeaderConfig } = useSectionHeader();

  useEffect(() => {
    if (viewMode === 'overview') {
      setHeaderConfig(null);
      return;
    }

    const goBack = () => {
      setEditingSaleId(null);
      setViewMode(formReturnMode === 'form' ? 'overview' : formReturnMode);
    };

    setHeaderConfig({
      title: editingSaleId ? 'Ajustar Venta' : 'Registro de Venta',
      subtitle: 'Formulario para ventas fuera de fecha',
      leading: <SectionHeaderBackButton onClick={goBack} />,
    });

    return () => setHeaderConfig(null);
  }, [viewMode, editingSaleId, formReturnMode, setHeaderConfig]);

  const handleSaveOrUpdateSale = () => {
    if (!selectedModel || !selectedColor || !selectedDate) {
      toast('Por favor completa todos los campos requeridos.', 'error');
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

    const quantity = editingSaleId
      ? (getSales().find((sale) => sale.id === editingSaleId)?.quantity || 1)
      : 1;
    const stockCheck = canRegisterSaleStock(selectedModel.id, selectedColor, quantity, editingSaleId);
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
          deviceImageSnapshot: getPhoneModelHeroImage(selectedModel, selectedColor),
          quantity,
          commissionPerUnit: existingSale.commissionPerUnit,
          amountEarned: existingSale.commissionPerUnit * quantity,
          createdAt: timestamps.createdAt,
          recordedTime: timestamps.recordedTime,
          recordedAtIso: timestamps.recordedAtIso,
        }));
        if (!saved) {
          toast(STORAGE_SAVE_ERROR, 'error');
          return;
        }
      }

      setSales(getSales());
      setViewMode(formReturnMode === 'form' ? 'overview' : formReturnMode);
      setEditingSaleId(null);
      toast('Venta actualizada correctamente.', 'success');
    } else {
      const recordedAt = selectedDate === getAppToday()
        ? getNowForSaleRecording()
        : buildSaleRecordedAtForDate(selectedDate);
      const newSale = buildSaleRecord({
        id: `manual-${Date.now()}`,
        date: recordedAt.date,
        deviceId: selectedModel.id,
        deviceNameSnapshot: selectedModel.name,
        deviceColorSnapshot: selectedColor,
        deviceImageSnapshot: getPhoneModelHeroImage(selectedModel, selectedColor),
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

      emitSaleConfirmed({
        deviceName: selectedModel.name,
        amountEarned: variantCommission,
        deviceColor: selectedColor
      });

      setSales(getSales());
      setViewMode(formReturnMode === 'form' ? 'overview' : formReturnMode);
      toast('Venta fuera de fecha registrada con éxito.', 'success');
    }
  };

  const handleDeleteSaleRecord = () => {
    if (!editingSaleId) return;
    if (confirm('¿Estás seguro de que deseas eliminar este registro de venta?')) {
      if (!deleteSale(editingSaleId)) {
        toast(STORAGE_SAVE_ERROR, 'error');
        return;
      }
      setSales(getSales());
      setViewMode(formReturnMode === 'form' ? 'overview' : formReturnMode);
      setEditingSaleId(null);
      toast('Registro de venta eliminado.', 'error');
    }
  };

  return (
    <motion.div 
      initial={false}
      className="flex flex-col h-full gap-2.5 px-4 pt-0 overflow-y-auto no-scrollbar pb-[calc(var(--dock-bottom-gap)+env(safe-area-inset-bottom)+92px)] relative"
    >
      <div className="relative z-10 w-full flex flex-col gap-3">
        <AnimatePresence mode="wait">
          {viewMode === 'overview' ? (
            <PiggyBankDashboard 
              sales={sales}
              savingsGoal={savingsGoal}
              totalEarned={totalEarned}
              progressPercent={progressPercent}
              remainingAmount={remainingAmount}
              todayEarned={todayEarned}
              todayPieces={todayPieces}
              todayProgressPercent={todayProgressPercent}
              dailyGoal={dailyGoal}
              onOpenEditMode={handleOpenEditMode}
            />
          ) : (
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-center justify-center pt-2"
            >
              <CalendarFormMode 
                models={models}
                editingSaleId={editingSaleId}
                selectedDate={selectedDate}
                selectedDeviceIndex={selectedDeviceIndex}
                selectedColor={selectedColor}
                minDate={earliestIso}
                maxDate={appTodayStr}
                getHexForColorName={getHexForColorName}
                editingCommissionPerUnit={editingSale?.commissionPerUnit}
                onCancel={() => {
                  setViewMode(formReturnMode === 'form' ? 'overview' : formReturnMode);
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
              {editingSaleId && (
                <button
                  type="button"
                  onClick={handleDeleteSaleRecord}
                  className="w-[60%] max-w-[200px] mt-2 min-h-[42px] mx-auto rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  title="Eliminar registro"
                >
                  <span>Eliminar Venta</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
