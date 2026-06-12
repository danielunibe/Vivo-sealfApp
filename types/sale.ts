export interface Sale {
  id: string;
  date: string;
  deviceId: string;
  deviceName: string;
  deviceColor?: string;
  amountEarned: number;
  createdAt: number;
  day: number;
}

export interface Movement {
  id: string;
  type: 'income' | 'expense';
  source: 'sale' | 'other';
  title: string;
  amount: number;
  date: string;
  effectiveDate?: string;
  createdAt: number;
  saleId?: string;
}

export type WorkDayStatus =
  | "pending"
  | "worked"
  | "rest"
  | "not-attended";

export type SalesDayStatus =
  | "empty"
  | "no-sale"
  | "below-goal"
  | "goal-met"
  | "goal-exceeded";

export type CalendarDayStatus =
  | "empty"
  | "no-sale"
  | "below-goal"
  | "goal-met"
  | "goal-exceeded"
  | "rest"
  | "not-attended";

export type CalendarSoldDeviceSummary = {
  deviceId: string;
  deviceName: string;
  colorName: string;
  quantity: number;
  totalEarned: number;
  thumbnailSrc?: string;
};

export type CalendarDayRecord = {
  date: string;
  workDayStatus: WorkDayStatus;
  salesDayStatus: SalesDayStatus;
  manualStatus?: boolean;
  totalEarned: number;
  soldDevices: CalendarSoldDeviceSummary[];
  updatedAt: string;
};
