import { Router } from 'express';
import { cartController } from './controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', (req, res, next) => cartController.getCart(req, res, next));
router.get('/count', (req, res, next) => cartController.getCount(req, res, next));
router.post('/', (req, res, next) => cartController.addToCart(req, res, next));
router.put('/:id', (req, res, next) => cartController.updateQuantity(req, res, next));
router.delete('/clear', (req, res, next) => cartController.clearCart(req, res, next));
router.delete('/:id', (req, res, next) => cartController.removeItem(req, res, next));

export default router;
