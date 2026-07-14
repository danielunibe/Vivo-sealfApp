import { SaleRecord, InventoryMovement, Achievement } from '../types';
import { getAppSettings, getSales, getInventoryMovements, getAchievements, saveAchievements, getChallenges, addPointsBonus } from './storage';
import { ACHIEVEMENT_POINTS } from './points';
import { getAppToday, getCurrentMonth, parseLocalDateKey } from './date';
import { getActiveOrderedVariants } from './modelOrdering';
import { loadManualSaleModels } from './saleCatalog';

export const getMonthlyPerformanceInsights = () => {
  const { month, year } = getCurrentMonth();
  const sales = getSales().filter(sale => {
    const saleDate = parseLocalDateKey(sale.date);
    return saleDate.getMonth() === month && saleDate.getFullYear() === year;
  });

  const settings = getAppSettings();
  const totalCommission = sales.reduce((sum, sale) => sum + sale.amountEarned, 0);
  const totalPieces = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  
  const commissionGoal = settings.commissionGoal;
  const piecesGoal = settings.monthlyGoal;
  
  const commissionMissing = Math.max(0, commissionGoal - totalCommission);
  const piecesMissing = Math.max(0, piecesGoal - totalPieces);
  const commissionProgress = Math.min(100, commissionGoal > 0 ? (totalCommission / commissionGoal) * 100 : 100);
  const piecesProgress = Math.min(100, piecesGoal > 0 ? (totalPieces / piecesGoal) * 100 : 100);
  
  const uniqueDays = new Set(sales.map(s => s.date)).size;
  const avgCommissionPerSale = sales.length > 0 ? totalCommission / sales.length : 0;
  const avgPiecesPerActiveDay = uniqueDays > 0 ? totalPieces / uniqueDays : 0;
  
  const modelCommissions: Record<string, number> = {};
  const modelPieces: Record<string, number> = {};
  const dailyCommissions: Record<string, number> = {};

  sales.forEach(sale => {
    modelCommissions[sale.deviceNameSnapshot] = (modelCommissions[sale.deviceNameSnapshot] || 0) + sale.amountEarned;
    modelPieces[sale.deviceNameSnapshot] = (modelPieces[sale.deviceNameSnapshot] || 0) + sale.quantity;
    dailyCommissions[sale.date] = (dailyCommissions[sale.date] || 0) + sale.amountEarned;
  });

  let topModelByCommission = '';
  let maxModelCommission = 0;
  Object.entries(modelCommissions).forEach(([model, comm]) => {
    if (comm > maxModelCommission) { maxModelCommission = comm; topModelByCommission = model; }
  });

  let topModelByPieces = '';
  let maxModelPieces = 0;
  Object.entries(modelPieces).forEach(([model, pcs]) => {
    if (pcs > maxModelPieces) { maxModelPieces = pcs; topModelByPieces = model; }
  });

  let bestDay = '';
  let maxDailyCommission = 0;
  Object.entries(dailyCommissions).forEach(([date, comm]) => {
    if (comm > maxDailyCommission) { maxDailyCommission = comm; bestDay = date; }
  });

  return {
    totalCommission,
    totalPieces,
    totalSalesCount: sales.length,
    commissionGoal,
    piecesGoal,
    commissionMissing,
    piecesMissing,
    commissionProgress,
    piecesProgress,
    avgCommissionPerSale,
    avgPiecesPerActiveDay,
    topModelByCommission,
    topModelByPieces,
    bestDay,
    maxDailyCommission
  };
};

export const getStockAlerts = () => {
  const models = loadManualSaleModels();
  const alerts: string[] = [];
  
  models.forEach((model) => {
    getActiveOrderedVariants(model).forEach((variant) => {
      const stock = variant.stock || 0;
      const minStock = variant.minStock || 1;
      if (stock === 0) {
        alerts.push(`${model.name} (${variant.colorName}) está AGOTADO.`);
      } else if (stock <= minStock) {
        alerts.push(`${model.name} (${variant.colorName}) en bajo stock (quedan ${stock}).`);
      }
    });
  });
  
  return alerts;
};

export const getRequiredDailyPace = () => {
  const { piecesMissing } = getMonthlyPerformanceInsights();
  if (piecesMissing <= 0) return 0;
  
  const todayDate = new Date(getAppToday());
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = todayDate.getDate();
  const daysLeft = Math.max(1, daysInMonth - currentDay);
  
  return (piecesMissing / daysLeft).toFixed(1);
};

export const generateCommercialInsights = () => {
  const insights: string[] = [];
  const performance = getMonthlyPerformanceInsights();
  const settings = getAppSettings();
  const alerts = getStockAlerts();
  
  // 1. Goal insights
  if (performance.commissionProgress >= 100) {
    insights.push("¡Felicidades! Has cumplido tu meta mensual de comisión.");
  } else if (performance.commissionProgress >= 80) {
    insights.push(`¡Estás muy cerca! Te faltan $${performance.commissionMissing} para tu meta mensual.`);
  } else {
    insights.push(`Te faltan $${performance.commissionMissing} para tu meta mensual.`);
  }
  
  // 2. Pace insights
  const requiredPace = parseFloat(getRequiredDailyPace() as string);
  if (requiredPace > 0 && performance.piecesProgress < 100) {
    insights.push(`Necesitas vender ${requiredPace} equipos por día para llegar a la meta.`);
  }

  // 3. Top model
  if (performance.topModelByCommission) {
    insights.push(`Tu modelo más rentable este mes es ${performance.topModelByCommission}.`);
  }

  // 4. Daily Goal
  const today = getAppToday();
  const todaySales = getSales().filter(s => s.date === today);
  const todayPieces = todaySales.reduce((sum, s) => sum + s.quantity, 0);
  if (todayPieces >= settings.dailyGoal && settings.dailyGoal > 0) {
    insights.push(`¡Hoy ya cumpliste tu meta diaria de ${settings.dailyGoal} equipos!`);
  }
  
  // 5. Best day
  if (performance.bestDay) {
    insights.push(`Tu mejor día del mes fue el ${performance.bestDay} con $${performance.maxDailyCommission}.`);
  }
  
  // Combine with stock alerts (max 2 stock alerts)
  return [...alerts.slice(0, 2), ...insights].slice(0, 4);
};

export const checkAchievements = () => {
  const sales = getSales();
  const models = loadManualSaleModels();
  const movements = getInventoryMovements();
  const currentAchievements = getAchievements();
  let updated = false;

  const achievementsMap = new Map(currentAchievements.map(a => [a.id, a]));

  const unlock = (id: string, title: string, description: string) => {
    if (!achievementsMap.has(id) || !achievementsMap.get(id)!.unlocked) {
      achievementsMap.set(id, { id, title, description, unlocked: true, unlockedAt: Date.now() });
      addPointsBonus({
        amount: ACHIEVEMENT_POINTS,
        reason: `Logro desbloqueado: ${title}`,
        source: 'achievement',
        relatedId: id,
      });
      updated = true;
    }
  };

  // 1. Primera venta
  if (sales.length >= 1) {
    unlock('first_sale', 'Primera Venta', 'Registraste tu primera venta en el sistema.');
  }

  // 2. Venta múltiple
  if (sales.some(s => s.quantity >= 2)) {
    unlock('multiple_sale', 'Venta Múltiple', 'Vendiste 2 o más equipos en un solo registro.');
  }

  // 3. Comisión personalizada
  if (sales.some(s => s.isCustomCommission)) {
    unlock('custom_commission', 'Negociador', 'Usaste una comisión personalizada para un registro de venta.');
  }

  // 4. Inventario controlado
  const noNegativeStock = models.every((model) =>
    getActiveOrderedVariants(model).every((variant) => (variant.stock || 0) >= 0),
  );
  if (noNegativeStock && movements.length > 0) {
    unlock('inventory_controlled', 'Control Total', 'Mapeaste el inventario sin caer en números negativos.');
  }
  
  // 5. Meta diaria cumplida
  const settings = getAppSettings();
  if (settings.dailyGoal > 0) {
    const dailyPieces: Record<string, number> = {};
    sales.forEach(s => {
      dailyPieces[s.date] = (dailyPieces[s.date] || 0) + s.quantity;
    });
    const hasMetDailyGoal = Object.values(dailyPieces).some(p => p >= settings.dailyGoal);
    if (hasMetDailyGoal) {
      unlock('daily_goal_met', 'Meta Diaria', `Alcanzaste tu meta de vender ${settings.dailyGoal} equipos en un día.`);
    }
    
    // 6. Top vendedor del día (meta diaria + 2)
    const hasSmashedDailyGoal = Object.values(dailyPieces).some(p => p >= (settings.dailyGoal + 2));
    if (hasSmashedDailyGoal) {
      unlock('top_seller_day', 'Imparable', `Superaste tu meta diaria por al menos 2 equipos.`);
    }
  }

  // 7. Cerca de la meta
  const performance = getMonthlyPerformanceInsights();
  if (performance.commissionProgress >= 80) {
    unlock('near_goal', 'A un paso', 'Alcanzaste el 80% de tu meta mensual de comisión.');
  }

  // 7. Retos comerciales
  const challenges = getChallenges();
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  if (completedChallenges.length >= 1) {
    unlock('first_challenge', 'Desafiante', 'Completaste tu primer reto comercial.');
  }

  if (completedChallenges.length >= 3) {
    unlock('active_week', 'Semana Activa', 'Has completado al menos 3 retos comerciales.');
  }

  if (completedChallenges.some(c => c.type === 'objection_practice')) {
    unlock('practiced_argument', 'Argumento Preparado', 'Practicaste y completaste un reto de entrenamiento de objeciones.');
  }

  if (updated) {
    saveAchievements(Array.from(achievementsMap.values()));
  }
};

