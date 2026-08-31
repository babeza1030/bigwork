import { Response, NextFunction } from 'express';
import { cartService } from './service';
import { addToCartSchema, updateCartSchema } from './validation';
import { AuthRequest } from '../../middleware/auth';

export class CartController {
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.getCart(req.user!.id);
      res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = addToCartSchema.parse(req.body);
      const item = await cartService.addToCart(req.user!.id, data);
      res.status(201).json({ message: 'Item added to cart', item });
    } catch (error: any) {
      if (
        error.message?.includes('not found') ||
        error.message?.includes('Insufficient stock')
      ) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async updateQuantity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cartItemId = parseInt(String(req.params.id));
      if (isNaN(cartItemId)) {
        res.status(400).json({ message: 'Invalid cart item ID' });
        return;
      }
      const data = updateCartSchema.parse(req.body);
      const item = await cartService.updateQuantity(req.user!.id, cartItemId, data);
      res.json({ message: 'Cart updated', item });
    } catch (error: any) {
      if (
        error.message?.includes('not found') ||
        error.message?.includes('Insufficient stock')
      ) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cartItemId = parseInt(String(req.params.id));
      if (isNaN(cartItemId)) {
        res.status(400).json({ message: 'Invalid cart item ID' });
        return;
      }
      await cartService.removeItem(req.user!.id, cartItemId);
      res.json({ message: 'Item removed from cart' });
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cartService.clearCart(req.user!.id);
      res.json({ message: 'Cart cleared' });
    } catch (error) {
      next(error);
    }
  }

  async getCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await cartService.getCartCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
