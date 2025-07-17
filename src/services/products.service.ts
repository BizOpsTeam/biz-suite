import { IProductCategoryData, IProductData } from "../constants/types";
import prisma from "../config/db";
import AppError from "../errors/AppError";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";

export const createProduct = async (
    productData: IProductData,
    userId: string,
) => {
    const userExists = await prisma.userModel.findUnique({
        where: { id: userId },
    });

    if (!userExists) {
        throw new AppError(UNAUTHORIZED, "Unauthorized to perform this action");
    }

    return await prisma.product.create({
        data: {
            ...productData,
            ownerId: userId,
            cost: productData.cost, // ensure cost is stored
            images: productData.images
                ? {
                      create: productData.images.map((image) => ({
                          url: image,
                      })),
                  }
                : undefined,
        },
        select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            category: true,
            description: true,
            images: true,
            createdAt: true,
            cost: true, // include cost in returned data
        },
    });
};

export const getProductById = async (prodcutId: string, userId: string) => {
    return await prisma.product.findFirst({
        where: {
            id: prodcutId,
            ownerId: userId,
        },
    });
};

export interface ProductsQuery {
  ownerId: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sort?: string; // e.g., 'createdAt:desc'
  page?: number;
  limit?: number;
}

export const getMyProducts = async (query: ProductsQuery) => {
  const {
    ownerId,
    categoryId,
    minPrice,
    maxPrice,
    inStock,
    search,
    sort = 'createdAt:desc',
    page = 1,
    limit = 20,
  } = query;

  const where: any = { ownerId };
  if (categoryId) where.categoryId = categoryId;
  if (typeof minPrice === 'number') where.price = { ...where.price, gte: minPrice };
  if (typeof maxPrice === 'number') where.price = { ...where.price, lte: maxPrice };
  if (typeof inStock === 'boolean') where.stock = inStock ? { gt: 0 } : 0;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Sorting
  let orderBy: any = { createdAt: 'desc' };
  if (sort) {
    const [field, direction] = sort.split(':');
    orderBy = { [field]: direction === 'asc' ? 'asc' : 'desc' };
  }

  // Pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Query with count for pagination
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        category: true,
        description: true,
        images: true,
        createdAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const updateProduct = async (
    productId: string,
    userId: string,
    updateData: Partial<IProductData>
) => {
    // Ensure the product exists and belongs to the user
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });
    if (!product || product.ownerId !== userId) {
        throw new AppError(UNAUTHORIZED, "Unauthorized to update this product");
    }
    // Only include defined fields
    const data: any = {};
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.price !== undefined) data.price = updateData.price;
    if (updateData.stock !== undefined) data.stock = updateData.stock;
    if (updateData.categoryId !== undefined) data.categoryId = updateData.categoryId;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.cost !== undefined) data.cost = updateData.cost;
    // Images update logic can be added here if needed
    return await prisma.product.update({
        where: { id: productId },
        data,
        select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            category: true,
            description: true,
            images: true,
            createdAt: true,
            cost: true,
        },
    });
};
