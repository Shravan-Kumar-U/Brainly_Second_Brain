import { z } from 'zod';

import { isValidTimezone } from '../utils/time.util.js';

export const updatePreferencesSchema = z
  .object({
    timezone: z.string().refine(isValidTimezone, 'Invalid timezone').optional(),
    weeklyReview: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Provide at least one setting to change');