import { Router } from 'express';

import authRoutes from './authRoutes';
import employeeRoutes from './employeeRoutes';
import taskRoutes from './taskRoutes';

const router = Router();

router.use(authRoutes);
router.use(employeeRoutes);
router.use(taskRoutes);

export default router;
