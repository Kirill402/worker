export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'ADMIN' | 'PROVIDER';
  createdAt: string;
}

export interface Session {
  token: string;
  user: User;
}

export interface BonusTier {
  threshold: number;
  amount: number;
}

export interface Setting {
  id: string;
  userId: string;
  monthlySalary: number;
  rateWeekdayOvertime: number;
  rateSaturdayOvertime: number;
  bonusTiers: BonusTier[];
}

export interface Process {
  id: string;
  userId: string;
  name: string;
  normMinutes: number;
  createdAt: string;
}

export interface ShiftSegment {
  id: string;
  shiftId: string;
  processId: string;
  process?: Process;
  startTime: string;
  endTime?: string | null;
  quantity: number;
  createdAt: string;
}

export interface Shift {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime?: string | null;
  isFinalized: boolean;
  segments: ShiftSegment[];
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface SalaryCalculationResult {
  avgEff: number | null;
  bonus: number;
  overtimeSum: number;
  total: number;
  shiftsCount: number;
  hoursRegular: number;
  hoursOvertime: number;
  hoursWeekend: number;
  hoursTotal: number;
}
