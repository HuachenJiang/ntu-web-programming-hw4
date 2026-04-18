import type { Response } from 'express';
import type { PaginationMeta } from '../types/api';

export function sendSuccess<T>(
  response: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: PaginationMeta,
) {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}
