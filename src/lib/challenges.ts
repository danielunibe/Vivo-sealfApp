import { DailyChallenge } from '../types';
import { getSales, getAppSettings, getChallenges, saveChallenges, upsertChallenge } from './storage';
import { getAppToday, getEndOfAppDay, parseLocalDateKey } from './date';
import { getMonthlyPerformanceInsights, checkAchievements } from './insights';
import { addPointsBonus } from './storage';
import { ACHIEVEMENT_POINTS, getChallengeBonusPoints, PRACTICE_POINTS } from './points';
import {
  getModelBestCommission,
  getModelTotalStock,
  loadManualSaleModels,
  toCoachDeviceView,
} from './saleCatalog';

export const clearExpiredChallenges = () => {
  const today = getAppToday();
  const challenges = getChallenges();
  const updated = challenges.filter(c => {
    // Si tiene la fecha guardada y no es de hoy, expira (si no estaba completado)
    // Guardamos los completados históricamente para stats/logros
    if (c.status === 'completed') return true;
    if (c.date) {
      return c.date === today;
    }
    // Backward compatibility
    return c.expiresAt > Date.now();
  });
  
  if (updated.length !== challenges.length) {
    saveChallenges(updated);
  }
};

export const generateDailyChallenges = () => {
  clearExpiredChallenges();
  
  const today = getAppToday();
  const sales = getSales();
  const catalogModels = loadManualSaleModels();
  const settings = getAppSettings();
  
  // Skip generation on rest days
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
  
  if (isRestDay) return;

  const activeChallenges = getChallenges().filter(c => c.status === 'active');
  
  // Si ya tenemos 3 retos activos, no generar más
  if (activeChallenges.length >= 3) return;

  const todaySales = sales.filter(s => s.date === today);
  const todayPieces = todaySales.reduce((sum, s) => sum + s.quantity, 0);
  
  const newChallenges: DailyChallenge[] = [];
  
  const expiresAt = getEndOfAppDay();

  const existingTypes = new Set(activeChallenges.map(c => c.type));

  // 1. Si no hay ventas, reto básico
  if (todayPieces < settings.dailyGoal && !existingTypes.has('daily_volume')) {
    newChallenges.push({
      id: `vol-${today}`,
      title: 'Arranca el día',
      description: `Vende ${settings.dailyGoal} equipos hoy.`,
      type: 'daily_volume',
      targetValue: settings.dailyGoal,
      currentValue: todayPieces,
      unit: 'devices',
      status: 'active',
      priority: 'high',
      createdAt: Date.now(),
      date: today,
      expiresAt,
      source: 'goal'
    });
  }

  // 2. Si meta diaria ya está cumplida, o cerca
  if (todayPieces >= settings.dailyGoal && !existingTypes.has('objection_practice')) {
     const modelsWithObjections = catalogModels.filter((model) =>
       model.isActive
       && model.commercialProfile?.objections
       && model.commercialProfile.objections.length > 0,
     );
     
     if (modelsWithObjections.length > 0) {
       const model = modelsWithObjections[Math.floor(Math.random() * modelsWithObjections.length)];
       newChallenges.push({
          id: `prac-${today}-${model.id}`,
          title: 'Afila la sierra',
          description: `Practica una objeción frecuente del ${model.name}.`,
          type: 'objection_practice',
          targetValue: 1,
          currentValue: 0,
          unit: 'practice',
          status: 'active',
          priority: 'low',
          relatedDeviceId: model.id,
          relatedDeviceName: model.name,
          createdAt: Date.now(),
          date: today,
          expiresAt,
          source: 'commercial_profile'
       });
     }
  }

  // 3. Empujar modelo de alta rentabilidad con stock si no está ya
  if (!existingTypes.has('premium_push') && !existingTypes.has('model_push')) {
    const highMarginModels = catalogModels
      .filter((model) => model.isActive && getModelTotalStock(model) > 2 && getModelBestCommission(model) >= 300)
      .sort((a, b) => getModelTotalStock(b) - getModelTotalStock(a));
    if (highMarginModels.length > 0) {
      const device = toCoachDeviceView(highMarginModels[0]);
      
      newChallenges.push({
          id: `push-${today}-${device.id}`,
          title: 'Venta de Valor',
          description: `Vende 1 ${device.name}: tiene buena comisión ($${device.margin}) y stock.`,
          type: 'premium_push',
          targetValue: 1,
          currentValue: 0,
          unit: 'devices',
          status: 'active',
          priority: 'medium',
          relatedDeviceId: device.id,
          relatedDeviceName: device.name,
          createdAt: Date.now(),
          date: today,
          expiresAt,
          source: 'inventory'
      });
    }
  }

  // Add new challenges up to a max of 3 total active
  for (const nc of newChallenges) {
    if (activeChallenges.length + newChallenges.indexOf(nc) < 3) {
      upsertChallenge(nc);
    }
  }
};

export const updateChallengeProgress = () => {
  const activeChallenges = getChallenges().filter(c => c.status === 'active');
  if (activeChallenges.length === 0) return;

  const today = getAppToday();
  const sales = getSales();
  const todaySales = sales.filter(s => s.date === today);
  const todayPieces = todaySales.reduce((sum, s) => sum + s.quantity, 0);
  const todayCommission = todaySales.reduce((sum, s) => sum + s.amountEarned, 0);

  let updated = false;

  activeChallenges.forEach(c => {
    let newProgress = c.currentValue;

    if (c.type === 'daily_volume') {
      newProgress = todayPieces;
    } else if (c.type === 'daily_revenue') {
      newProgress = todayCommission;
    } else if (c.type === 'model_push' || c.type === 'premium_push') {
      if (c.relatedDeviceId) {
        newProgress = todaySales.filter(s => s.deviceId === c.relatedDeviceId).reduce((sum, s) => sum + s.quantity, 0);
      }
    }

    if (newProgress !== c.currentValue) {
      c.currentValue = newProgress;
      updated = true;
      if (c.currentValue >= c.targetValue) {
        c.status = 'completed';
        c.completedAt = Date.now();
        addPointsBonus({
          amount: getChallengeBonusPoints(c.priority),
          reason: `Reto cumplido: ${c.title}`,
          source: 'challenge',
          relatedId: c.id,
        });
      }
      upsertChallenge(c);
    }
  });

  if (updated) {
    checkAchievements();
  }
};

export const markPracticeCompleted = (deviceId: string) => {
  const activeChallenges = getChallenges().filter(c => c.status === 'active' && c.type === 'objection_practice' && c.relatedDeviceId === deviceId);
  let updated = false;
  activeChallenges.forEach(c => {
    c.currentValue = 1;
    c.status = 'completed';
    c.completedAt = Date.now();
    addPointsBonus({
      amount: getChallengeBonusPoints(c.priority),
      reason: `Reto cumplido: ${c.title}`,
      source: 'challenge',
      relatedId: c.id,
    });
    upsertChallenge(c);
    updated = true;
  });
  if (!updated) {
    addPointsBonus({
      amount: PRACTICE_POINTS,
      reason: 'Práctica de objeciones en catálogo',
      source: 'practice',
      relatedId: `practice-${deviceId}-${getAppToday()}`,
    });
  } else {
    checkAchievements();
  }
};

export const getActiveChallenges = () => {
  return getChallenges().filter(c => c.status === 'active');
};
