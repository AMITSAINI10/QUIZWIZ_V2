import { Router } from 'express';
import auth from '../controllers/auth.js';

const router = Router();

router.get('/login', auth.showLogin);
router.post('/login', auth.login);
router.get('/signup', auth.showSignup);
router.post('/signup', auth.signup);
router.post('/logout', auth.logout);
router.get('/me', auth.me);

export default router;



