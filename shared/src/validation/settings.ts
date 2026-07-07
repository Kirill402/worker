import { z } from 'zod';

export const bonusTierSchema = z.object({
  threshold: z.number().min(0, { message: 'Threshold must be 0 or greater' }),
  amount: z.number().min(0, { message: 'Amount must be 0 or greater' }),
});

export const settingsSchema = z.object({
  monthlySalary: z.number().min(0, { message: 'Salary must be 0 or greater' }),
  rateWeekdayOvertime: z.number().min(0, { message: 'Weekday overtime rate must be 0 or greater' }),
  rateSaturdayOvertime: z.number().min(0, { message: 'Saturday overtime rate must be 0 or greater' }),
  bonusTiers: z.array(bonusTierSchema).min(1, { message: 'At least one bonus tier is required' }),
});

export type BonusTierInput = z.infer<typeof bonusTierSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
