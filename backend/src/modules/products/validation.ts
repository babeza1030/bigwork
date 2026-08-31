import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'id']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
