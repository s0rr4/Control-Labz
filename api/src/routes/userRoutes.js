import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { changeUserRole, listUsers } from '../controllers/userController.js';

const router = Router();

router.use(authenticate, authorize('ADMIN'));
router.get('/', listUsers);
router.patch('/:id/role', changeUserRole);

export default router;
