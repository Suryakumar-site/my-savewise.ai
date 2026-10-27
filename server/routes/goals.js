import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/goals
router.get('/', authenticateToken, (req, res) => {
  try {
    const goals = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    
    const enriched = goals.map(g => {
      const remaining = Math.max(0, g.target_amount - g.current_amount);
      const progressPercent = g.target_amount > 0 ? Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)) : 0;
      const calculatedMonthly = g.deadline_months > 0 ? Math.ceil(remaining / g.deadline_months) : remaining;

      // Alternative scenarios
      const scenarios = [
        { months: Math.max(1, Math.round(g.deadline_months * 0.75)), label: 'Faster Pace (25% faster)', monthly: Math.ceil(remaining / Math.max(1, Math.round(g.deadline_months * 0.75))) },
        { months: g.deadline_months, label: 'Target Target Timeline', monthly: calculatedMonthly },
        { months: Math.round(g.deadline_months * 1.5), label: 'Relaxed Pace (50% more time)', monthly: Math.ceil(remaining / Math.round(g.deadline_months * 1.5)) }
      ];

      return {
        ...g,
        remaining,
        progressPercent,
        calculatedMonthly,
        scenarios
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch goals.' });
  }
});

// POST /api/goals
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadlineMonths, category } = req.body;

    const target = Number(targetAmount);
    const current = Number(currentAmount) || 0;
    const months = Number(deadlineMonths);

    if (!title || isNaN(target) || target <= 0 || isNaN(months) || months <= 0) {
      return res.status(400).json({ error: 'Please provide valid title, target amount (>0), and deadline in months (>0).' });
    }

    const remaining = Math.max(0, target - current);
    const monthlySaving = Math.ceil(remaining / months);
    const goalId = 'goal_' + uuidv4().slice(0, 8);

    db.prepare(`
      INSERT INTO goals (id, user_id, title, target_amount, current_amount, deadline_months, monthly_saving, category, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(goalId, req.user.id, title.trim(), target, current, months, monthlySaving, category || 'general');

    // Add to timeline
    db.prepare(`
      INSERT INTO timeline_events (id, user_id, event_type, title, description, amount)
      VALUES (?, ?, 'goal_created', 'Created Goal: ' || ?, 'Target: ₹' || ? || ' in ' || ? || ' months (₹' || ? || '/mo)', ?)
    `).run('evt_' + uuidv4().slice(0, 8), req.user.id, title.trim(), target, months, monthlySaving, current);

    res.status(201).json({ message: 'Goal created successfully!', goalId });
  } catch (err) {
    console.error('Goal creation error:', err);
    res.status(500).json({ error: 'Failed to create goal.' });
  }
});

// POST /api/goals/:id/contribute
router.post('/:id/contribute', authenticateToken, (req, res) => {
  try {
    const { contributionAmount } = req.body;
    const amount = Number(contributionAmount);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Please enter a valid contribution amount.' });
    }

    const goal = db.prepare('SELECT * FROM goals WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    const newCurrent = goal.current_amount + amount;
    const status = newCurrent >= goal.target_amount ? 'completed' : 'active';

    db.prepare('UPDATE goals SET current_amount = ?, status = ? WHERE id = ?').run(newCurrent, status, goal.id);

    // Record timeline
    db.prepare(`
      INSERT INTO timeline_events (id, user_id, event_type, title, description, amount)
      VALUES (?, ?, 'goal_contribution', 'Contributed ₹' || ? || ' to ' || ?, 'New balance: ₹' || ?, ?)
    `).run('evt_' + uuidv4().slice(0, 8), req.user.id, amount, goal.title, newCurrent, amount);

    res.json({ message: 'Contribution recorded!', newCurrent, status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add contribution.' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Goal deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete goal.' });
  }
});

export default router;
