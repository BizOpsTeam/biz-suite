import prisma from "../config/db";
import { IProductCategoryData } from "../constants/types";

export const createProductCategory = async (
    categoryData: IProductCategoryData,
    ownerId: string,
) => {
    return await prisma.category.create({
        data: {
            ...categoryData,
            ownerId: ownerId,
        },
        select: { id: true, name: true, description: true, createdAt: true },
    });
};

export const getProductCategories = async () => {
    return await prisma.category.findMany({
        select: { id: true, name: true, description: true, createdAt: true },
    });
};

export const getProductCategoryById = async (id: string) => {
    return await prisma.category.findUnique({
        where: { id },
        select: { id: true, name: true, description: true, createdAt: true },
    });
};

export const updateCategory = async (
    ownerId: string,
    categoryId: string,
    updateData: { name?: string; description?: string },
) => {
    return await prisma.category.update({
        where: {
            id: categoryId,
            ownerId: ownerId,
        },
        data: {
            ...updateData,
        },
    });
}; 