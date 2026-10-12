import { z } from 'zod';

import { COLLECTION_COLORS } from '../constants/collection.constants.js';

const name = z.string().trim().min(1, 'Name is required').max(40, 'Name must be at most 40 characters');
const description = z.string().trim().max(200, 'Description must be at most 200 characters');
const color = z.enum(COLLECTION_COLORS);

export const createCollectionSchema = z.object({
  name,
  description: description.optional(),
  color: color.optional(),
});

export const updateCollectionSchema = z
  .object({
    name: name.optional(),
    description: description.optional(),
    color: color.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'Provide at least one field to update');