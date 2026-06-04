import { Router } from 'express';
import { getProfile, createProfile, getPlan, getAthleteStats, uploadAvatar } from '../controllers/athlete.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createProfileSchema } from '../schemas/athlete.schema';
import { planQuerySchema } from '../schemas/plan.schema';
import { uploadAvatar as uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.post('/profile', authenticate, validate({ body: createProfileSchema }), createProfile);
router.get('/plan', authenticate, validate({ query: planQuerySchema }), getPlan);
router.get('/stats', authenticate, getAthleteStats);
router.post('/avatar', authenticate, uploadMiddleware.single('avatar'), uploadAvatar);

export default router;
