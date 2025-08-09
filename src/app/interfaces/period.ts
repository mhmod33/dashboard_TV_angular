export interface Period {
  id: number;
  period_code: string;
  display_name: string;
  months: number;
  days: number;
  display_order: number;
  active: boolean;
  price?: number; // Optional, for Default Prices integration
  plan?: number; // Optional, for Default Prices integration
  duration_months: number;
}

export interface PeriodRoot {
  message: string;
  periods: Period[];
}