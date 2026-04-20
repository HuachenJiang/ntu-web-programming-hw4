import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middlewares/authenticate';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema, registerSchema } from '../validators/authValidators';

const authRoutes = Router();

authRoutes.post('/register', validateRequest({ body: registerSchema }), asyncHandler(authController.register));
authRoutes.post('/login', validateRequest({ body: loginSchema }), asyncHandler(authController.login));
authRoutes.post('/logout', authenticate, asyncHandler(authController.logout));
authRoutes.get('/me', authenticate, asyncHandler(authController.me));

export { authRoutes };
