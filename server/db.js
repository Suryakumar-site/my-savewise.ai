import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'savewise.db');

export const db = new Database(dbPath);

// Enable foreign keys and WAL mode for reliability
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS financial_profiles (
      user_id TEXT PRIMARY KEY,
      amount REAL DEFAULT 1000,
      familiarity TEXT DEFAULT 'beginner',
      goals TEXT DEFAULT '[]',
      time_horizon TEXT DEFAULT '1-3 years',
      risk_comfort TEXT DEFAULT 'moderate',
      existing_accounts TEXT DEFAULT '[]',
      demat_platform TEXT DEFAULT '',
      has_emergency INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      strategy_name TEXT NOT NULL,
      strategy_type TEXT NOT NULL,
      allocation_json TEXT NOT NULL,
      details_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL,
      deadline_months INTEGER NOT NULL,
      monthly_saving REAL NOT NULL,
      category TEXT DEFAULT 'general',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      level INTEGER NOT NULL,
      quiz_score INTEGER DEFAULT 0,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS premium_orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      planning_amount REAL NOT NULL,
      fee_amount REAL NOT NULL,
      payment_id TEXT NOT NULL,
      invoice_no TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'completed',
      payout_bank TEXT,
      payout_upi TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_payout_settings (
      id TEXT PRIMARY KEY,
      account_holder TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      ifsc_code TEXT NOT NULL,
      upi_id TEXT NOT NULL,
      upi_qr_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default admin and demo user if not present
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@savewise.ai');
  if (!existingUser) {
    const passwordHash = bcrypt.hashSync('SaveWise@2026', 10);
    const demoId = 'user_demo_123';
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(demoId, 'demo@savewise.ai', passwordHash, 'Suryakumar Demo', 'user');

    db.prepare(`
      INSERT INTO financial_profiles (user_id, amount, familiarity, goals, time_horizon, risk_comfort, existing_accounts, demat_platform, has_emergency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      demoId,
      1000,
      'beginner',
      JSON.stringify(['Grow slowly', 'Build emergency fund']),
      '1-3 years',
      'moderate',
      JSON.stringify(['Savings bank account', 'UPI']),
      '',
      1
    );

    // Initial timeline events
    db.prepare(`
      INSERT INTO timeline_events (id, user_id, event_type, title, description, amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'evt_1',
      demoId,
      'savings_added',
      'Added ₹1,000 to planning wallet',
      'Started onboarding journey on SAVEWISE AI',
      1000
    );

    db.prepare(`
      INSERT INTO timeline_events (id, user_id, event_type, title, description, amount)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'evt_2',
      demoId,
      'lesson_completed',
      'Completed "Saving vs Investing"',
      'Learned difference between liquid safety and compounding',
      null
    );

    // Initial Goal
    db.prepare(`
      INSERT INTO goals (id, user_id, title, target_amount, current_amount, deadline_months, monthly_saving, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'goal_1',
      demoId,
      'Emergency Fund (3 Months)',
      30000,
      8000,
      12,
      1833.33,
      'emergency'
    );
  }

  // Seed Admin
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@savewise.ai');
  if (!existingAdmin) {
    const adminHash = bcrypt.hashSync('AdminWise@2026', 10);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin_system_01', 'admin@savewise.ai', adminHash, 'System Administrator', 'admin');
  }

  // Safe migration for existing DB
  try { db.prepare('ALTER TABLE premium_orders ADD COLUMN payout_bank TEXT').run(); } catch (e) {}
  try { db.prepare('ALTER TABLE premium_orders ADD COLUMN payout_upi TEXT').run(); } catch (e) {}

  // Seed Admin Payout Credentials if empty
  const existingPayout = db.prepare('SELECT id FROM admin_payout_settings WHERE id = ?').get('default_admin_payout');
  if (!existingPayout) {
    db.prepare(`
      INSERT INTO admin_payout_settings (id, account_holder, bank_name, account_number, ifsc_code, upi_id, upi_qr_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      'default_admin_payout',
      'SaveWise Operations (Admin Account)',
      'HDFC Bank Ltd',
      '50200084920193',
      'HDFC0000240',
      'savewise.admin@hdfcbank',
      'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=savewise.admin@hdfcbank&pn=SaveWise%20Operations'
    );
  }
}
