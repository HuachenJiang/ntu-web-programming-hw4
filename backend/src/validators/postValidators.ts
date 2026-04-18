import { z } from 'zod';
import { idParamsSchema, isoDateSchema, pageQuerySchema } from './common';

export const postParamsSchema = idParamsSchema;

export const listPostsQuerySchema = pageQuerySchema
  .extend({
    q: z.string().trim().optional(),
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
  })
  .refine((query) => !query.from || !query.to || query.from <= query.to, {
    message: 'from 不得晚于 to',
    path: ['from'],
  });

export const createPostSchema = z.object({
  title: z.string().trim().min(1, '心得标题必填').max(100),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  content: z.string().trim().min(1, '心得内容必填').max(5000),
  eventId: z.string().uuid('eventId 必须是合法 UUID'),
  completedDate: isoDateSchema,
});

export const updatePostSchema = createPostSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, '至少要提供一个要更新的栏位');
