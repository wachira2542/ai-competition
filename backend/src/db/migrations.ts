import { Database } from 'sql.js';
import { getDb, persistDb } from './database';

interface ProjectSeed {
  id: string;
  name: string;
  team: string;
  objective: string;
  tech_stack: string;
  target_users: string;
}

const rawProjects = [
  { id: 'AH:1', name: 'AI Camera Inspection for Line TBAS', team: 'AH' },
  { id: 'AH:2', name: 'AH Press line 4 (Ghost line)', team: 'AH' },
  { id: 'AHP:1', name: 'Smart M365 Learning portal', team: 'AHP' },
  { id: 'AHP:2', name: 'AI Camera Cira Core', team: 'AHP' },
  { id: 'AHA:1', name: 'AI-BASED LASER MACHINE BOOKING SYSTEM', team: 'AHA' },
  { id: 'AHA:2', name: 'SMART 3D STORE MANAGEMENT SYSTEM', team: 'AHA' },
  { id: 'AHT:1', name: 'SMART CNC MACHINE PLANNING', team: 'AHT' },
  { id: 'AHT:2', name: 'AI-SPECIAL CAM UNIT', team: 'AHT' },
  { id: 'APC:1', name: 'AI Meeting Minutes & Action Tracking Assistant', team: 'APC' },
  { id: 'AS:1', name: 'AI-powered Feasibility Assistant for Fast Decision Making', team: 'AS' },
  { id: 'AF:1', name: 'E-Work Permit', team: 'AF' },
  { id: 'AF:2', name: 'Smart AI Safety Vision System', team: 'AF' },
  { id: 'ASP:1', name: 'AI สรุปรายงาน PM Jigs อัตโนมัติ', team: 'ASP' },
  { id: 'AA:1', name: 'AI analysis tool', team: 'AA' }
];

const INITIAL_PROJECTS: ProjectSeed[] = rawProjects.map(p => ({
  ...p,
  objective: '',
  tech_stack: '',
  target_users: ''
}));

export async function runMigrations(): Promise<void> {
  const db = await getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team TEXT NOT NULL,
      objective TEXT DEFAULT '',
      tech_stack TEXT DEFAULT '',
      target_users TEXT DEFAULT ''
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Drop old evaluations table if it exists (since we are changing schema dramatically)
  // In a real app we'd do a proper migration, but this is a fresh change
  try {
    const tableInfo = db.exec("PRAGMA table_info(evaluations)");
    if (tableInfo.length > 0) {
      const columns = tableInfo[0].values.map(col => col[1]);
      if (!columns.includes('user_id')) {
        db.run('DROP TABLE evaluations');
      }
    }
  } catch (e) {
    // Ignore error if table doesn't exist
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      scores TEXT NOT NULL DEFAULT '{}',
      comment TEXT DEFAULT '',
      total_score REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(project_id, user_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Always attempt to insert any new projects (existing ones will be ignored)
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO projects (id, name, team, objective, tech_stack, target_users)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const p of INITIAL_PROJECTS) {
    stmt.run([p.id, p.name, p.team, p.objective, p.tech_stack, p.target_users]);
  }
  stmt.free();
  console.log(`✅ Ensured ${INITIAL_PROJECTS.length} projects are seeded`);

  // Seed Users if empty
  const userCountRes = db.exec('SELECT COUNT(*) as c FROM users');
  const userCount = userCountRes[0]?.values[0][0] as number;
  
  if (userCount === 0) {
    const crypto = require('crypto');
    const hash = (pass: string) => crypto.createHash('sha256').update(pass).digest('hex');
    
    const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
    stmt.run(['admin', hash('admin'), 'admin']);
    stmt.run(['judge1', hash('1234'), 'user']);
    stmt.run(['judge2', hash('1234'), 'user']);
    stmt.run(['judge3', hash('1234'), 'user']);
    stmt.free();
    console.log('✅ Seeded 4 users (1 admin, 3 judges)');
  }

  // Add specific judges
  const crypto = require('crypto');
  const hash = (pass: string) => crypto.createHash('sha256').update(pass).digest('hex');
  const userStmt = db.prepare('INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)');
  userStmt.run(['Sattha.p', hash('aapico@001'), 'user']);
  userStmt.run(['Saranyoo.k', hash('aapico@002'), 'user']);
  userStmt.run(['Pitchawat.t', hash('aapico@003'), 'user']);
  userStmt.run(['Soknath.m', hash('aapico@004'), 'user']);
  userStmt.free();
  console.log('✅ Ensured specific judges are added');

  persistDb(db);
  console.log('✅ Database migrations completed');
}

export function queryAll(db: Database, sql: string, params: (string | number | null)[] = []): Record<string, unknown>[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as Record<string, unknown>);
  }
  stmt.free();
  return rows;
}

export function queryOne(db: Database, sql: string, params: (string | number | null)[] = []): Record<string, unknown> | null {
  const rows = queryAll(db, sql, params);
  return rows[0] ?? null;
}
