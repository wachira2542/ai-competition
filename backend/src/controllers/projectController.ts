import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/database';
import { queryAll, queryOne } from '../db/migrations';

// GET /api/projects
export const getAllProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = await getDb();
    const projects = queryAll(db, 'SELECT * FROM projects ORDER BY team, id');
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
export const getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = await getDb();
    const project = queryOne(db, 'SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};
