import { Router } from 'express';

import {
  createTask,
  multerUpload,
  uploadHandler,
} from '../controllers/tasks.js';

const router = Router();

router.post('/', createTask);
router.post('/upload', multerUpload.single('file'), uploadHandler);

export default router;
