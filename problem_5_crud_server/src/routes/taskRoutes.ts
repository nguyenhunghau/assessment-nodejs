import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  taskQuerySchema,
} from '../validators/taskValidators';

const router = Router();

router.post(
  '/tasks',
  requireAuth,
  validate(createTaskSchema, 'body'),
  TaskController.create
);
router.get(
  '/tasks',
  requireAuth,
  validate(taskQuerySchema, 'query'),
  TaskController.list
);
router.get(
  '/tasks/:id',
  requireAuth,
  validate(taskIdSchema, 'params'),
  TaskController.getById
);
router.put(
  '/tasks/:id',
  requireAuth,
  validate(taskIdSchema, 'params'),
  validate(updateTaskSchema, 'body'),
  TaskController.update
);
router.delete(
  '/tasks/:id',
  requireAuth,
  validate(taskIdSchema, 'params'),
  TaskController.remove
);

export default router;
