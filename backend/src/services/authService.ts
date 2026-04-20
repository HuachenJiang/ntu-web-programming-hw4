import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { authRepository } from '../repositories/authRepository';
import type { AuthTokenPayload } from '../types/auth';
import { AppError } from '../utils/appError';
import { serializeUser } from '../utils/serializers';

function createToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export const authService = {
  async register(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await authRepository.findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new AppError(422, 'Validation failed', [
        {
          field: 'email',
          message: '这个邮箱已经注册过了',
        },
      ]);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authRepository.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    return {
      user: serializeUser(user),
      token: createToken({
        sub: user.id,
        email: user.email,
      }),
    };
  },

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await authRepository.findUserByEmail(normalizedEmail);

    if (!user) {
      throw new AppError(401, '邮箱或密码不正确');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      throw new AppError(401, '邮箱或密码不正确');
    }

    return {
      user: serializeUser(user),
      token: createToken({
        sub: user.id,
        email: user.email,
      }),
    };
  },

  async getCurrentUser(userId: string) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      throw new AppError(404, '找不到当前用户');
    }

    return serializeUser(user);
  },
};
