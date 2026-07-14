import { getSales, getAppSettings } from './storage';
import { getAppToday, parseLocalDateKey } from './date';
import { getMonthlyPerformanceInsights } from './insights';
import {
  getModelBestCommission,
  getModelMinStockThreshold,
  getModelTotalStock,
  loadManualSaleModels,
  toCoachDeviceView,
} from './saleCatalog';

export type GoalRiskLevel = 'En ritmo' | 'Riesgo medio' | 'Riesgo alto' | 'Meta cumplida' | 'Sin historial suficiente';

export const getClosingForecast = () => {
  const performance = getMonthlyPerformanceInsights();
  const settings = getAppSettings();
  
  const todayDate = parseLocalDateKey(getAppToday());
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = todayDate.getDate();
  
  const daysPassed = Math.max(1, currentDay);
  const daysLeft = Math.max(0, daysInMonth - currentDay);
  
  const currentCommission = performance.totalCommission;
  const currentPieces = performance.totalPieces;
  const commissionGoal = settings.commissionGoal;
  
  if (commissionGoal === 0) return null;
  
  if (daysPassed < 3 && currentCommission === 0) {
    return {
      projectedCommission: 0,
      projectedPieces: 0,
      riskLevel: 'Sin historial suficiente' as GoalRiskLevel,
      requiredDailyPace: 0,
      currentDailyPace: 0
    };
  }

  if (currentCommission >= commissionGoal) {
    return {
      projectedCommission: currentCommission,
      projectedPieces: currentPieces,
      riskLevel: 'Meta cumplida' as GoalRiskLevel,
      requiredDailyPace: 0,
      currentDailyPace: currentCommission / daysPassed
    };
  }

  const currentDailyPace = currentCommission / daysPassed;
  const projectedCommission = currentCommission + (currentDailyPace * daysLeft);
  
  const requiredDailyPace = daysLeft > 0 ? (commissionGoal - currentCommission) / daysLeft : 0;
  
  let riskLevel: GoalRiskLevel = 'En ritmo';
  if (projectedCommission < commissionGoal * 0.7) {
    riskLevel = 'Riesgo alto';
  } else if (projectedCommission < commissionGoal) {
    riskLevel = 'Riesgo medio';
  }
  
  return {
    projectedCommission,
    projectedPieces: currentPieces + ((currentPieces / daysPassed) * daysLeft),
    riskLevel,
    requiredDailyPace,
    currentDailyPace
  };
};

export const getBestProductToPush = () => {
  const models = loadManualSaleModels().filter((model) => getModelTotalStock(model) > 0);
  if (models.length === 0) return null;

  const sortedByCommission = [...models].sort(
    (a, b) => getModelBestCommission(b) - getModelBestCommission(a),
  );

  const bestModel =
    sortedByCommission.find((model) => getModelTotalStock(model) > 2) || sortedByCommission[0];

  return bestModel ? toCoachDeviceView(bestModel) : null;
};

export const getTodayActionPlan = () => {
  const settings = getAppSettings();
  const today = getAppToday();
  const sales = getSales();
  const todaySales = sales.filter(s => s.date === today);
  const todayPieces = todaySales.reduce((sum, s) => sum + s.quantity, 0);
  const catalogModels = loadManualSaleModels();
  const coachDevices = catalogModels.map(toCoachDeviceView);
  
  // Check rest day
  let isRestDay = false;
  if (settings.workSchedule) {
    const todayDate = parseLocalDateKey(today);
    const dayOfWeek = todayDate.getDay();
    if (settings.workSchedule.fixedRestDays.includes(dayOfWeek) || settings.workSchedule.manualRestDates.includes(today)) {
      isRestDay = true;
    }
  } else {
    // fallback to Sunday
    const todayDate = parseLocalDateKey(today);
    if (todayDate.getDay() === 0) isRestDay = true;
  }
  
  const actions: string[] = [];
  const recommendedModel = getBestProductToPush();
  const forecast = getClosingForecast();
  
  if (isRestDay) {
    actions.push(`Hoy es tu día libre. Aprovecha para descansar y recargar energías.`);
    if (todayPieces > 0) {
      actions.push(`¡Vendiste ${todayPieces} equipos en tu día libre! Eso es compromiso.`);
    }
  } else {
    // 1. Meta Diaria o Mensual (Action)
    if (todayPieces < settings.dailyGoal) {
      actions.push(`Te faltan ${settings.dailyGoal - todayPieces} equipos para tu meta diaria.`);
    } else if (forecast && forecast.riskLevel !== 'Meta cumplida') {
      actions.push(`Meta diaria cumplida. Si vendes uno más hoy, mejoras tu proyección de cierre.`);
    } else if (forecast && forecast.riskLevel === 'Meta cumplida') {
      actions.push(`¡Mes superado! Todo lo extra es pura ganancia.`);
    }
  }

  // 2. Modelo Recomendado
  if (recommendedModel) {
    actions.push(`Empuja ${recommendedModel.name}: mayor comisión con stock disponible ($${recommendedModel.margin}).`);
  }

  // 3. Alertas de inventario y comerciales
  const lowStockDevices = coachDevices.filter(
    (device) => (device.stock || 0) > 0 && (device.stock || 0) <= (device.minStock || 1),
  );
  const outOfStockDevices = coachDevices.filter((device) => (device.stock || 0) === 0);
  
  if (outOfStockDevices.length > 2) {
    actions.push(`Cuidado: Tienes ${outOfStockDevices.length} modelos agotados. Revisa opciones sustitutas.`);
  } else if (lowStockDevices.length > 0) {
    actions.push(`${lowStockDevices[0].name} está en bajo stock (quedan ${lowStockDevices[0].stock}).`);
  } else if (forecast && forecast.riskLevel === 'Riesgo alto') {
    actions.push(`Ritmo bajo detectado: Intenta ofrecer combos o cerrar ventas en duda.`);
  } else {
    // Buscar dispositivos con alta comisión y buen stock pero cero ventas hoy
    const highMarginLowSale = coachDevices.find(
      (device) =>
        device.margin >= 300
        && (device.stock || 0) > 2
        && !todaySales.some((sale) => sale.deviceId === device.id),
    );
    if (highMarginLowSale && actions.length < 3) {
      actions.push(`${highMarginLowSale.name} tiene buena comisión y stock disponible. Repasa su argumento comercial hoy.`);
    }
  }

  return {
    actions: actions.slice(0, 3),
    recommendedModel
  };
};
