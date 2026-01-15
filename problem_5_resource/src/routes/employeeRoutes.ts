import { Router } from 'express';
import { EmployeeController } from '../controllers/employeeController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/employees', requireAuth, EmployeeController.create);
router.get('/employees', requireAuth, EmployeeController.list);
router.get('/employees/:id', requireAuth, EmployeeController.getById);
router.put('/employees/:id', requireAuth, EmployeeController.update);
router.delete('/employees/:id', requireAuth, EmployeeController.remove);

export default router;
