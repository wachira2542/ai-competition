import { Router } from 'express';
import { getActiveProject, setActiveProject, clearEvaluations } from '../controllers/adminController';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Everyone (who is logged in) can read the active project
router.get('/active-project', requireAuth, getActiveProject);

// Only admins can set the active project
router.post('/active-project', requireAuth, requireAdmin, setActiveProject);

// Admin can clear all evaluations
router.delete('/clear-evaluations', requireAuth, requireAdmin, clearEvaluations);

export default router;
