import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/tasks', requireAuth, TaskController.create);
router.get('/tasks', requireAuth, TaskController.list);
router.get('/tasks/:id', requireAuth, TaskController.getById);
router.put('/tasks/:id', requireAuth, TaskController.update);
router.delete('/tasks/:id', requireAuth, TaskController.remove);

export default router;
