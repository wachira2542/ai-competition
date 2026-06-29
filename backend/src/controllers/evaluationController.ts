import { Request, Response, NextFunction } from 'express';
import { getDb, persistDb } from '../db/database';
import { queryAll, queryOne } from '../db/migrations';
import { AuthRequest } from '../middleware/authMiddleware';

function parseEvaluation(row: Record<string, unknown>) {
  return {
    ...row,
    scores: typeof row.scores === 'string' ? JSON.parse(row.scores) : row.scores,
  };
}

// GET /api/evaluations
// Groups by project_id and returns average scores
export const getAllEvaluations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = await getDb();
    const rows = queryAll(db, `
      SELECT 
        e.project_id,
        json_group_array(json_object(
          'user_id', e.user_id,
          'scores', e.scores,
          'comment', e.comment,
          'total_score', e.total_score,
          'username', u.username
        )) as details,
        AVG(e.total_score) as avg_total_score,
        COUNT(e.user_id) as judge_count
      FROM evaluations e
      JOIN users u ON e.user_id = u.id
      GROUP BY e.project_id
    `);

    const aggregated = rows.map(row => {
      const detailsStr = row.details as string;
      const details = JSON.parse(detailsStr).map((d: any) => ({
        ...d,
        scores: JSON.parse(d.scores)
      }));

      // Calculate average scores per criteria
      const avgScores: Record<string, number> = {};
      const criteriaKeys = Object.keys(details[0].scores || {});
      
      criteriaKeys.forEach(k => {
        let sum = 0;
        details.forEach((d: any) => {
          sum += parseFloat(d.scores[k] || 0);
        });
        avgScores[k] = parseFloat((sum / details.length).toFixed(2));
      });

      return {
        project_id: row.project_id,
        total_score: parseFloat((row.avg_total_score as number).toFixed(2)),
        scores: avgScores,
        judge_count: row.judge_count,
        details: req.user?.role === 'admin' ? details : undefined // Only admin sees who scored what
      };
    });

    // Sort by avg_total_score DESC
    aggregated.sort((a, b) => b.total_score - a.total_score);

    res.json({ success: true, data: aggregated });
  } catch (err) {
    next(err);
  }
};

// GET /api/evaluations/me
// Gets all evaluations made by the CURRENT logged in user
export const getMyEvaluations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const db = await getDb();
    const rows = queryAll(db, 'SELECT * FROM evaluations WHERE user_id = ?', [userId]);
    
    res.json({ success: true, data: rows.map(parseEvaluation) });
  } catch (err) {
    next(err);
  }
};


// GET /api/evaluations/:projectId
// Only gets the evaluation of the CURRENT logged in user (judges getting their own scores)
export const getEvaluationByProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const db = await getDb();
    const row = queryOne(db, 'SELECT * FROM evaluations WHERE project_id = ? AND user_id = ?', [req.params.projectId, userId]);
    
    if (!row) {
      res.status(404).json({ success: false, message: 'Evaluation not found' });
      return;
    }
    res.json({ success: true, data: parseEvaluation(row) });
  } catch (err) {
    next(err);
  }
};

// POST /api/evaluations — Upsert for the current user
export const createOrUpdateEvaluation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { project_id, scores, comment, total_score } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!project_id || scores === undefined || total_score === undefined) {
      res.status(400).json({ success: false, message: 'project_id, scores, and total_score are required' });
      return;
    }

    const db = await getDb();

    // Validate project exists
    const project = queryOne(db, 'SELECT id FROM projects WHERE id = ?', [project_id]);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const scoresJson = typeof scores === 'string' ? scores : JSON.stringify(scores);
    const now = new Date().toISOString();

    // Check if evaluation exists for this user
    const existing = queryOne(db, 'SELECT id FROM evaluations WHERE project_id = ? AND user_id = ?', [project_id, userId]);

    if (existing) {
      db.run(
        'UPDATE evaluations SET scores = ?, comment = ?, total_score = ?, updated_at = ? WHERE project_id = ? AND user_id = ?',
        [scoresJson, comment || '', total_score, now, project_id, userId]
      );
    } else {
      db.run(
        'INSERT INTO evaluations (project_id, user_id, scores, comment, total_score, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [project_id, userId, scoresJson, comment || '', total_score, now, now]
      );
    }

    persistDb(db);

    const updated = queryOne(db, 'SELECT * FROM evaluations WHERE project_id = ? AND user_id = ?', [project_id, userId]);
    res.json({ success: true, data: parseEvaluation(updated!) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/evaluations/:projectId
export const deleteEvaluation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Only admins can delete? Or users delete their own? Let's say users delete their own.
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const db = await getDb();
    
    if (req.user?.role === 'admin') {
      db.run('DELETE FROM evaluations WHERE project_id = ?', [req.params.projectId]);
    } else {
      db.run('DELETE FROM evaluations WHERE project_id = ? AND user_id = ?', [req.params.projectId, userId]);
    }
    
    persistDb(db);
    res.json({ success: true, message: 'Evaluation deleted' });
  } catch (err) {
    next(err);
  }
};
