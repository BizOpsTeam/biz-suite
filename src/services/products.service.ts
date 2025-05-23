import { IProductCategoryData, IProductData } from "../constants/types";
import prisma from "../config/db";
import AppError from "../errors/AppError";
import { CONFLICT, UNAUTHORIZED } from "../constants/http";

export const createProduct = async (productData: IProductData, userId: string ) => {    

  const userExists = await prisma.userModel.findUnique({
        where: { id: userId }
    });
    
    if (!userExists) {
        throw new AppError(UNAUTHORIZED, "Unauthorized to perform this action")
    }

    return await prisma.product.create({
        data: {
            ...productData,
            ownerId: userId,
            images: productData.images ? { create: productData.images.map((image) => ({ url: image })) } : undefined,
        },
        select: { id: true, name: true, price: true, stock: true, category: true, description: true, images: true, createdAt: true },
    })
}

export const getProductById = async (prodcutId: string, userId: string) => {
    return await prisma.product.findFirst({
        where: {
            id: prodcutId,
            ownerId: userId
        }
    })
}

export const createProductCategory = async (categoryData: IProductCategoryData, ownerId: string) => {
    return await prisma.category.create({
        data: {
            ...categoryData,
            ownerId: ownerId
        },
        select: { id: true, name: true, description: true, createdAt: true },
    })
}

export const getProductCategories = async () => {
    return await prisma.category.findMany({
        select: { id: true, name: true, description: true, createdAt: true },
    })
}

export const getProductCategoryById = async (id: string) => {
    return await prisma.category.findUnique({
        where: { id },
        select: { id: true, name: true, description: true, createdAt: true },
    })
}

export const getMyProducts = async (userId: string) => {
    return await prisma.product.findMany({
        where: { ownerId: userId },
        select: { id: true, name: true, price: true, stock: true, category: true, description: true, images: true, createdAt: true },
    })
}

export const updateCategory = async(ownerId: string, categoryId: string, updateData: { name?: string; description?: string}) => {
    return await prisma.category.update({
        where: {
            id: categoryId,
            ownerId: ownerId
        },
        data: {
            ...updateData
        }
    })
}