import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/appError';

export function notFound(request: Request, _response: Response, next: NextFunction) {
  next(new AppError(404, `找不到路由 ${request.method} ${request.originalUrl}`));
}
