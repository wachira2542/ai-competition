import { Request, Response } from 'express';
import { getDb, persistDb } from '../db/database';
import { queryAll } from '../db/migrations';

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

export const getAllJudges = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const judges = queryAll(db, "SELECT id, username FROM users WHERE role = 'user'");
    res.json({ success: true, data: judges });
  } catch (error) {
    console.error('Error fetching judges:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const addJudge = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const db = await getDb();

    // Check if user already exists
    const existing = queryAll(db, 'SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    db.run(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, hash, 'user']
    );
    
    persistDb(db);
    res.json({ success: true, message: 'Judge added successfully' });
  } catch (error) {
    console.error('Error adding judge:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const addProject = async (req: Request, res: Response) => {
  try {
    const { id, name, team } = req.body;
    if (!id || !name || !team) {
      return res.status(400).json({ success: false, message: 'Id, name, and team are required' });
    }

    const db = await getDb();

    // Check if project already exists
    const existing = queryAll(db, 'SELECT id FROM projects WHERE id = ?', [id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Project ID already exists' });
    }

    db.run(
      'INSERT INTO projects (id, name, team) VALUES (?, ?, ?)',
      [id, name, team]
    );
    
    persistDb(db);
    res.json({ success: true, message: 'Project added successfully' });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, team } = req.body;
    if (!name || !team) {
      return res.status(400).json({ success: false, message: 'Name and team are required' });
    }

    const db = await getDb();
    const existing = queryAll(db, 'SELECT id FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    db.run(
      'UPDATE projects SET name = ?, team = ? WHERE id = ?',
      [name, team, id]
    );
    
    persistDb(db);
    res.json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    const existing = queryAll(db, 'SELECT id FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // SQLite FOREIGN KEY ON DELETE CASCADE might not be active (depends on PRAGMA), 
    // so let's delete evaluations manually just to be safe.
    db.run('DELETE FROM evaluations WHERE project_id = ?', [id]);
    db.run('DELETE FROM projects WHERE id = ?', [id]);
    
    persistDb(db);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateJudge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;
    
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const db = await getDb();
    const existing = queryAll(db, 'SELECT id FROM users WHERE id = ? AND role = ?', [id, 'user']);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Judge not found' });
    }

    // Check if new username exists for someone else
    const existingUser = queryAll(db, 'SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    if (password) {
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      db.run('UPDATE users SET username = ?, password_hash = ? WHERE id = ?', [username, hash, id]);
    } else {
      db.run('UPDATE users SET username = ? WHERE id = ?', [username, id]);
    }
    
    persistDb(db);
    res.json({ success: true, message: 'Judge updated successfully' });
  } catch (error) {
    console.error('Error updating judge:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteJudge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    const existing = queryAll(db, 'SELECT id FROM users WHERE id = ? AND role = ?', [id, 'user']);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Judge not found' });
    }

    // Delete evaluations by this judge to be safe
    db.run('DELETE FROM evaluations WHERE user_id = ?', [id]);
    db.run('DELETE FROM users WHERE id = ?', [id]);
    
    persistDb(db);
    res.json({ success: true, message: 'Judge deleted successfully' });
  } catch (error) {
    console.error('Error deleting judge:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
