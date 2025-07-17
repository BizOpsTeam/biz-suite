import prisma from "../config/db";
import AppError from "../errors/AppError";
import { UNAUTHORIZED, NOT_FOUND } from "../constants/http";

export const createExpenseCategory = async (data: { name: string; description?: string }, ownerId: string) => {
    return prisma.expenseCategory.create({
        data: { ...data, ownerId },
    });
};

export const getExpenseCategories = async (ownerId: string) => {
    return prisma.expenseCategory.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
    });
};

export const getExpenseCategoryById = async (id: string, ownerId: string) => {
    const category = await prisma.expenseCategory.findUnique({ where: { id } });
    if (!category || category.ownerId !== ownerId) throw new AppError(NOT_FOUND, "Category not found");
    return category;
};

export const updateExpenseCategory = async (id: string, ownerId: string, data: { name?: string; description?: string }) => {
    const category = await prisma.expenseCategory.findUnique({ where: { id } });
    if (!category || category.ownerId !== ownerId) throw new AppError(UNAUTHORIZED, "Unauthorized");
    return prisma.expenseCategory.update({ where: { id }, data });
};

export const deleteExpenseCategory = async (id: string, ownerId: string) => {
    const category = await prisma.expenseCategory.findUnique({ where: { id } });
    if (!category || category.ownerId !== ownerId) throw new AppError(UNAUTHORIZED, "Unauthorized");
    return prisma.expenseCategory.delete({ where: { id } });
}; 