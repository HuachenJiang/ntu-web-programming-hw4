import { Router } from 'express';
import { sendSuccess } from '../utils/response';

const healthRoutes = Router();

healthRoutes.get('/', (_request, response) =>
  sendSuccess(response, 200, 'Backend is healthy', {
    status: 'ok',
  }),
);

export { healthRoutes };
