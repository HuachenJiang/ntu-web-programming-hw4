import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

const eventInclude = {
  location: true,
} satisfies Prisma.EventInclude;

export const eventRepository = {
  findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: eventInclude,
    });
  },

  count(where: Prisma.EventWhereInput) {
    return prisma.event.count({ where });
  },

  findMany(where: Prisma.EventWhereInput, skip: number, take: number) {
    return prisma.event.findMany({
      where,
      include: eventInclude,
      orderBy: [{ completedDate: 'desc' }, { createdAt: 'desc' }],
      skip,
      take,
    });
  },

  create(data: Prisma.EventCreateInput) {
    return prisma.event.create({
      data,
      include: eventInclude,
    });
  },

  update(id: string, data: Prisma.EventUpdateInput) {
    return prisma.event.update({
      where: { id },
      data,
      include: eventInclude,
    });
  },

  delete(id: string) {
    return prisma.event.delete({
      where: { id },
      include: eventInclude,
    });
  },
};
