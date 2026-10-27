import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { optionalAuth, authenticateToken } from './auth.js';
import { LEARNING_CURRICULUM, GLOSSARY_TERMS, DEMAT_PLATFORMS, COMPARISON_DATA } from '../data/financialData.js';

const router = express.Router();

// GET /api/learning/curriculum
router.get('/curriculum', optionalAuth, (req, res) => {
  let userProgress = [];
  if (req.user) {
    userProgress = db.prepare('SELECT lesson_id, quiz_score, completed_at FROM learning_progress WHERE user_id = ?').all(req.user.id);
  }

  const completedSet = new Map(userProgress.map(p => [p.lesson_id, p]));

  // Calculate total lessons and completion stats
  let totalLessons = 0;
  let completedCount = 0;

  const enrichedCurriculum = LEARNING_CURRICULUM.map(level => {
    const enrichedLessons = level.lessons.map(lesson => {
      totalLessons++;
      const isCompleted = completedSet.has(lesson.id);
      if (isCompleted) completedCount++;
      return {
        ...lesson,
        completed: isCompleted,
        quizScore: isCompleted ? completedSet.get(lesson.id).quiz_score : null
      };
    });

    return {
      ...level,
      lessons: enrichedLessons,
      completedLessons: enrichedLessons.filter(l => l.completed).length
    };
  });

  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  res.json({
    curriculum: enrichedCurriculum,
    totalLessons,
    completedCount,
    progressPercentage
  });
});

// POST /api/learning/complete-lesson (Record completion & quiz score)
router.post('/complete-lesson', authenticateToken, (req, res) => {
  try {
    const { lessonId, level, quizScore, lessonTitle } = req.body;

    if (!lessonId || !level) {
      return res.status(400).json({ error: 'Lesson ID and level are required.' });
    }

    db.prepare(`
      INSERT INTO learning_progress (id, user_id, lesson_id, level, quiz_score, completed_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, lesson_id) DO UPDATE SET
        quiz_score = excluded.quiz_score,
        completed_at = CURRENT_TIMESTAMP
    `).run('lp_' + uuidv4().slice(0, 8), req.user.id, lessonId, Number(level), Number(quizScore) || 100);

    // Add to timeline
    db.prepare(`
      INSERT INTO timeline_events (id, user_id, event_type, title, description)
      VALUES (?, ?, 'lesson_completed', 'Completed Lesson: ' || ?, 'Mastered Level ' || ? || ' financial literacy topic')
    `).run('evt_' + uuidv4().slice(0, 8), req.user.id, lessonTitle || lessonId, level);

    res.json({ message: 'Lesson recorded as completed!' });
  } catch (err) {
    console.error('Record lesson error:', err);
    res.status(500).json({ error: 'Failed to record progress.' });
  }
});

// GET /api/learning/glossary
router.get('/glossary', (req, res) => {
  const query = (req.query.search || '').toLowerCase().trim();
  const termsList = Object.values(GLOSSARY_TERMS);

  const results = query 
    ? termsList.filter(t => 
        t.term.toLowerCase().includes(query) || 
        t.simple.toLowerCase().includes(query) ||
        t.technical.toLowerCase().includes(query)
      )
    : termsList;

  res.json({ terms: results });
});

// GET /api/learning/demat-platforms
router.get('/demat-platforms', (req, res) => {
  res.json({
    platforms: DEMAT_PLATFORMS,
    whatIsDemat: 'A Demat Account (Dematerialized Account) converts physical paper share certificates into electronic records held safely with government-regulated depositories (CDSL or NSDL).',
    whenNeeded: 'You need a demat account when buying individual company stocks, ETFs (like Gold BeES or Nifty BeES), and government bonds. You do NOT strictly need a demat account if you only invest in direct mutual funds through AMC websites or MFCentral.',
    disclaimer: 'SaveWise AI provides neutral factual comparisons of SEBI-registered brokers. We do not receive commissions, referral kickbacks, or declare any broker as "the best".'
  });
});

// GET /api/learning/comparisons
router.get('/comparisons', (req, res) => {
  res.json({ comparisons: COMPARISON_DATA });
});

export default router;
