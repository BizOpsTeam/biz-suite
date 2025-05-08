import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().min(3).max(50),
  stock: z.number().int().nonnegative(),
  images: z.array(z.string()).optional(),
});

export const productCategorySchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional(),
});