import prisma from '../../config/db';
import { CreateProductInput, UpdateProductInput, ProductQuery } from './validation';
import { Prisma } from '@prisma/client';

export class ProductService {
  async getAll(query: ProductQuery) {
    const { page, limit, search, category, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllAdmin(query: ProductQuery) {
    const { page, limit, search, category, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  async create(data: CreateProductInput, imageUrl?: string) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        stockQuantity: data.stockQuantity,
        category: data.category || null,
        isActive: data.isActive,
        imageUrl: imageUrl || null,
      },
    });
  }

  async update(id: number, data: UpdateProductInput, imageUrl?: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Product not found');
    }

    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        price: data.price !== undefined ? data.price : undefined,
        ...(imageUrl && { imageUrl }),
      },
    });
  }

  async delete(id: number) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Product not found');
    }

    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getCategories() {
    const categories = await prisma.product.findMany({
      where: { isActive: true, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map((c) => c.category).filter(Boolean);
  }

  async bulkDelete() {
    return prisma.product.updateMany({
      where: {},
      data: { isActive: false },
    });
  }

  async bulkCreate(data: any[]) {
    return prisma.product.createMany({
      data: data.map(item => ({
        name: item.name,
        description: item.description || null,
        price: item.price,
        stockQuantity: item.stockQuantity,
        category: item.category || null,
        isActive: item.isActive !== undefined ? item.isActive : true,
      })),
    });
  }
}

export const productService = new ProductService();
