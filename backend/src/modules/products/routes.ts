import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { productController } from './controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/roleGuard';

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = Router();

// Public routes
router.get('/', (req, res, next) => productController.getAll(req, res, next));
router.get('/categories', (req, res, next) => productController.getCategories(req, res, next));
router.get('/:id', (req, res, next) => productController.getById(req, res, next));

// Admin-only routes
router.get('/admin/all', authenticate, requireRole('ADMIN'), (req, res, next) =>
  productController.getAllAdmin(req, res, next)
);
router.delete('/admin/bulk-delete', authenticate, requireRole('ADMIN'), (req, res, next) =>
  productController.bulkDelete(req, res, next)
);
router.post('/admin/bulk-create', authenticate, requireRole('ADMIN'), (req, res, next) =>
  productController.bulkCreate(req, res, next)
);
router.post('/', authenticate, requireRole('ADMIN'), upload.single('image'), (req, res, next) =>
  productController.create(req, res, next)
);
router.put('/:id', authenticate, requireRole('ADMIN'), upload.single('image'), (req, res, next) =>
  productController.update(req, res, next)
);
router.delete('/:id', authenticate, requireRole('ADMIN'), (req, res, next) =>
  productController.delete(req, res, next)
);

export default router;
