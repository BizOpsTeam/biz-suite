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

export const getProductCategories = async (ownerId: string) => {
    return await prisma.category.findMany({
        where: { ownerId },
        select: { id: true, name: true, description: true, createdAt: true },
    });
};

export const getProductCategoryById = async (id: string, ownerId: string) => {
    return await prisma.category.findFirst({
        where: { id, ownerId },
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

export const deleteCategory = async (ownerId: string, categoryId: string) => {
    return await prisma.category.delete({
        where: {
            id: categoryId,
            ownerId: ownerId,
        },
    });
};
