import express from 'express';
import {
  createTask,
  getProjectTasks,
  updateTask,
  getTaskStats,
  deleteTask,
} from '../controllers/taskController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/:projectId/tasks', createTask);
router.get('/:projectId/tasks', getProjectTasks);
router.get('/:projectId/tasks/stats', getTaskStats);
router.put('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);

export default router;
