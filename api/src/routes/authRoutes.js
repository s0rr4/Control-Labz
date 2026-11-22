import { Router } from 'express';
import { login, logout, register, verify } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/verify', authenticate, verify);

export default router;
