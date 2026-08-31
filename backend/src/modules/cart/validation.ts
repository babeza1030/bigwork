import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.coerce.number().int().positive('Invalid product ID'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
});

export const updateCartSchema = z.object({
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
