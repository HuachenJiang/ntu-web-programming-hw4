import { Router } from 'express';
import { locationController } from '../controllers/locationController';
import { authenticate } from '../middlewares/authenticate';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createLocationSchema,
  listLocationsQuerySchema,
  locationParamsSchema,
  updateLocationSchema,
} from '../validators/locationValidators';

const locationRoutes = Router();

locationRoutes.use(authenticate);
locationRoutes.get('/', validateRequest({ query: listLocationsQuerySchema }), asyncHandler(locationController.list));
locationRoutes.get('/:id', validateRequest({ params: locationParamsSchema }), asyncHandler(locationController.getById));
locationRoutes.post('/', validateRequest({ body: createLocationSchema }), asyncHandler(locationController.create));
locationRoutes.patch(
  '/:id',
  validateRequest({ params: locationParamsSchema, body: updateLocationSchema }),
  asyncHandler(locationController.update),
);
locationRoutes.delete('/:id', validateRequest({ params: locationParamsSchema }), asyncHandler(locationController.remove));

export { locationRoutes };
