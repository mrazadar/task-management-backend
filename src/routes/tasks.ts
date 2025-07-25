import { Router } from 'express';

import {
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
  createTask,
  multerUpload,
  uploadHandler,
  streamTaskEvents,
} from '../controllers/tasks.js';

const router = Router();

router.get('/', getAllTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/', createTask);
router.post('/upload', multerUpload.single('file'), uploadHandler);

// stream task events
router.get('/stream', streamTaskEvents);

export default router;
