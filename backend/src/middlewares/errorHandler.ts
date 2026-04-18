import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
  }

  if (error instanceof ZodError) {
    return response.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return response.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: [
        {
          field: Array.isArray(error.meta?.target) ? String(error.meta?.target[0]) : undefined,
          message: 'Value must be unique',
        },
      ],
    });
  }

  console.error(error);

  return response.status(500).json({
    success: false,
    message: '服务器发生未预期错误',
  });
}
