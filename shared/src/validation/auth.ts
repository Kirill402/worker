import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Must be a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(100, { message: 'Password is too long' }),
});

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(50, { message: 'Name is too long' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
