import React from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Target, TrendingUp } from 'lucide-react';
import { SaleRecord } from '../../types';
import { WalletHeroCard } from './WalletHeroCard';
import { MovementList } from './MovementList';
import { getPeriodMoneyProjection } from '../../lib/analytics';
import { getClosingForecast } from '../../lib/coach';
import { getAppToday, parseLocalDateKey } from '../../lib/date';
import { getAppSettings } from '../../lib/storage';

const dashboardVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 240, damping: 24, mass: 0.8 }
  }
};

interface PiggyBankDashboardProps {
  sales: SaleRecord[];
  savingsGoal: number;
  totalEarned: number;
  progressPercent: number;
  remainingAmount: number;
  todayEarned: number;
  todayPieces: number;
  todayProgressPercent: number;
  dailyGoal: number;
  onOpenEditMode: (sale: SaleRecord) => void;
}

const formatCurrency = (amount: number) => `$${Math.round(amount).toLocaleString('es-MX')}`;

const stackedPeriods: { id: 'week' | 'month' | 'year'; label: string }[] = [
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'year', label: 'Año' },
];

export function PiggyBankDashboard({
  sales,
  savingsGoal,
  totalEarned,
  progressPercent,
  remainingAmount,
  todayEarned,
  todayPieces,
  todayProgressPercent,
  dailyGoal,
  onOpenEditMode,
}: PiggyBankDashboardProps) {
  const forecast = getClosingForecast();
  const settings = getAppSettings();
  const todayDate = parseLocalDateKey(getAppToday());
  const currentDate = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(todayDate);

  const periodMoneyGoals = {
    week: Math.round(Math.max(settings.commissionGoal || 0, 0) / 4),
    month: Math.max(settings.commissionGoal || 0, 0),
    year: Math.round(Math.max(settings.commissionGoal || 0, 0) * 12),
  };

  const periodSummaries = stackedPeriods.map((period) => {
    const projection = getPeriodMoneyProjection(sales, period.id);
    const moneyGoal = periodMoneyGoals[period.id];
    const projectedProgress = moneyGoal > 0
      ? Math.min(100, Math.round((projection.projectedCommission / moneyGoal) * 100))
      : 0;

    return {
      ...period,
      ...projection,
      moneyGoal,
      projectedProgress,
    };
  });

  const paceLabel = forecast?.riskLevel === 'Meta cumplida'
    ? 'Objetivo cumplido'
    : forecast?.requiredDailyPace
      ? `${formatCurrency(forecast.requiredDailyPace)}/día`
      : 'Sin ritmo requerido';
  const paceCaption = forecast?.riskLevel === 'Meta cumplida'
    ? 'Todo lo extra suma'
    : 'Ritmo para llegar';

  return (
    <motion.div
      key="dashboard-view"
      variants={dashboardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex flex-col gap-2.5"
    >
      <motion.div variants={itemVariants}>
        <WalletHeroCard
          totalEarned={todayEarned}
          savingsGoal={dailyGoal}
          progressPercent={todayProgressPercent}
          salesCount={todayPieces}
          currentDate={currentDate}
          goalCaption="Meta del día"
          goalDisplay={`${dailyGoal} equipos`}
          progressCaption="Avance diario"
        />
      </motion.div>
      <motion.div
        variants={itemVariants}
        className="vivo-surface-on-pattern overflow-hidden rounded-[1.2rem]"
      >
        {periodSummaries.map((period, index) => (
          <div
            key={period.id}
            className={`relative px-3 py-2 ${index > 0 ? 'border-t border-[var(--glass-border)]' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[0.54rem] font-black uppercase tracking-widest text-[var(--neo-muted)]">
                    {period.label}
                  </span>
                  <span className="shrink-0 text-[0.5rem] font-semibold text-[var(--neo-muted)]">
                    {Math.round(period.elapsed.percent)}% · {period.elapsed.caption}
                  </span>
                </div>
                <div className="mt-0.5 flex items-end justify-between gap-2">
                  <p className="text-[0.98rem] font-black leading-none text-[var(--neo-text)]">
                    {formatCurrency(period.projectedCommission)}
                  </p>
                  <p className="shrink-0 text-[0.52rem] font-bold text-[var(--neo-muted)]">
                    {formatCurrency(period.currentCommission)} acum.
                  </p>
                </div>
                {(period.currentPieces > 0 || period.moneyGoal > 0) && (
                  <p className="mt-0.5 truncate text-[0.5rem] font-semibold leading-tight text-[var(--neo-muted)]">
                    {period.currentPieces > 0 && (
                      <>
                        {period.currentPieces} eq. × {formatCurrency(Math.round(period.avgCommissionPerPiece))}
                      </>
                    )}
                    {period.currentPieces > 0 && period.moneyGoal > 0 && ' · '}
                    {period.moneyGoal > 0 && (
                      <span className="text-[var(--neo-accent)]">
                        Meta {formatCurrency(period.moneyGoal)} · {period.projectedProgress}%
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${period.moneyGoal > 0 ? period.projectedProgress : period.elapsed.percent}%` }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--neo-accent)] to-indigo-500 shadow-[0_0_6px_rgba(74,114,255,0.28)]"
              />
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
        <div className="vivo-surface-on-pattern rounded-[1.2rem] p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Target size={15} className="text-amber-500" />
            <span className="text-[0.58rem] font-black uppercase tracking-widest text-[var(--neo-muted)]">Por lograr</span>
          </div>
          <p className="text-[1.12rem] font-black text-[var(--neo-text)]">{remainingAmount > 0 ? formatCurrency(remainingAmount) : 'Cumplido'}</p>
          <p className="text-[0.62rem] font-bold text-[var(--neo-muted)]">Objetivo {formatCurrency(savingsGoal)}</p>
        </div>

        <div className="vivo-surface-on-pattern rounded-[1.2rem] p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp size={15} className="text-emerald-500" />
            <span className="text-[0.58rem] font-black uppercase tracking-widest text-[var(--neo-muted)]">Ritmo</span>
          </div>
          <p className="text-[1.12rem] font-black text-[var(--neo-text)]">{paceLabel}</p>
          <p className="text-[0.62rem] font-bold text-[var(--neo-muted)]">{paceCaption}</p>
        </div>
      </motion.div>


      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <div className="flex items-center px-1">
          <h3 className="text-[0.68rem] font-black uppercase tracking-widest text-[var(--neo-muted)] flex items-center gap-1.5">
            <CalendarDays size={13} /> Últimos movimientos
          </h3>
        </div>
        {sales.length === 0 ? (
          <div className="min-h-[38px] rounded-full border border-dashed border-[var(--glass-border)] bg-white/45 dark:bg-[var(--neo-surface-soft)] px-3 py-2 flex items-center text-[0.68rem] font-bold text-[var(--neo-muted)]">
            Sin ventas registradas todavía.
          </div>
        ) : (
          <MovementList
            sales={sales}
            mode="recent"
            initialLimit={8}
            showSort={false}
            onOpenEditMode={onOpenEditMode}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
