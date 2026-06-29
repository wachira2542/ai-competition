import { Request, Response } from 'express';
import { getDb, persistDb } from '../db/database';

export const getActiveProject = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const activeResult = db.exec("SELECT value FROM system_settings WHERE key = 'active_project_id'");
    const activeProjectId = activeResult[0]?.values[0][0] || null;
    
    const pushedResult = db.exec("SELECT value FROM system_settings WHERE key = 'pushed_projects'");
    let pushedProjects: string[] = [];
    if (pushedResult[0]?.values[0][0]) {
      try {
        pushedProjects = JSON.parse(pushedResult[0].values[0][0] as string);
      } catch (e) {}
    }
    
    res.json({ success: true, data: { activeProjectId, pushedProjects } });
  } catch (error) {
    console.error('Error fetching active project:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const setActiveProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;
    const db = await getDb();
    
    // Check if project exists
    if (projectId) {
      const stmt = db.prepare('SELECT id FROM projects WHERE id = ?');
      stmt.bind([projectId]);
      const exists = stmt.step();
      stmt.free();
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }
    }

    db.run(
      "INSERT INTO system_settings (key, value) VALUES ('active_project_id', ?) ON CONFLICT(key) DO UPDATE SET value = ?",
      [projectId || '', projectId || '']
    );
    
    // Also add to pushed_projects
    if (projectId) {
      const pushedResult = db.exec("SELECT value FROM system_settings WHERE key = 'pushed_projects'");
      let pushedProjects: string[] = [];
      if (pushedResult[0]?.values[0][0]) {
        try {
          pushedProjects = JSON.parse(pushedResult[0].values[0][0] as string);
        } catch (e) {}
      }
      if (!pushedProjects.includes(projectId)) {
        pushedProjects.push(projectId);
        db.run(
          "INSERT INTO system_settings (key, value) VALUES ('pushed_projects', ?) ON CONFLICT(key) DO UPDATE SET value = ?",
          [JSON.stringify(pushedProjects), JSON.stringify(pushedProjects)]
        );
      }
    }
    
    persistDb(db);
    res.json({ success: true, message: 'Active project updated successfully', data: { activeProjectId: projectId || null } });
  } catch (error) {
    console.error('Error setting active project:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const clearEvaluations = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    db.run('DELETE FROM evaluations');
    // Also clear pushed_projects and active_project_id
    db.run("DELETE FROM system_settings WHERE key = 'pushed_projects'");
    db.run("DELETE FROM system_settings WHERE key = 'active_project_id'");
    persistDb(db);
    res.json({ success: true, message: 'All evaluation data cleared successfully' });
  } catch (error) {
    console.error('Error clearing evaluations:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
