import { z } from 'zod';

const GRACE_MS = 60 * 1000;

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const ids = z
  .array(objectId)
  .min(1, 'Select at least one item')
  .max(100, 'You can change up to 100 items at once')
  .transform((list) => [...new Set(list)]);

const futureDate = z
  .string()
  .datetime({ offset: true, message: 'Use ISO 8601, e.g. 2026-10-18T20:00:00+05:30' })
  .transform((value) => new Date(value))
  .refine((date) => date.getTime() >= Date.now() - GRACE_MS, 'Reminder time must be in the future');

const tags = z
  .array(z.string().trim().toLowerCase().min(1).max(30))
  .min(1, 'Add at least one tag')
  .max(10, 'You can add up to 10 tags')
  .transform((list) => [...new Set(list)]);

export const bulkSchema = z.discriminatedUnion('action', [
  z.object({ ids, action: z.literal('complete') }),
  z.object({ ids, action: z.literal('archive') }),
  z.object({ ids, action: z.literal('restore') }),
  z.object({ ids, action: z.literal('delete') }),
  z.object({ ids, action: z.literal('schedule'), scheduledAt: futureDate.nullable() }),
  z.object({ ids, action: z.literal('tag'), tags }),
  z.object({ ids, action: z.literal('move'), collection: objectId.nullable() }),
]);