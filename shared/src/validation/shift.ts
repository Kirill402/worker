import { z } from 'zod';

export const processSchema = z.object({
  name: z.string().min(1, { message: 'Process name is required' }).max(100),
  normMinutes: z.number().positive({ message: 'Norm must be greater than 0' }),
});

export const shiftSegmentSchema = z.object({
  processId: z.string().uuid({ message: 'Invalid process ID' }),
  startTime: z.string().datetime({ message: 'Invalid segment start time' }),
  endTime: z.string().datetime({ message: 'Invalid segment end time' }).optional(),
  quantity: z.number().int().min(0, { message: 'Quantity must be 0 or greater' }),
});

export const manualShiftSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' }),
  startTime: z.string().datetime({ message: 'Invalid start time' }),
  durationMinutes: z.number().int().positive({ message: 'Duration must be positive' }),
  processId: z.string().uuid({ message: 'Invalid process ID' }),
  quantity: z.number().int().min(0, { message: 'Quantity must be 0 or greater' }),
});

export type ProcessInput = z.infer<typeof processSchema>;
export type ShiftSegmentInput = z.infer<typeof shiftSegmentSchema>;
export type ManualShiftInput = z.infer<typeof manualShiftSchema>;

export const updateShiftSegmentSchema = z.object({
  quantity: z.number().int().min(0, { message: 'Quantity must be 0 or greater' }),
  processId: z.string().uuid({ message: 'Invalid process ID' }).optional(),
});

export const updateShiftSchema = z.object({
  startTime: z.string().datetime({ message: 'Invalid start time' }).optional(),
  endTime: z.string().datetime({ message: 'Invalid end time' }).optional(),
});

export type UpdateShiftSegmentInput = z.infer<typeof updateShiftSegmentSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;

