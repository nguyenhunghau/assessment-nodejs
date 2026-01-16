import { Router } from 'express';
import { EmployeeController } from '../controllers/employeeController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdSchema,
  employeePaginationSchema,
} from '../validators/employeeValidators';

const router = Router();

router.post(
  '/employees',
  requireAuth,
  validate(createEmployeeSchema, 'body'),
  EmployeeController.create
);
router.get(
  '/employees',
  requireAuth,
  validate(employeePaginationSchema, 'query'),
  EmployeeController.list
);
router.get(
  '/employees/:id',
  requireAuth,
  validate(employeeIdSchema, 'params'),
  EmployeeController.getById
);
router.put(
  '/employees/:id',
  requireAuth,
  validate(employeeIdSchema, 'params'),
  validate(updateEmployeeSchema, 'body'),
  EmployeeController.update
);
router.delete(
  '/employees/:id',
  requireAuth,
  validate(employeeIdSchema, 'params'),
  EmployeeController.remove
);

export default router;
