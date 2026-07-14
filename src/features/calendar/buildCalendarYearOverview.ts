import { DailyChallenge, PhoneModel, SaleRecord } from '../../types';
import { buildCalendarMonthDays } from './buildCalendarMonthDays';

const MONTH_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export type YearOverviewDot = {
  dateIso: string;
  day: string;
  state: string;
};

export type YearOverviewMonth = {
  month: number;
  label: string;
  dots: YearOverviewDot[];
};

export type YearStateCounts = Record<string, number>;

type BuildYearParams = {
  year: number;
  sales: SaleRecord[];
  challenges: DailyChallenge[];
  goal: number;
  phoneModels: PhoneModel[];
  appTodayStr: string;
  earliestIso: string;
};

export function buildCalendarYearOverview({
  year,
  sales,
  challenges,
  goal,
  phoneModels,
  appTodayStr,
  earliestIso,
}: BuildYearParams): { months: YearOverviewMonth[]; counts: YearStateCounts } {
  const counts: YearStateCounts = {
    superado: 0,
    logrado: 0,
    parcial: 0,
    falta: 0,
    libre: 0,
  };

  const months = MONTH_SHORT.map((label, month) => {
    const monthDays = buildCalendarMonthDays({
      year,
      month,
      sales,
      challenges,
      goal,
      phoneModels,
      appTodayStr,
      earliestIso,
    });

    const dots = monthDays
      .filter((day) => day.isSelectable && day.dateIso && day.state !== 'vacio' && day.state !== 'pendiente')
      .map((day) => ({
        dateIso: day.dateIso,
        day: day.day,
        state: day.state,
      }));

    dots.forEach((dot) => {
      if (counts[dot.state] !== undefined) {
        counts[dot.state] += 1;
      }
    });

    return { month, label, dots };
  });

  return { months, counts };
}
