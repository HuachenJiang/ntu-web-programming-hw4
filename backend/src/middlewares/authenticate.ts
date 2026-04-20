import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthTokenPayload } from '../types/auth';
import { AppError } from '../utils/appError';

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  const header = request.header('Authorization');

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, '未认证，请先提供 Bearer token'));
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    request.auth = {
      userId: payload.sub,
      email: payload.email,
    };
    return next();
  } catch (_error) {
    return next(new AppError(401, 'JWT 无效或已过期'));
  }
}
