import { Response, NextFunction } from 'express';
import { orderService } from './service';
import { createOrderSchema } from './validation';
import { AuthRequest } from '../../middleware/auth';

export class OrderController {
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(req.user!.id, data);
      res.status(201).json({
        message: 'Order created successfully',
        order,
      });
    } catch (error: any) {
      if (
        error.message?.includes('Cart is empty') ||
        error.message?.includes('Stock verification failed')
      ) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getOrders(req.user!.id, req.user!.role);
      res.json({ orders });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(String(req.params.id));
      if (isNaN(orderId)) {
        res.status(400).json({ message: 'Invalid order ID' });
        return;
      }
      const order = await orderService.getOrderById(orderId, req.user!.id, req.user!.role);
      res.json({ order });
    } catch (error: any) {
      if (error.message === 'Order not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message === 'Access denied') {
        res.status(403).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(String(req.params.id));
      if (isNaN(orderId)) {
        res.status(400).json({ message: 'Invalid order ID' });
        return;
      }
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(orderId, status);
      res.json({ message: 'Order status updated', order });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
