import type { EventCategory, EventStatus, Prisma } from '@prisma/client';
import { eventRepository } from '../repositories/eventRepository';
import { AppError } from '../utils/appError';
import { parseDateOnly } from '../utils/date';
import { normalizePagination } from '../utils/pagination';
import { serializeEvent } from '../utils/serializers';

interface EventListInput {
  userId: string;
  q?: string;
  category?: EventCategory;
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

interface RoutePointInput {
  label: string;
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface RoutePlanInput {
  origin: RoutePointInput;
  destination: RoutePointInput;
  waypoints: RoutePointInput[];
  distanceKm: number;
  durationMinutes: number;
  overviewPolyline?: string;
}

interface LocationInput {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  category: 'trailhead' | 'viewpoint' | 'checkpoint' | 'destination';
  placeId?: string;
}

interface EventCreateInput {
  title: string;
  description?: string;
  category: EventCategory;
  status: EventStatus;
  completedDate: string;
  distanceKm?: number;
  durationMinutes?: number;
  notes: string;
  location: LocationInput;
  routePlan: RoutePlanInput;
}

type EventUpdateInput = Partial<EventCreateInput>;

function buildEventWhere(input: EventListInput): Prisma.EventWhereInput {
  return {
    ownerId: input.userId,
    ...(input.q
      ? {
          OR: [
            { title: { contains: input.q, mode: 'insensitive' } },
            { description: { contains: input.q, mode: 'insensitive' } },
            { notes: { contains: input.q, mode: 'insensitive' } },
            { location: { name: { contains: input.q, mode: 'insensitive' } } },
          ],
        }
      : {}),
    ...(input.category ? { category: input.category } : {}),
    ...((input.from || input.to)
      ? {
          completedDate: {
            ...(input.from ? { gte: parseDateOnly(input.from) } : {}),
            ...(input.to ? { lte: parseDateOnly(input.to) } : {}),
          },
        }
      : {}),
  };
}

export const eventService = {
  async list(input: EventListInput) {
    const where = buildEventWhere(input);
    const { page, limit, skip, take } = normalizePagination(input);
    const [events, total] = await Promise.all([
      eventRepository.findMany(where, skip, take),
      eventRepository.count(where),
    ]);

    return {
      data: events.map((event) => serializeEvent(event)),
      meta: {
        page,
        limit,
        total,
      },
    };
  },

  async getById(id: string, userId: string) {
    const event = await eventRepository.findById(id);

    if (!event) {
      throw new AppError(404, '找不到这笔徒步记录');
    }

    if (event.ownerId !== userId) {
      throw new AppError(403, '无权读取其他使用者的徒步记录');
    }

    return serializeEvent(event);
  },

  async create(input: EventCreateInput, userId: string) {
    const event = await eventRepository.create({
      owner: {
        connect: {
          id: userId,
        },
      },
      title: input.title,
      description: input.description || undefined,
      category: input.category,
      status: input.status,
      completedDate: parseDateOnly(input.completedDate),
      distanceKm: input.distanceKm ?? input.routePlan.distanceKm,
      durationMinutes: input.durationMinutes ?? input.routePlan.durationMinutes,
      notes: input.notes,
      routePlanJson: input.routePlan as unknown as Prisma.InputJsonValue,
      location: {
        create: {
          name: input.location.name,
          description: input.location.description || undefined,
          address: input.location.address,
          latitude: input.location.latitude,
          longitude: input.location.longitude,
          category: input.location.category,
          placeId: input.location.placeId,
          owner: {
            connect: {
              id: userId,
            },
          },
        },
      },
    });

    return serializeEvent(event);
  },

  async update(id: string, input: EventUpdateInput, userId: string) {
    const existingEvent = await eventRepository.findById(id);

    if (!existingEvent) {
      throw new AppError(404, '找不到要更新的徒步记录');
    }

    if (existingEvent.ownerId !== userId) {
      throw new AppError(403, '无权修改其他使用者的徒步记录');
    }

    const nextRoutePlan = input.routePlan ?? (existingEvent.routePlanJson as unknown as RoutePlanInput);
    const event = await eventRepository.update(id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.completedDate !== undefined ? { completedDate: parseDateOnly(input.completedDate) } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
      ...(input.routePlan !== undefined
        ? { routePlanJson: input.routePlan as unknown as Prisma.InputJsonValue }
        : {}),
      ...(input.distanceKm !== undefined || input.routePlan !== undefined
        ? { distanceKm: input.distanceKm ?? nextRoutePlan.distanceKm }
        : {}),
      ...(input.durationMinutes !== undefined || input.routePlan !== undefined
        ? { durationMinutes: input.durationMinutes ?? nextRoutePlan.durationMinutes }
        : {}),
      ...(input.location
        ? {
            location: {
              update: {
                name: input.location.name,
                description: input.location.description || null,
                address: input.location.address,
                latitude: input.location.latitude,
                longitude: input.location.longitude,
                category: input.location.category,
                placeId: input.location.placeId,
              },
            },
          }
        : {}),
    });

    return serializeEvent(event);
  },

  async remove(id: string, userId: string) {
    const existingEvent = await eventRepository.findById(id);

    if (!existingEvent) {
      throw new AppError(404, '找不到要删除的徒步记录');
    }

    if (existingEvent.ownerId !== userId) {
      throw new AppError(403, '无权删除其他使用者的徒步记录');
    }

    const event = await eventRepository.delete(id);
    return serializeEvent(event);
  },
};
