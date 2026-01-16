import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema } from '../validators/authValidators';

const router = Router();

router.post(
  '/auth/register',
  validate(registerSchema, 'body'),
  AuthController.register
);
router.post(
  '/auth/login',
  validate(loginSchema, 'body'),
  AuthController.login
);

export default router;
