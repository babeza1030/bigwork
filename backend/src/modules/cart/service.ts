import prisma from '../../config/db';
import { AddToCartInput, UpdateCartInput } from './validation';

export class CartService {
  async getCart(userId: number) {
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stockQuantity: true,
            imageUrl: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const cartItems = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
      subtotal: Number(item.product.price) * item.quantity,
    }));

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return { items: cartItems, total, itemCount };
  }

  async addToCart(userId: number, data: AddToCartInput) {
    // Check product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || !product.isActive) {
      throw new Error('Product not found or unavailable');
    }

    // Check stock
    if (product.stockQuantity < data.quantity) {
      throw new Error(`Insufficient stock. Only ${product.stockQuantity} items available.`);
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: data.productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + data.quantity;
      if (newQuantity > product.stockQuantity) {
        throw new Error(`Insufficient stock. Only ${product.stockQuantity} items available.`);
      }

      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });
    }

    return prisma.cartItem.create({
      data: {
        userId,
        productId: data.productId,
        quantity: data.quantity,
      },
      include: { product: true },
    });
  }

  async updateQuantity(userId: number, cartItemId: number, data: UpdateCartInput) {
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
      include: { product: true },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (data.quantity > cartItem.product.stockQuantity) {
      throw new Error(
        `Insufficient stock. Only ${cartItem.product.stockQuantity} items available.`
      );
    }

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: data.quantity },
      include: { product: true },
    });
  }

  async removeItem(userId: number, cartItemId: number) {
    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    return prisma.cartItem.delete({ where: { id: cartItemId } });
  }

  async clearCart(userId: number) {
    return prisma.cartItem.deleteMany({ where: { userId } });
  }

  async getCartCount(userId: number) {
    const result = await prisma.cartItem.aggregate({
      where: { userId },
      _sum: { quantity: true },
    });
    return result._sum.quantity || 0;
  }
}

export const cartService = new CartService();
