import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { getDb } from '../db/mongo.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const user = (req.session as any).user;
  const db = getDb();
  const attempts = await db.collection('attempts').find({ user_id: user.id }).sort({ created_at: -1 }).toArray();
  const quizIds = Array.from(new Set(attempts.map((a: any) => a.quiz_id)));
  const quizzes = await db.collection('quizzes').find({ id: { $in: quizIds } }).project({ id: 1, title: 1 }).toArray();
  const idToTitle = new Map<number, string>(quizzes.map((q: any) => [q.id, q.title]));
  const rows = attempts.map((a: any) => ({ ...a, title: idToTitle.get(a.quiz_id) || 'Quiz' }));
  res.render('results/me', { title: 'My Results', attempts: rows });
});

router.get('/me/quiz/:id', requireAuth, async (req, res) => {
  const user = (req.session as any).user;
  const quizId = Number(req.params.id);
  const db = getDb();
  const quiz = await db.collection('quizzes').findOne({ id: quizId });
  const rows = await db
    .collection('attempts')
    .find({ user_id: user.id, quiz_id: quizId })
    .sort({ created_at: -1 })
    .toArray();
  if (!quiz) {
    return res.redirect('/results/me');
  }
  res.render('results/quiz.ejs', { title: 'My Scores', quiz, attempts: rows });
});

router.get('/all', requireAdmin, async (_req, res) => {
  const db = getDb();
  const attempts = await db.collection('attempts').find({}).sort({ created_at: -1 }).toArray();
  const quizIds = Array.from(new Set(attempts.map((a: any) => a.quiz_id)));
  const quizzes = await db.collection('quizzes').find({ id: { $in: quizIds } }).project({ id: 1, title: 1 }).toArray();
  const idToTitle = new Map<number, string>(quizzes.map((q: any) => [q.id, q.title]));
  const rows = attempts.map((a: any) => ({ ...a, title: idToTitle.get(a.quiz_id) || 'Quiz' }));
  res.render('results/all', { title: 'All Results', attempts: rows });
});

export default router;

