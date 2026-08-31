import { z } from 'zod';

export const createOrderSchema = z.object({
  shippingAddress: z.string().min(1, 'Shipping address is required'),
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
