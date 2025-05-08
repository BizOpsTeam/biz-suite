import { IProductCategoryData, IProductData } from "../constants/types";
import prisma from "../config/db";

export const createProduct = async (productData: IProductData ) => {    
    return await prisma.product.create({
        data: productData,
        select: { id: true, name: true, price: true, stock: true, category: true, description: true, images: true, createdAt: true },
    })
}

export const createProductCategory = async (categoryData: IProductCategoryData) => {
    return await prisma.category.create({
        data: categoryData,
        select: { id: true, name: true, description: true, createdAt: true },
    })
}