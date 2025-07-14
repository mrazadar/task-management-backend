import { Router } from 'express';

import { createTask, uploadHandler } from '../controllers/tasks.js';

const router = Router();

router.post('/tasks', createTask);
router.post('/tasks/upload', uploadHandler);

export default router;
