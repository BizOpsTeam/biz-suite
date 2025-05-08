import { IProductCategoryData, IProductData } from "../constants/types";
import prisma from "../config/db";

export const createProduct = async (productData: IProductData, userId: string ) => {    

  const userExists = await prisma.userModel.findUnique({
        where: { id: userId }
    });
    
    if (!userExists) {
        throw new Error(`User with ID ${userId} does not exist`);
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

export const createProductCategory = async (categoryData: IProductCategoryData) => {
    return await prisma.category.create({
        data: categoryData,
        select: { id: true, name: true, description: true, createdAt: true },
    })
}