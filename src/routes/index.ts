import { Router } from 'express';
import quizzesRouter from './quizzes.js';
import homeController from '../controllers/home.js';
import authRouter from './auth.js';
import resultsRouter from './results.js';
import feedbackController from '../controllers/feedback.js';
import quizzesController from '../controllers/quizzes.js';

const router = Router();

router.get('/', homeController.index);
router.get('/quizzes', quizzesController.list);
router.use('/api/quizzes', quizzesRouter);
router.use('/quizzes', quizzesRouter);
router.get('/feedback', feedbackController.index);
router.use('/', authRouter);
router.use('/results', resultsRouter);

export default router;

