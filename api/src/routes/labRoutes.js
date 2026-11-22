import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createAssignment,
  createComputer,
  createEquipment,
  listAssignments,
  listComputers,
  releaseAssignment,
} from '../controllers/labController.js';

const router = Router();

router.use(authenticate);

router.get('/computers', listComputers);
router.post('/computers', authorize('ADMIN'), createComputer);
router.post('/equipment', authorize('ADMIN'), createEquipment);
router.post('/assignments', createAssignment);
router.get('/assignments', listAssignments);
router.patch('/assignments/:id/release', releaseAssignment);

export default router;
