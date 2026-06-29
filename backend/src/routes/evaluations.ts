import { Router } from 'express';
import {
  getAllEvaluations,
  getEvaluationByProject,
  createOrUpdateEvaluation,
  deleteEvaluation,
  getMyEvaluations,
} from '../controllers/evaluationController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, getAllEvaluations);
router.get('/me', requireAuth, getMyEvaluations);
router.get('/:projectId', requireAuth, getEvaluationByProject);
router.post('/', requireAuth, createOrUpdateEvaluation);
router.delete('/:projectId', requireAuth, deleteEvaluation);

export default router;
