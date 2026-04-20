import type { ErrorDetail } from '../types/api';

export class AppError extends Error {
  statusCode: number;
  errors?: ErrorDetail[];

  constructor(statusCode: number, message: string, errors?: ErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
