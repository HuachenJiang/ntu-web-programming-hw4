import type { User } from '@prisma/client';
import { prisma } from '../config/prisma';

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  createUser(data: Pick<User, 'name' | 'email'> & { passwordHash: string }) {
    return prisma.user.create({
      data,
    });
  },
};
