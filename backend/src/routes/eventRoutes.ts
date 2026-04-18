import { Router } from 'express';
import { eventController } from '../controllers/eventController';
import { authenticate } from '../middlewares/authenticate';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createEventSchema,
  eventParamsSchema,
  listEventsQuerySchema,
  updateEventSchema,
} from '../validators/eventValidators';

const eventRoutes = Router();

eventRoutes.use(authenticate);
eventRoutes.get('/', validateRequest({ query: listEventsQuerySchema }), asyncHandler(eventController.list));
eventRoutes.get('/:id', validateRequest({ params: eventParamsSchema }), asyncHandler(eventController.getById));
eventRoutes.post('/', validateRequest({ body: createEventSchema }), asyncHandler(eventController.create));
eventRoutes.patch(
  '/:id',
  validateRequest({ params: eventParamsSchema, body: updateEventSchema }),
  asyncHandler(eventController.update),
);
eventRoutes.delete('/:id', validateRequest({ params: eventParamsSchema }), asyncHandler(eventController.remove));

export { eventRoutes };
