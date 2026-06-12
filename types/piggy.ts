export interface PiggyGoal {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  dailyDeviceGoal?: number;
}

export type PiggyPeriod = 'day' | 'week' | 'month' | 'year';

export interface CoinAnimationPayload {
  amount: number;
  sourceElement?: string;
  targetElement?: string;
  createdAt: number;
}
