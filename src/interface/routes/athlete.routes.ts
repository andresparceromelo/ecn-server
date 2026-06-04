import { Router } from 'express';
import { getProfile, createProfile, getPlan, getAthleteStats } from '../controllers/athlete.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createProfileSchema } from '../schemas/athlete.schema';
import { planQuerySchema } from '../schemas/plan.schema';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.post('/profile', authenticate, validate({ body: createProfileSchema }), createProfile);
router.get('/plan', authenticate, validate({ query: planQuerySchema }), getPlan);
router.get('/stats', authenticate, getAthleteStats);

export default router;
