import { z } from 'zod';
import { idParamsSchema, isoDateSchema, locationInputSchema, pageQuerySchema, routePlanSchema } from './common';

export const eventParamsSchema = idParamsSchema;

export const listEventsQuerySchema = pageQuerySchema
  .extend({
    q: z.string().trim().optional(),
    category: z.enum(['ridge', 'forest', 'coast', 'urban']).optional(),
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
  })
  .refine((query) => !query.from || !query.to || query.from <= query.to, {
    message: 'from 不得晚于 to',
    path: ['from'],
  });

export const createEventSchema = z.object({
  title: z.string().trim().min(1, '路线标题必填').max(100),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  category: z.enum(['ridge', 'forest', 'coast', 'urban']),
  status: z.enum(['planned', 'completed', 'canceled']),
  completedDate: isoDateSchema,
  distanceKm: z.number().nonnegative().optional(),
  durationMinutes: z.number().int().nonnegative().optional(),
  notes: z.string().trim().min(1, '心得必填').max(2000),
  location: locationInputSchema,
  routePlan: routePlanSchema,
});

export const updateEventSchema = createEventSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, '至少要提供一个要更新的栏位');
