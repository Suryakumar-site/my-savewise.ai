import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'savewise-super-secure-production-secret-2026';

// Middleware to authenticate JWT
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
    req.user = user;
    next();
  });
}

// Optional auth for guests who want to plan without mandatory registration
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    else req.user = null;
    next();
  });
}

// REGISTER
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with letters and numbers.' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = 'usr_' + uuidv4().slice(0, 8);

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, 'user')
    `).run(userId, email.toLowerCase().trim(), passwordHash, name.trim());

    // Initialize blank financial profile
    db.prepare(`
      INSERT INTO financial_profiles (user_id, amount, familiarity, goals, time_horizon, risk_comfort, existing_accounts)
      VALUES (?, 1000, 'beginner', '[]', '1-3 years', 'moderate', '[]')
    `).run(userId);

    // Initial timeline entry
    db.prepare(`
      INSERT INTO timeline_events (id, user_id, event_type, title, description)
      VALUES (?, ?, 'account_created', 'Created SaveWise Account', 'Welcome to your private financial journey.')
    `).run('evt_' + uuidv4().slice(0, 8), userId);

    // Create token
    const token = jwt.sign({ id: userId, email: email.toLowerCase().trim(), role: 'user', name: name.trim() }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: userId, email: email.toLowerCase().trim(), name: name.trim(), role: 'user' }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error while registering account.' });
  }
});

// LOGIN
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT id, email, password_hash, name, role FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPass = bcrypt.compareSync(password, user.password_hash);
    if (!validPass) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// CURRENT USER / ME
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const profile = db.prepare('SELECT * FROM financial_profiles WHERE user_id = ?').get(req.user.id);
    if (profile) {
      profile.goals = JSON.parse(profile.goals || '[]');
      profile.existing_accounts = JSON.parse(profile.existing_accounts || '[]');
    }

    res.json({ user, profile });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch user profile.' });
  }
});

// UPDATE FINANCIAL PROFILE
router.post('/profile', authenticateToken, (req, res) => {
  try {
    const { amount, familiarity, goals, time_horizon, risk_comfort, existing_accounts, demat_platform, has_emergency } = req.body;

    db.prepare(`
      INSERT INTO financial_profiles (user_id, amount, familiarity, goals, time_horizon, risk_comfort, existing_accounts, demat_platform, has_emergency, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        amount = excluded.amount,
        familiarity = excluded.familiarity,
        goals = excluded.goals,
        time_horizon = excluded.time_horizon,
        risk_comfort = excluded.risk_comfort,
        existing_accounts = excluded.existing_accounts,
        demat_platform = excluded.demat_platform,
        has_emergency = excluded.has_emergency,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      req.user.id,
      amount || 1000,
      familiarity || 'beginner',
      JSON.stringify(goals || []),
      time_horizon || '1-3 years',
      risk_comfort || 'moderate',
      JSON.stringify(existing_accounts || []),
      demat_platform || '',
      has_emergency ? 1 : 0
    );

    res.json({ message: 'Financial profile saved successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

// DELETE ACCOUNT (GDPR / Privacy Compliance)
router.delete('/delete-account', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.json({ message: 'Account and all associated financial history have been permanently deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Could not delete account.' });
  }
});

export default router;
