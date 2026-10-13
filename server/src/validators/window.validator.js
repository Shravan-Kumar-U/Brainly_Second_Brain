import { z } from 'zod';

const days = z
  .array(z.number().int().min(0).max(6))
  .min(1, 'Pick at least one day')
  .max(7)
  .transform((list) => [...new Set(list)].sort((a, b) => a - b));

const fields = z.object({
  name: z.string().trim().min(1, 'Name is required').max(40, 'Name must be at most 40 characters'),
  days,
  startMinutes: z.number().int().min(0).max(1439),
  endMinutes: z.number().int().min(1).max(1440),
});

export const createWindowSchema = fields.refine((data) => data.endMinutes > data.startMinutes, {
  message: 'End must be after start',
  path: ['endMinutes'],
});

// A partial update is checked against the stored values by the model itself
export const updateWindowSchema = fields
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'Provide at least one field to update');

export const suggestQuerySchema = z.object({
  minutes: z.coerce.number().int().min(1).max(600).optional(),
});