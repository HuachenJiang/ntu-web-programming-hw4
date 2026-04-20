import { Router } from 'express';
import { postController } from '../controllers/postController';
import { authenticate } from '../middlewares/authenticate';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createPostSchema,
  listPostsQuerySchema,
  postParamsSchema,
  updatePostSchema,
} from '../validators/postValidators';

const postRoutes = Router();

postRoutes.use(authenticate);
postRoutes.get('/', validateRequest({ query: listPostsQuerySchema }), asyncHandler(postController.list));
postRoutes.get('/:id', validateRequest({ params: postParamsSchema }), asyncHandler(postController.getById));
postRoutes.post('/', validateRequest({ body: createPostSchema }), asyncHandler(postController.create));
postRoutes.patch(
  '/:id',
  validateRequest({ params: postParamsSchema, body: updatePostSchema }),
  asyncHandler(postController.update),
);
postRoutes.delete('/:id', validateRequest({ params: postParamsSchema }), asyncHandler(postController.remove));

export { postRoutes };
