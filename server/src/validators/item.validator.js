import { z } from 'zod';
import { CONTENT_TYPES, ITEM_STATUSES, PLATFORMS } from '../constants/item.constants.js';

const GRACE_MS = 60 * 1000; // tolerate a minute of clock/network lag

const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'Enter a valid http(s) link');

const isoDate = z
  .string()
  .datetime({ offset: true, message: 'Use ISO 8601, e.g. 2026-10-10T20:00:00+05:30' })
  .transform((value) => new Date(value));

const futureDate = isoDate.refine(
  (date) => date.getTime() >= Date.now() - GRACE_MS,
  'Reminder time must be in the future'
);

const tags = z
  .array(z.string().trim().toLowerCase().min(1).max(30))
  .max(10, 'You can add up to 10 tags')
  .transform((list) => [...new Set(list)]);

const title = z.string().trim().max(200);
const notes = z.string().trim().max(2000);
const contentType = z.enum(CONTENT_TYPES);

export const createItemSchema = z.object({
  url: httpUrl,
  title: title.optional(),
  notes: notes.optional(),
  tags: tags.optional(),
  contentType: contentType.optional(),
  durationMinutes: z.number().int().min(1).max(600).optional(),
  scheduledAt: futureDate.optional(),
});

export const updateItemSchema = z
  .object({
    title: title.optional(),
    notes: notes.optional(),
    tags: tags.optional(),
    contentType: contentType.optional(),
    durationMinutes: z.number().int().min(1).max(600).nullable().optional(),
    scheduledAt: futureDate.nullable().optional(), // null = remove the reminder
  })
  .refine((data) => Object.keys(data).length > 0, 'Provide at least one field to update');

export const snoozeSchema = z.object({
  minutes: z.number().int().min(5).max(10080), // 5 minutes to 7 days
});

export const listItemsQuerySchema = z.object({
  status: z.enum(ITEM_STATUSES).optional(),
  platform: z.enum(PLATFORMS).optional(),
  contentType: contentType.optional(),
  tag: z.string().trim().toLowerCase().optional(),
  q: z.string().trim().max(100).optional(),
  from: isoDate.optional(),
  to: isoDate.optional(),
  maxDuration: z.coerce.number().int().min(1).max(600).optional(),
  sort: z.enum(['scheduledAt', '-scheduledAt', 'createdAt', '-createdAt']).default('scheduledAt'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const previewSchema = z.object({ url: httpUrl });