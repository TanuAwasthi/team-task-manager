import express from 'express';
import {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  addMemberToProject,
  removeMemberFromProject,
  deleteProject,
} from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createProject);
router.get('/', getMyProjects);
router.get('/:projectId', getProjectById);
router.put('/:projectId', updateProject);
router.post('/:projectId/members', addMemberToProject);
router.delete('/:projectId/members/:userId', removeMemberFromProject);
router.delete('/:projectId', deleteProject);

export default router;
