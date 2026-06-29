import { Request, Response } from 'express';
import { getDb } from '../db/database';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aapico_super_secret_key_2026';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const db = await getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)');
    stmt.bind([username]);
    const userRow = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();

    if (!userRow) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    if (userRow.password_hash !== hash) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: userRow.id, username: userRow.username, role: userRow.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { id: userRow.id, username: userRow.username, role: userRow.role }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
