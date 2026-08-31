import { Request, Response, NextFunction } from 'express';
import { productService } from './service';
import { createProductSchema, updateProductSchema, productQuerySchema } from './validation';
import { z } from 'zod';

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = productQuerySchema.parse(req.query);
      const result = await productService.getAll(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const query = productQuerySchema.parse(req.query);
      const result = await productService.getAllAdmin(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid product ID' });
        return;
      }
      const product = await productService.getById(id);
      res.json({ product });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createProductSchema.parse(req.body);
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      const product = await productService.create(data, imageUrl);
      res.status(201).json({ message: 'Product created', product });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid product ID' });
        return;
      }
      const data = updateProductSchema.parse(req.body);
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      const product = await productService.update(id, data, imageUrl);
      res.json({ message: 'Product updated', product });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid product ID' });
        return;
      }
      await productService.delete(id);
      res.json({ message: 'Product deleted' });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await productService.getCategories();
      res.json({ categories });
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.bulkDelete();
      res.json({ message: 'All products deleted', count: result.count });
    } catch (error) {
      next(error);
    }
  }

  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = z.array(createProductSchema).parse(req.body);
      const result = await productService.bulkCreate(data);
      res.status(201).json({ message: 'Products created', count: result.count });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
