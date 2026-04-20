import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';

export const postRepository = {
  findById(id: string) {
    return prisma.post.findUnique({
      where: { id },
    });
  },

  count(where: Prisma.PostWhereInput) {
    return prisma.post.count({ where });
  },

  findMany(where: Prisma.PostWhereInput, skip: number, take: number) {
    return prisma.post.findMany({
      where,
      orderBy: [{ completedDate: 'desc' }, { createdAt: 'desc' }],
      skip,
      take,
    });
  },

  create(data: Prisma.PostUncheckedCreateInput) {
    return prisma.post.create({
      data,
    });
  },

  update(id: string, data: Prisma.PostUncheckedUpdateInput) {
    return prisma.post.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  },
};
