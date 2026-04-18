import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

function parseOptionalNumber(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = Number(value);
  return Number.isNaN(number) ? value : number;
}

export const idParamsSchema = z.object({
  id: z.string().uuid('id 必须是合法 UUID'),
});

export const pageQuerySchema = z.object({
  page: z.preprocess(parseOptionalNumber, z.number().int().positive().default(1)),
  limit: z.preprocess(parseOptionalNumber, z.number().int().positive().max(100).default(10)),
});

export const isoDateSchema = z
  .string()
  .regex(dateRegex, '日期格式必须为 YYYY-MM-DD')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)), '日期格式不合法');

export const routePointSchema = z.object({
  label: z.string().trim().min(1, '路线点 label 必填'),
  address: z.string().trim().min(1, '路线点 address 必填'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  placeId: z.string().trim().optional(),
});

export const routePlanSchema = z.object({
  origin: routePointSchema,
  destination: routePointSchema,
  waypoints: z.array(routePointSchema).default([]),
  distanceKm: z.number().nonnegative(),
  durationMinutes: z.number().int().nonnegative(),
  overviewPolyline: z.string().optional(),
});

export const locationInputSchema = z.object({
  name: z.string().trim().min(1, '地点名称必填').max(100),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  address: z.string().trim().min(1, '地址必填').max(255),
  latitude: z.number().min(-90, '纬度必须介于 -90 到 90').max(90, '纬度必须介于 -90 到 90'),
  longitude: z.number().min(-180, '经度必须介于 -180 到 180').max(180, '经度必须介于 -180 到 180'),
  category: z.enum(['trailhead', 'viewpoint', 'checkpoint', 'destination']),
  placeId: z.string().trim().optional(),
});

export function createTextSearchSchema() {
  return z.object({
    q: z.string().trim().optional(),
    category: z.string().trim().optional(),
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
    page: pageQuerySchema.shape.page,
    limit: pageQuerySchema.shape.limit,
  });
}
