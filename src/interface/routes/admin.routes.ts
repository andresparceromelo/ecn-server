import { Router } from 'express';
import { getDashboard, getCharts } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

router.get('/dashboard', authenticate, authorize('ADMIN'), getDashboard);
router.get('/charts', authenticate, authorize('ADMIN'), getCharts);

export default router;
