import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

interface ValidateRequestOptions {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export function validateRequest(options: ValidateRequestOptions) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (options.body) {
      request.body = options.body.parse(request.body);
    }

    if (options.params) {
      request.params = options.params.parse(request.params);
    }

    if (options.query) {
      request.query = options.query.parse(request.query);
    }

    next();
  };
}
