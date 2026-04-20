import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export const locationRepository = {
  findById(id: string) {
    return prisma.location.findUnique({
      where: { id },
    });
  },

  create(data: Prisma.LocationUncheckedCreateInput) {
    return prisma.location.create({
      data,
    });
  },

  update(id: string, data: Prisma.LocationUncheckedUpdateInput) {
    return prisma.location.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.location.delete({
      where: { id },
    });
  },

  findMany(where: Prisma.LocationWhereInput) {
    return prisma.location.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },
};
