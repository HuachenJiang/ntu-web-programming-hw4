import { z } from 'zod';
import { idParamsSchema, locationInputSchema, pageQuerySchema } from './common';

function parseOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = Number(value);
  return Number.isNaN(number) ? value : number;
}

export const locationParamsSchema = idParamsSchema;

export const listLocationsQuerySchema = pageQuerySchema
  .extend({
    q: z.string().trim().optional(),
    category: z.enum(['trailhead', 'viewpoint', 'checkpoint', 'destination']).optional(),
    lat: z.preprocess(parseOptionalNumber, z.number().min(-90).max(90).optional()),
    lng: z.preprocess(parseOptionalNumber, z.number().min(-180).max(180).optional()),
    radius: z.preprocess(parseOptionalNumber, z.number().positive().optional()),
  })
  .refine((query) => (query.lat === undefined && query.lng === undefined) || (query.lat !== undefined && query.lng !== undefined), {
    message: 'lat 与 lng 必须同时提供',
    path: ['lat'],
  })
  .refine((query) => query.radius === undefined || (query.lat !== undefined && query.lng !== undefined), {
    message: 'radius 需要搭配 lat 与 lng 使用',
    path: ['radius'],
  });

export const createLocationSchema = locationInputSchema;

export const updateLocationSchema = locationInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, '至少要提供一个要更新的栏位');
