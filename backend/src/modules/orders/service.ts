import prisma from '../../config/db';
import { CreateOrderInput } from './validation';

const TAX_RATE = 0.07; // VAT 7%

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `SO${year}${month}${day}-${random}`;
}

export class OrderService {
  async createOrder(userId: number, data: CreateOrderInput) {
    // Use a transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      // 1. Get all cart items with product details
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // 2. Verify stock for ALL items
      const stockErrors: string[] = [];
      for (const item of cartItems) {
        if (!item.product.isActive) {
          stockErrors.push(`${item.product.name} is no longer available`);
        } else if (item.product.stockQuantity < item.quantity) {
          stockErrors.push(
            `${item.product.name}: requested ${item.quantity}, only ${item.product.stockQuantity} in stock`
          );
        }
      }

      if (stockErrors.length > 0) {
        throw new Error(`Stock verification failed:\n${stockErrors.join('\n')}`);
      }

      // 3. Calculate totals
      let totalAmount = 0;
      const orderItemsData = cartItems.map((item) => {
        const unitPrice = Number(item.product.price);
        const subtotal = unitPrice * item.quantity;
        totalAmount += subtotal;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          subtotal,
        };
      });

      const taxAmount = totalAmount * TAX_RATE;
      const grandTotal = totalAmount + taxAmount;

      // 4. Create the order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          totalAmount,
          taxAmount,
          grandTotal,
          shippingAddress: data.shippingAddress,
          notes: data.notes || null,
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: {
            include: { product: true },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
              address: true,
            },
          },
        },
      });

      // 5. Deduct stock for each product
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 6. Clear the cart
      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  }

  async getOrders(userId: number, role: string) {
    const where = role === 'ADMIN' ? {} : { userId };

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  async getOrderById(orderId: number, userId: number, role: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            address: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Non-admin users can only view their own orders
    if (role !== 'ADMIN' && order.userId !== userId) {
      throw new Error('Access denied');
    }

    return order;
  }

  async updateOrderStatus(orderId: number, status: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });
  }
}

export const orderService = new OrderService();
