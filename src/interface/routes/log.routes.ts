import { Router } from 'express';
import { createLog, getLog, listLogs, updateLog, deleteLog } from '../controllers/log.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createLogSchema, updateLogSchema, listLogsSchema, idParamSchema } from '../schemas/log.schema';

const router = Router();

router.use(authenticate);

router.get('/', validate({ query: listLogsSchema }), listLogs);
router.post('/', validate({ body: createLogSchema }), createLog);
router.get('/:id', validate({ params: idParamSchema }), getLog);
router.put('/:id', validate({ params: idParamSchema, body: updateLogSchema }), updateLog);
router.delete('/:id', validate({ params: idParamSchema }), deleteLog);

export default router;
