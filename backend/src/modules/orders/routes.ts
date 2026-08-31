import { Router } from 'express';
import { orderController } from './controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/roleGuard';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.post('/', (req, res, next) => orderController.createOrder(req, res, next));
router.get('/', (req, res, next) => orderController.getOrders(req, res, next));
router.get('/:id', (req, res, next) => orderController.getOrderById(req, res, next));
router.patch(
  '/:id/status',
  requireRole('ADMIN'),
  (req, res, next) => orderController.updateStatus(req, res, next)
);

export default router;
