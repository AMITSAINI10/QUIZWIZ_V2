import { Router } from 'express';
import quizzesController from '../controllers/quizzes.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// API endpoints
router.get('/', quizzesController.list);
// Specific routes MUST come before parameter catch-alls
router.get('/add', requireAuth, quizzesController.showAdd);
router.post('/add', requireAuth, quizzesController.add);
router.get('/:id/leaderboard', quizzesController.leaderboard);
router.delete('/:id', requireAuth, quizzesController.deleteQuiz);
router.post('/:id/submit', requireAuth, quizzesController.submit);

// Web views
router.get('/:id/play', requireAuth, quizzesController.play);
router.get('/:id', quizzesController.detail);

export default router;

