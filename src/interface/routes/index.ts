import { Router } from 'express';
import authRoutes from './auth.routes';
import athleteRoutes from './athlete.routes';
import logRoutes from './log.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/athletes', athleteRoutes);
router.use('/logs', logRoutes);
router.use('/admin', adminRoutes);

export default router;
