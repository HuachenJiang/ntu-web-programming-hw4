import type { Prisma } from '@prisma/client';
import { locationRepository } from '../repositories/locationRepository';
import { AppError } from '../utils/appError';
import { calculateDistanceMeters } from '../utils/distance';
import { normalizePagination } from '../utils/pagination';
import { serializeLocation } from '../utils/serializers';

interface LocationListInput {
  userId: string;
  q?: string;
  category?: 'trailhead' | 'viewpoint' | 'checkpoint' | 'destination';
  lat?: number;
  lng?: number;
  radius?: number;
  page: number;
  limit: number;
}

interface LocationMutationInput {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  category: 'trailhead' | 'viewpoint' | 'checkpoint' | 'destination';
  placeId?: string;
}

export const locationService = {
  async list(input: LocationListInput) {
    const where: Prisma.LocationWhereInput = {
      ownerId: input.userId,
      ...(input.q
        ? {
            OR: [
              { name: { contains: input.q, mode: 'insensitive' } },
              { description: { contains: input.q, mode: 'insensitive' } },
              { address: { contains: input.q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(input.category ? { category: input.category } : {}),
    };

    const allLocations = await locationRepository.findMany(where);
    const filteredLocations =
      input.lat !== undefined && input.lng !== undefined && input.radius !== undefined
        ? allLocations.filter((location) => {
            const distance = calculateDistanceMeters(
              input.lat!,
              input.lng!,
              location.latitude,
              location.longitude,
            );

            return distance <= input.radius!;
          })
        : allLocations;

    const { page, limit, skip, take } = normalizePagination(input);
    const data = filteredLocations
      .slice(skip, skip + take)
      .map((location) => serializeLocation(location));

    return {
      data,
      meta: {
        page,
        limit,
        total: filteredLocations.length,
      },
    };
  },

  async getById(id: string, userId: string) {
    const location = await locationRepository.findById(id);

    if (!location) {
      throw new AppError(404, '找不到这笔地点资料');
    }

    if (location.ownerId !== userId) {
      throw new AppError(403, '无权读取其他使用者的地点资料');
    }

    return serializeLocation(location);
  },

  async create(input: LocationMutationInput, userId: string) {
    const location = await locationRepository.create({
      ownerId: userId,
      name: input.name,
      description: input.description || undefined,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      category: input.category,
      placeId: input.placeId,
    });

    return serializeLocation(location);
  },

  async update(id: string, input: Partial<LocationMutationInput>, userId: string) {
    const existingLocation = await locationRepository.findById(id);

    if (!existingLocation) {
      throw new AppError(404, '找不到要更新的地点资料');
    }

    if (existingLocation.ownerId !== userId) {
      throw new AppError(403, '无权修改其他使用者的地点资料');
    }

    const location = await locationRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
      ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.placeId !== undefined ? { placeId: input.placeId } : {}),
    });

    return serializeLocation(location);
  },

  async remove(id: string, userId: string) {
    const existingLocation = await locationRepository.findById(id);

    if (!existingLocation) {
      throw new AppError(404, '找不到要删除的地点资料');
    }

    if (existingLocation.ownerId !== userId) {
      throw new AppError(403, '无权删除其他使用者的地点资料');
    }

    const location = await locationRepository.delete(id);
    return serializeLocation(location);
  },
};
