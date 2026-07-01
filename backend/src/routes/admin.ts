import { Router } from 'express';
import { getActiveProject, setActiveProject, clearEvaluations, getAllJudges, addJudge, addProject, updateProject, deleteProject, updateJudge, deleteJudge } from '../controllers/adminController';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Everyone (who is logged in) can read the active project
router.get('/active-project', requireAuth, getActiveProject);

// Only admins can set the active project
router.post('/active-project', requireAuth, requireAdmin, setActiveProject);

// Admin can clear all evaluations
router.delete('/clear-evaluations', requireAuth, requireAdmin, clearEvaluations);

// Admin can get all judges
router.get('/judges', requireAuth, requireAdmin, getAllJudges);

// Admin can add a judge
router.post('/judges', requireAuth, requireAdmin, addJudge);
router.put('/judges/:id', requireAuth, requireAdmin, updateJudge);
router.delete('/judges/:id', requireAuth, requireAdmin, deleteJudge);

// Admin can add a project
router.post('/projects', requireAuth, requireAdmin, addProject);
router.put('/projects/:id', requireAuth, requireAdmin, updateProject);
router.delete('/projects/:id', requireAuth, requireAdmin, deleteProject);

export default router;
